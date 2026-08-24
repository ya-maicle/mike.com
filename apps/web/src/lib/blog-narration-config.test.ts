import { describe, expect, it } from 'vitest'

import {
  blogNarrationChunkLimit,
  DEFAULT_BLOG_NARRATION_MODEL,
  DEFAULT_BLOG_NARRATION_VOICE_ID,
  DEFAULT_BLOG_NARRATION_VOICE_NAME,
} from '@/lib/blog-narration-config'

describe('blog narration configuration', () => {
  it('uses Eleven v3 with the James narrative voice by default', () => {
    expect(DEFAULT_BLOG_NARRATION_MODEL).toBe('eleven_v3')
    expect(DEFAULT_BLOG_NARRATION_VOICE_ID).toBe('EkK5I93UQWFDigLMpZcX')
    expect(DEFAULT_BLOG_NARRATION_VOICE_NAME).toContain('James')
  })

  it('keeps Eleven v3 chunks below its 5,000-character request limit', () => {
    expect(blogNarrationChunkLimit('eleven_v3')).toBe(4_500)
    expect(blogNarrationChunkLimit('eleven_multilingual_v2')).toBe(9_000)
  })
})
