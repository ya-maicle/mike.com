import type { MetadataRoute } from 'next'

import { SITE_CONFIG } from '@/lib/constants'
import { sanityFetch } from '@/sanity/client'

type SitemapDocument = {
  _type: 'page' | 'program' | 'caseStudy' | 'blogPost'
  slug: string
  lastModified?: string
}

const excludedPageSlugs = new Set([
  'cookie-policy',
  'blog',
  'login',
  'privacy',
  'stories',
  'strengths',
  'terms',
  'work',
])

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const documents = await sanityFetch<SitemapDocument[]>(
    `*[
      _type in ["page", "program", "caseStudy", "blogPost"] &&
      defined(slug.current) &&
      (_type != "blogPost" || (defined(publishedAt) && publishedAt <= now()))
    ]{
      _type,
      "slug": slug.current,
      "lastModified": coalesce(_updatedAt, publishedAt)
    }`,
    {},
    { tag: 'sitemap', revalidate: 300 },
  )

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_CONFIG.url,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_CONFIG.url}/work`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_CONFIG.url}/blog`,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${SITE_CONFIG.url}/strengths`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ]

  const contentRoutes: MetadataRoute.Sitemap = documents.flatMap((document) => {
    if (document._type === 'page' && excludedPageSlugs.has(document.slug)) return []

    const prefix =
      document._type === 'caseStudy'
        ? '/work/'
        : document._type === 'program'
          ? '/strengths/'
          : document._type === 'blogPost'
            ? '/blog/'
            : '/'

    return [
      {
        url: new URL(`${prefix}${document.slug}`, SITE_CONFIG.url).toString(),
        lastModified: document.lastModified,
        changeFrequency: 'monthly' as const,
        priority: document._type === 'caseStudy' || document._type === 'blogPost' ? 0.8 : 0.7,
      },
    ]
  })

  return [...staticRoutes, ...contentRoutes]
}
