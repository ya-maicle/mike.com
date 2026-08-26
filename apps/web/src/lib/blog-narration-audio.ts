const OUTPUT_FORMAT = 'mp3_44100_128'

type Alignment = {
  character_end_times_seconds?: unknown
}

type ElevenLabsTimingResponse = {
  audio_base64?: unknown
  alignment?: Alignment | null
  normalized_alignment?: Alignment | null
}

function alignmentDuration(payload: ElevenLabsTimingResponse) {
  const rawEndTimes =
    payload.normalized_alignment?.character_end_times_seconds ??
    payload.alignment?.character_end_times_seconds
  if (!Array.isArray(rawEndTimes)) return undefined

  const lastEndTime = rawEndTimes.at(-1)
  return typeof lastEndTime === 'number' && Number.isFinite(lastEndTime) && lastEndTime > 0
    ? lastEndTime
    : undefined
}

function id3v2Size(audio: Buffer) {
  if (audio.length < 10 || audio.toString('ascii', 0, 3) !== 'ID3') return 0

  const tagSize =
    ((audio[6] & 0x7f) << 21) |
    ((audio[7] & 0x7f) << 14) |
    ((audio[8] & 0x7f) << 7) |
    (audio[9] & 0x7f)
  const hasFooter = (audio[5] & 0x10) !== 0
  return Math.min(audio.length, 10 + tagSize + (hasFooter ? 10 : 0))
}

/** Removes per-response metadata before joining matching MP3 frame streams. */
export function stripMp3Metadata(audio: Buffer) {
  const start = id3v2Size(audio)
  const hasId3v1 =
    audio.length - start >= 128 &&
    audio.toString('ascii', audio.length - 128, audio.length - 125) === 'TAG'
  return audio.subarray(start, hasId3v1 ? audio.length - 128 : audio.length)
}

async function synthesizeChunk({
  apiRoot,
  apiKey,
  voiceId,
  model,
  text,
  previousText,
  nextText,
}: {
  apiRoot: string
  apiKey: string
  voiceId: string
  model: string
  text: string
  previousText?: string
  nextText?: string
}) {
  const url = new URL(`${apiRoot}/v1/text-to-speech/${voiceId}/with-timestamps`)
  url.searchParams.set('output_format', OUTPUT_FORMAT)
  const supportsTextContext = model !== 'eleven_v3'
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
    body: JSON.stringify({
      text,
      model_id: model,
      ...(supportsTextContext && previousText ? { previous_text: previousText } : {}),
      ...(supportsTextContext && nextText ? { next_text: nextText } : {}),
    }),
  })
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300)
    throw new Error(`ElevenLabs generation failed (${response.status}): ${detail}`)
  }

  const payload = (await response.json()) as ElevenLabsTimingResponse
  if (typeof payload.audio_base64 !== 'string') {
    throw new Error('ElevenLabs returned no audio.')
  }
  const durationSeconds = alignmentDuration(payload)
  if (!durationSeconds) throw new Error('ElevenLabs returned no audio duration.')

  const audio = stripMp3Metadata(Buffer.from(payload.audio_base64, 'base64'))
  if (!audio.length) throw new Error('ElevenLabs returned an empty audio file.')
  return { audio, durationSeconds }
}

export async function generateNarrationAudio({
  apiRoot,
  apiKey,
  voiceId,
  model,
  chunks,
  onProgress,
}: {
  apiRoot: string
  apiKey: string
  voiceId: string
  model: string
  chunks: string[]
  onProgress?: (line: string) => void
}) {
  const audioChunks: Buffer[] = []
  let durationSeconds = 0

  for (const [index, chunk] of chunks.entries()) {
    onProgress?.(`Generating chunk ${index + 1}/${chunks.length}…`)
    const generated = await synthesizeChunk({
      apiRoot,
      apiKey,
      voiceId,
      model,
      text: chunk,
      previousText: chunks[index - 1]?.slice(-1_000),
      nextText: chunks[index + 1]?.slice(0, 1_000),
    })
    audioChunks.push(generated.audio)
    durationSeconds += generated.durationSeconds
  }

  if (!audioChunks.length || durationSeconds <= 0) {
    throw new Error('The narration produced no audio.')
  }
  return { audio: Buffer.concat(audioChunks), durationSeconds }
}
