import { describe, expect, it } from 'vitest'

import robots from '@/app/robots'
import { getBlogPostStructuredData, getSiteStructuredData } from '@/components/site-structured-data'
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

  it('connects blog posts to the site and author identity', () => {
    const data = getBlogPostStructuredData({
      title: 'Designing with agents',
      description: 'A practical field note.',
      path: '/blog/designing-with-agents',
      publishedAt: '2026-08-24T12:00:00.000Z',
      imageUrl: 'https://example.com/cover.jpg',
    })

    expect(data).toMatchObject({
      '@type': 'BlogPosting',
      url: `${SITE_CONFIG.url}/blog/designing-with-agents`,
      author: { '@id': `${SITE_CONFIG.url}/#person` },
      publisher: { '@id': `${SITE_CONFIG.url}/#person` },
      isPartOf: { '@id': `${SITE_CONFIG.url}/#website` },
      image: 'https://example.com/cover.jpg',
    })
  })
})
