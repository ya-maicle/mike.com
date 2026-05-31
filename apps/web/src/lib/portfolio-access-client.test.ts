import { describe, expect, it } from 'vitest'

import { isCaseStudyPath, withAccessDenied } from '@/lib/portfolio-access-client'

describe('portfolio access client helpers', () => {
  it('detects case study detail paths', () => {
    expect(isCaseStudyPath('/work/example')).toBe(true)
    expect(isCaseStudyPath('/work/example?access=denied')).toBe(true)
    expect(isCaseStudyPath('/work')).toBe(false)
  })

  it('adds an access denied marker to safe relative paths', () => {
    expect(withAccessDenied('/work/example')).toBe('/work/example?access=denied')
    expect(withAccessDenied('/work/example?foo=bar#top')).toBe(
      '/work/example?foo=bar&access=denied#top',
    )
    expect(withAccessDenied('https://example.com/work/example')).toBe('/')
  })
})
