import { afterEach, describe, expect, it, vi } from 'vitest'

import { generateNarrationAudio, stripMp3Metadata } from '@/lib/blog-narration-audio'

describe('blog narration audio', () => {
  afterEach(() => vi.unstubAllGlobals())

  it('removes ID3 metadata before MP3 chunks are joined', () => {
    const id3v2 = Buffer.from([
      0x49, 0x44, 0x33, 0x04, 0x00, 0x00, 0x00, 0x00, 0x00, 0x04, 0x54, 0x45, 0x53, 0x54,
    ])
    const frames = Buffer.from([0xff, 0xfb, 0x90, 0x64])
    const id3v1 = Buffer.concat([Buffer.from('TAG'), Buffer.alloc(125)])

    expect(stripMp3Metadata(Buffer.concat([id3v2, frames, id3v1]))).toEqual(frames)
  })

  it('leaves an untagged MP3 stream untouched', () => {
    const frames = Buffer.from([0xff, 0xfb, 0x90, 0x64])
    expect(stripMp3Metadata(frames)).toEqual(frames)
  })

  it('joins timestamped ElevenLabs chunks and totals their duration', async () => {
    const audioChunks = [Buffer.from([0xff, 0xfb, 0x01]), Buffer.from([0xff, 0xfb, 0x02])]
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() =>
        Promise.resolve(
          Response.json({
            audio_base64: audioChunks[0].toString('base64'),
            alignment: { character_end_times_seconds: [1.25] },
          }),
        ),
      )
      .mockImplementationOnce(() =>
        Promise.resolve(
          Response.json({
            audio_base64: audioChunks[1].toString('base64'),
            normalized_alignment: { character_end_times_seconds: [2.5] },
          }),
        ),
      )
    vi.stubGlobal('fetch', fetchMock)

    const result = await generateNarrationAudio({
      apiRoot: 'https://api.example.com',
      apiKey: 'test-key',
      voiceId: 'voice',
      model: 'eleven_multilingual_v2',
      chunks: ['First.', 'Second.'],
    })

    expect(result.audio).toEqual(Buffer.concat(audioChunks))
    expect(result.durationSeconds).toBe(3.75)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(String(fetchMock.mock.calls[0]?.[0])).toContain('/with-timestamps')
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      text: 'First.',
      model_id: 'eleven_multilingual_v2',
      next_text: 'Second.',
    })
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      text: 'Second.',
      model_id: 'eleven_multilingual_v2',
      previous_text: 'First.',
    })
  })

  it('omits unsupported text context when generating with Eleven v3', async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        Response.json({
          audio_base64: Buffer.from([0xff, 0xfb, 0x01]).toString('base64'),
          alignment: { character_end_times_seconds: [1] },
        }),
      ),
    )
    vi.stubGlobal('fetch', fetchMock)

    await generateNarrationAudio({
      apiRoot: 'https://api.example.com',
      apiKey: 'test-key',
      voiceId: 'voice',
      model: 'eleven_v3',
      chunks: ['First.', 'Second.'],
    })

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      text: 'First.',
      model_id: 'eleven_v3',
    })
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      text: 'Second.',
      model_id: 'eleven_v3',
    })
  })
})
