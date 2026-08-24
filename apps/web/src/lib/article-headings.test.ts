import { describe, expect, it } from 'vitest'

import { articleHeadingId, extractArticleHeadings } from '@/lib/article-headings'

describe('article headings', () => {
  it('builds stable URL-safe section ids', () => {
    expect(articleHeadingId('What’s next?')).toBe('whats-next')
    expect(articleHeadingId('Design systems — at scale')).toBe('design-systems-at-scale')
  })

  it('extracts second-level headings in article order', () => {
    expect(
      extractArticleHeadings([
        { _type: 'block', style: 'normal', children: [{ text: 'Introduction' }] },
        { _type: 'block', style: 'h2', children: [{ text: 'First ' }, { text: 'section' }] },
        { _type: 'imageBlock' },
        { _type: 'block', style: 'h2', children: [{ text: 'What’s next?' }] },
      ]),
    ).toEqual([
      { id: 'first-section', text: 'First section' },
      { id: 'whats-next', text: 'What’s next?' },
    ])
  })
})
