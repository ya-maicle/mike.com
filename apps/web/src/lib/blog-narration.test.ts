import { describe, expect, it } from 'vitest'

import {
  buildBlogNarrationScript,
  normalizeNarrationText,
  secondsToIsoDuration,
  splitNarrationScript,
} from '@/lib/blog-narration'

describe('blog narration', () => {
  it('derives a clean script from portable text without repeating an excerpt-led introduction', () => {
    expect(
      buildBlogNarrationScript({
        title: 'Designing with agents',
        excerpt: 'A practical field note.',
        content: [
          {
            _type: 'block',
            children: [{ text: 'A practical field note. Here is what changed.' }],
          },
          { _type: 'imageBlock' },
          { _type: 'block', children: [{ text: 'The second idea.' }] },
        ],
      }),
    ).toBe(
      'Designing with agents\n\nA practical field note. Here is what changed.\n\nThe second idea.',
    )
  })

  it('uses an editorial override verbatim after whitespace normalization', () => {
    expect(
      buildBlogNarrationScript({
        title: 'Ignored',
        scriptOverride: '  A custom   opening.\r\n\r\nA custom ending.  ',
      }),
    ).toBe('A custom opening.\n\nA custom ending.')
  })

  it('splits long scripts on paragraph and sentence boundaries', () => {
    const chunks = splitNarrationScript(
      `${'First sentence. '.repeat(10)}\n\n${'Second paragraph. '.repeat(10)}`,
      100,
    )

    expect(chunks.length).toBeGreaterThan(2)
    expect(chunks.every((chunk) => chunk.length <= 100)).toBe(true)
    expect(normalizeNarrationText(chunks.join('\n\n'))).toContain('Second paragraph.')
  })

  it('formats durations for AudioObject structured data', () => {
    expect(secondsToIsoDuration(0)).toBe('PT0S')
    expect(secondsToIsoDuration(62)).toBe('PT1M2S')
    expect(secondsToIsoDuration(3_661)).toBe('PT1H1M1S')
  })
})
