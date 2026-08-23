import { describe, expect, it } from 'vitest'

import { SEO_PAGE_TITLE_MAX_LENGTH, SITE_CONFIG, SITE_TITLE_SUFFIX } from '@/lib/constants'
import {
  absoluteUrl,
  createPageMetadata,
  DEFAULT_SOCIAL_IMAGE,
  firstMetadataText,
  normalizeMetadataText,
} from '@/lib/seo'

describe('SEO metadata', () => {
  it('builds URLs against the production domain', () => {
    expect(absoluteUrl('/work/example')).toBe('https://mikeiu.com/work/example')
  })

  it('provides canonical, Open Graph, Twitter, and crawler metadata', () => {
    const metadata = createPageMetadata({
      title: 'Example Case Study',
      description: 'A concise description of the example case study.',
      path: '/work/example',
      type: 'article',
      publishedTime: '2026-01-02T00:00:00.000Z',
    })

    expect(metadata.alternates).toEqual({
      canonical: 'https://mikeiu.com/work/example',
    })
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      title: 'Example Case Study',
      url: 'https://mikeiu.com/work/example',
      siteName: SITE_CONFIG.name,
      images: [DEFAULT_SOCIAL_IMAGE],
      publishedTime: '2026-01-02T00:00:00.000Z',
    })
    expect(metadata.twitter).toMatchObject({
      card: 'summary_large_image',
      images: [
        {
          url: DEFAULT_SOCIAL_IMAGE.url,
          alt: DEFAULT_SOCIAL_IMAGE.alt,
        },
      ],
    })
    expect(metadata.robots).toMatchObject({ index: true, follow: true })
  })

  it('keeps private utility pages out of search results', () => {
    const metadata = createPageMetadata({
      title: 'Login',
      description: 'Sign in.',
      path: '/login',
      noIndex: true,
      noFollow: true,
    })

    expect(metadata.robots).toEqual({ index: false, follow: false, nocache: true })
  })

  it('normalizes CMS text before it reaches search and social tags', () => {
    const metadata = createPageMetadata({
      title: '  Example\n  title  ',
      description: 'First line.\n\n  Second line.',
      path: '/example',
      image: {
        url: 'https://example.com/social.jpg',
        alt: '  Descriptive\n image text ',
      },
    })

    expect(metadata.title).toBe('Example title')
    expect(metadata.description).toBe('First line. Second line.')
    expect(metadata.openGraph).toMatchObject({
      title: 'Example title',
      description: 'First line. Second line.',
      images: [{ alt: 'Descriptive image text' }],
    })
    expect(metadata.twitter).toMatchObject({
      title: 'Example title',
      description: 'First line. Second line.',
      images: [{ alt: 'Descriptive image text' }],
    })
  })

  it('supports concise absolute document titles without changing social titles', () => {
    const metadata = createPageMetadata({
      title: 'Time & Place',
      description: 'A product design case study.',
      path: '/work/tap',
      absoluteTitle: true,
      type: 'article',
    })

    expect(metadata.title).toEqual({ absolute: 'Time & Place' })
    expect(metadata.openGraph).toMatchObject({ title: 'Time & Place' })
    expect(metadata.twitter).toMatchObject({ title: 'Time & Place' })
  })

  it('treats whitespace-only CMS values as missing', () => {
    expect(normalizeMetadataText('  First\n second  ')).toBe('First second')
    expect(firstMetadataText(' \n ', undefined, ' Fallback ')).toBe('Fallback')
  })

  it('reserves title space for the site-name suffix', () => {
    expect(SEO_PAGE_TITLE_MAX_LENGTH + SITE_TITLE_SUFFIX.length).toBe(60)
  })
})
