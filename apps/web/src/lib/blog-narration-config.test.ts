import { describe, expect, it } from 'vitest'

import {
  blogNarrationChunkLimit,
  DEFAULT_BLOG_NARRATION_MODEL,
  DEFAULT_BLOG_NARRATION_VOICE_ID,
  DEFAULT_BLOG_NARRATION_VOICE_NAME,
  resolveBlogNarrationConfiguration,
} from '@/lib/blog-narration-config'

describe('blog narration configuration', () => {
  it('uses stable Eleven Multilingual v2 with the James narrative voice by default', () => {
    expect(DEFAULT_BLOG_NARRATION_MODEL).toBe('eleven_multilingual_v2')
    expect(DEFAULT_BLOG_NARRATION_VOICE_ID).toBe('EkK5I93UQWFDigLMpZcX')
    expect(DEFAULT_BLOG_NARRATION_VOICE_NAME).toContain('James')
  })

  it('keeps v3 and Multilingual v2 chunks below their request limits', () => {
    expect(blogNarrationChunkLimit('eleven_v3')).toBe(4_500)
    expect(blogNarrationChunkLimit('eleven_multilingual_v2')).toBe(9_000)
  })

  it('resolves required server configuration and trims deployed values', () => {
    expect(
      resolveBlogNarrationConfiguration({
        NEXT_PUBLIC_SANITY_PROJECT_ID: ' project ',
        NEXT_PUBLIC_SANITY_DATASET: ' production ',
        SANITY_API_WRITE_TOKEN: ' write-token ',
        ELEVENLABS_API_KEY: ' eleven-key ',
      }),
    ).toEqual({
      sanity: {
        projectId: 'project',
        dataset: 'production',
        token: 'write-token',
      },
      elevenLabs: {
        apiKey: 'eleven-key',
        voiceId: DEFAULT_BLOG_NARRATION_VOICE_ID,
        voiceName: DEFAULT_BLOG_NARRATION_VOICE_NAME,
        model: DEFAULT_BLOG_NARRATION_MODEL,
      },
    })
  })

  it('reports every missing deployed variable before generation starts', () => {
    expect(() =>
      resolveBlogNarrationConfiguration({
        NEXT_PUBLIC_SANITY_PROJECT_ID: 'project',
        NEXT_PUBLIC_SANITY_DATASET: ' ',
      }),
    ).toThrowError(
      'Narration generation is not configured. Missing server variables: NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN, ELEVENLABS_API_KEY.',
    )
  })
})
