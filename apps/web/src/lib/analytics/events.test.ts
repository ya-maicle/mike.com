import { describe, expect, it } from 'vitest'
import {
  contextSlugForPath,
  meetsCaseStudyEngagementThreshold,
  pageTypeForPath,
  requestedStudySlugFromPath,
} from '@/lib/analytics/events'

describe('analytics route classification', () => {
  it.each([
    ['/', 'home'],
    ['/work', 'work_index'],
    ['/work/tap', 'case_study'],
    ['/strengths', 'strengths_index'],
    ['/strengths/product-direction', 'strength_detail'],
    ['/bio', 'bio'],
    ['/login', 'login'],
    ['/privacy', 'legal'],
    ['/cookie-policy', 'legal'],
    ['/anything-else', 'other'],
  ])('classifies %s as %s', (pathname, expected) => {
    expect(pageTypeForPath(pathname)).toBe(expected)
  })

  it('extracts only safe content slugs from supported paths', () => {
    expect(contextSlugForPath('/work/checkout')).toBe('checkout')
    expect(contextSlugForPath('/strengths/design-systems')).toBe('design-systems')
    expect(contextSlugForPath('/privacy')).toBeUndefined()
    expect(requestedStudySlugFromPath('/work/private?k=secret#details')).toBe('private')
    expect(requestedStudySlugFromPath('https://example.com/work/private?code=oauth')).toBe(
      'private',
    )
  })

  it('requires both 30 visible seconds and 50 percent scroll depth for engagement', () => {
    expect(meetsCaseStudyEngagementThreshold(29_999, 0.5)).toBe(false)
    expect(meetsCaseStudyEngagementThreshold(30_000, 0.49)).toBe(false)
    expect(meetsCaseStudyEngagementThreshold(30_000, 0.5)).toBe(true)
  })
})
