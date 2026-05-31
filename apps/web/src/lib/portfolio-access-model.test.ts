import { describe, expect, it } from 'vitest'

import { getEmailDomain, isProfileActive, normalizeEmailDomain } from '@/lib/portfolio-access-model'

describe('portfolio access model helpers', () => {
  it('normalizes email domains', () => {
    expect(normalizeEmailDomain(' @Airbnb.COM ')).toBe('airbnb.com')
    expect(getEmailDomain('person@Example.ORG')).toBe('example.org')
  })

  it('treats only enabled non-expired profiles as active', () => {
    expect(
      isProfileActive({
        _id: 'profile-1',
        companyName: 'Airbnb',
        slug: 'airbnb',
        accessStatus: 'enabled',
      }),
    ).toBe(true)
    expect(
      isProfileActive({
        _id: 'profile-2',
        companyName: 'Meta',
        slug: 'meta',
        accessStatus: 'blocked',
      }),
    ).toBe(false)
    expect(
      isProfileActive({
        _id: 'profile-3',
        companyName: 'Expired',
        slug: 'expired',
        accessStatus: 'enabled',
        expiresAt: '2000-01-01T00:00:00.000Z',
      }),
    ).toBe(false)
  })
})
