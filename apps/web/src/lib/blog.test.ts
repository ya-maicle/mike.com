import { describe, expect, it } from 'vitest'

import { formatBlogDate } from '@/lib/blog'

describe('blog presentation helpers', () => {
  it('formats publish dates consistently across server time zones', () => {
    expect(formatBlogDate('2026-08-24T23:30:00.000Z')).toBe('Aug 24, 2026')
  })
})
