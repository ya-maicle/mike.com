import { describe, expect, it } from 'vitest'

import {
  EXPECTED_STRENGTH_COUNT,
  shouldIndexBlogArchive,
  shouldIndexStrengthsArchive,
  strengthsArchiveDescription,
} from '@/lib/search-indexing'

describe('search archive indexing', () => {
  it('indexes the blog archive only after an article is published', () => {
    expect(shouldIndexBlogArchive(0)).toBe(false)
    expect(shouldIndexBlogArchive(1)).toBe(true)
  })

  it('indexes the strengths archive only when all promised strengths exist', () => {
    expect(shouldIndexStrengthsArchive(EXPECTED_STRENGTH_COUNT - 1)).toBe(false)
    expect(shouldIndexStrengthsArchive(EXPECTED_STRENGTH_COUNT)).toBe(true)
  })

  it('does not claim that five strengths exist while the archive is incomplete', () => {
    expect(strengthsArchiveDescription(1)).toBe(
      'A product design leadership strength grounded in a clear purpose and real examples.',
    )
    expect(strengthsArchiveDescription(EXPECTED_STRENGTH_COUNT)).toBe(
      'Five things I do well. Each one with a clear purpose and real examples behind it.',
    )
  })
})
