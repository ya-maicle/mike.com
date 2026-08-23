import type { Metadata } from 'next'

import { SITE_CONFIG } from '@/lib/constants'

export const DEFAULT_SOCIAL_IMAGE = {
  url: SITE_CONFIG.defaultSocialImageUrl,
  width: 1200,
  height: 630,
  alt: `${SITE_CONFIG.name} — ${SITE_CONFIG.role}`,
} as const

type PageMetadataOptions = {
  title: string
  description: string
  path: string
  absoluteTitle?: boolean
  image?: {
    url: string
    width?: number
    height?: number
    alt?: string
  }
  noIndex?: boolean
  noFollow?: boolean
  type?: 'website' | 'article'
  publishedTime?: string
}

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_CONFIG.url).toString()
}

export function normalizeMetadataText(value: string | null | undefined) {
  return value?.replace(/\s+/g, ' ').trim() ?? ''
}

export function firstMetadataText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const normalized = normalizeMetadataText(value)
    if (normalized) return normalized
  }

  return undefined
}

export function createPageMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
  image = DEFAULT_SOCIAL_IMAGE,
  noIndex = false,
  noFollow = false,
  type = 'website',
  publishedTime,
}: PageMetadataOptions): Metadata {
  const url = absoluteUrl(path)
  const normalizedTitle = firstMetadataText(title, SITE_CONFIG.name) ?? SITE_CONFIG.name
  const normalizedDescription =
    firstMetadataText(description, SITE_CONFIG.description) ?? SITE_CONFIG.description
  const imageUrl = image.url.trim() || DEFAULT_SOCIAL_IMAGE.url
  const imageAlt =
    firstMetadataText(image.alt, normalizedTitle) ?? `${SITE_CONFIG.name} — ${SITE_CONFIG.role}`
  const resolvedTitle: Metadata['title'] = absoluteTitle
    ? { absolute: normalizedTitle }
    : normalizedTitle
  const images = [
    {
      url: imageUrl,
      width: image.width ?? 1200,
      height: image.height ?? 630,
      alt: imageAlt,
    },
  ]

  const openGraph: Metadata['openGraph'] =
    type === 'article'
      ? {
          type: 'article',
          title: normalizedTitle,
          description: normalizedDescription,
          url,
          siteName: SITE_CONFIG.name,
          locale: SITE_CONFIG.locale,
          images,
          ...(publishedTime ? { publishedTime } : {}),
        }
      : {
          type: 'website',
          title: normalizedTitle,
          description: normalizedDescription,
          url,
          siteName: SITE_CONFIG.name,
          locale: SITE_CONFIG.locale,
          images,
        }

  return {
    title: resolvedTitle,
    description: normalizedDescription,
    alternates: { canonical: url },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: normalizedTitle,
      description: normalizedDescription,
      images: [{ url: imageUrl, alt: imageAlt }],
    },
    robots: noIndex
      ? { index: false, follow: !noFollow, nocache: true }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1,
          },
        },
  }
}
