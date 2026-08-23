import { describe, expect, it } from 'vitest'

import robots from '@/app/robots'
import { getSiteStructuredData } from '@/components/site-structured-data'
import { SITE_CONFIG } from '@/lib/constants'

describe('SEO surface contracts', () => {
  it('allows noindex pages to be crawled while excluding API routes', () => {
    const config = robots()
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules]
    const disallowed = rules.flatMap((rule) => rule.disallow ?? [])

    expect(disallowed).toEqual(['/api/'])
    expect(disallowed).not.toContain('/login')
    expect(disallowed).not.toContain('/studio/')
    expect(disallowed).not.toContain('/debug/')
    expect(disallowed).not.toContain('/deck')
    expect(config.sitemap).toBe(`${SITE_CONFIG.url}/sitemap.xml`)
  })

  it('emits one connected homepage identity graph', () => {
    const profileImage = 'https://example.com/profile.jpg'
    const data = getSiteStructuredData([profileImage])

    expect(data).toMatchObject({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': `${SITE_CONFIG.url}/#person`,
          image: [profileImage],
        },
        {
          '@type': 'WebSite',
          '@id': `${SITE_CONFIG.url}/#website`,
          publisher: { '@id': `${SITE_CONFIG.url}/#person` },
        },
        {
          '@type': 'ProfilePage',
          isPartOf: { '@id': `${SITE_CONFIG.url}/#website` },
          mainEntity: { '@id': `${SITE_CONFIG.url}/#person` },
        },
      ],
    })
  })
})
