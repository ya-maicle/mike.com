import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { sanityFetch, sanityNoStoreFetch } from '@/sanity/client'
import { PageTemplate } from '@/components/page-template'
import { LegalPageContent } from '@/components/legal-page-content'
import type { PortableTextBlock } from '@portabletext/types'
import { ebGaramond } from '@/lib/fonts'
import { IMAGE_PROJECTION, MUX_VIDEO_PROJECTION, type SanityImage } from '@/sanity/queries'
import {
  ACTIVE_PORTFOLIO_ACCESS_PROFILE_BY_SLUG,
  type PortfolioAccessProfile,
} from '@/sanity/queries/portfolio-access-queries'
import { SITE_CONFIG } from '@/lib/constants'
import { createPageMetadata, firstMetadataText } from '@/lib/seo'
import { socialImageFromSanity } from '@/lib/sanity-social-image'
import { gridCols } from '@/lib/grid-columns'

type CoverMedia =
  | { type: 'image'; image: SanityImage }
  | { type: 'video'; video: { asset: { playbackId: string; aspectRatio?: string } } }

type PageData = {
  _id: string
  title: string
  slug: { current: string }
  subtitle?: string
  coverMedia?: CoverMedia
  content: PortableTextBlock[]
  publishedAt?: string
  seoSettings?: {
    metaTitle?: string
    metaDescription?: string
    shareImage?: SanityImage
  }
}

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ k?: string }>
}

// Reserved slugs that have their own routes
const RESERVED_SLUGS = ['work', 'login', 'privacy', 'terms', 'stories', 'strengths', 'blog']
const NO_INDEX_SLUGS = new Set(['cookie-policy'])
const BIO_HEADING = `About ${SITE_CONFIG.name}`
const BIO_SEO_TITLE = `${BIO_HEADING} | ${SITE_CONFIG.role}`
const BIO_DESCRIPTION = `${SITE_CONFIG.name}, also known as ${SITE_CONFIG.legalName}, is a London-based product design leader working across AI, enterprise platforms and complex systems at scale.`

export async function generateStaticParams() {
  const pages = await sanityFetch<{ slug: string }[]>(
    `*[_type == "page" && defined(slug.current)]{ "slug": slug.current }`,
    {},
    { tag: 'pages' },
  )
  return pages.filter(({ slug }) => !RESERVED_SLUGS.includes(slug)).map(({ slug }) => ({ slug }))
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params

  // Skip reserved slugs
  if (RESERVED_SLUGS.includes(slug)) {
    return notFound()
  }

  const page = await sanityFetch<PageData | null>(
    `*[_type == "page" && slug.current == $slug][0]{
      title,
      subtitle,
      publishedAt,
      coverMedia { type, image${IMAGE_PROJECTION} },
      seoSettings {
        metaTitle,
        metaDescription,
        shareImage${IMAGE_PROJECTION}
      }
    }`,
    { slug },
    { tag: `page:${slug}` },
  )

  if (!page) return { title: 'Page not found', robots: { index: false, follow: false } }

  const isBio = slug === 'bio'
  const title = isBio
    ? BIO_SEO_TITLE
    : (firstMetadataText(page.seoSettings?.metaTitle, page.title) ?? SITE_CONFIG.name)
  const description = isBio
    ? BIO_DESCRIPTION
    : (firstMetadataText(
        page.seoSettings?.metaDescription,
        page.subtitle,
        `${page.title} — ${SITE_CONFIG.name}, ${SITE_CONFIG.role}.`,
      ) ?? SITE_CONFIG.description)
  const shareImage =
    page.seoSettings?.shareImage ||
    (page.coverMedia?.type === 'image' ? page.coverMedia.image : undefined)

  return createPageMetadata({
    title,
    absoluteTitle: isBio,
    description,
    path: `/${slug}`,
    type: 'article',
    publishedTime: page.publishedAt,
    image: socialImageFromSanity(shareImage, title),
    noIndex: NO_INDEX_SLUGS.has(slug),
  })
}

export default async function DynamicPage(props: PageProps) {
  const { slug } = await props.params

  // Skip reserved slugs - they have their own routes
  if (RESERVED_SLUGS.includes(slug)) {
    return notFound()
  }

  // Reason: access links require the secret ?k= token; without it the slug
  // behaves like any unknown page (404) so company profiles stay undiscoverable.
  const linkToken = (await props.searchParams)?.k
  if (linkToken) {
    const accessProfile = await sanityNoStoreFetch<PortfolioAccessProfile | null>(
      ACTIVE_PORTFOLIO_ACCESS_PROFILE_BY_SLUG,
      { slug },
    )
    if (accessProfile) {
      redirect(
        `/api/portfolio-access/link?slug=${encodeURIComponent(slug)}&k=${encodeURIComponent(linkToken)}`,
      )
    }
  }

  const page = await sanityFetch<PageData | null>(
    `*[_type == "page" && slug.current == $slug][0]{
      _id,
      title,
      subtitle,
      coverMedia {
        type,
        image${IMAGE_PROJECTION},
        video${MUX_VIDEO_PROJECTION}
      },
      content[]{
        ...,
        _type == 'imageBlock' => {
          ...,
          image${IMAGE_PROJECTION}
        },
        _type == 'videoBlock' => {
          ...,
          video${MUX_VIDEO_PROJECTION}
        },
        _type == 'carouselBlock' => {
          ...,
          items[]{
            kind,
            image${IMAGE_PROJECTION},
            video{asset->{playbackId}}
          }
        }
      },
      publishedAt,
      seoSettings
    }`,
    { slug },
    { tag: `page:${slug}` },
  )

  if (!page) {
    return notFound()
  }

  const formattedDate = page.publishedAt
    ? new Date(page.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : undefined
  const isBio = slug === 'bio'
  const pageContent = (
    <>
      {isBio && page.subtitle ? (
        <p
          className={`${gridCols.narrow} ${ebGaramond.className} mb-6 text-xl leading-7 text-foreground`}
        >
          {page.subtitle}
        </p>
      ) : null}
      <LegalPageContent
        content={page.content}
        className={isBio ? `${ebGaramond.className} [--text-xl:20px]` : undefined}
      />
    </>
  )

  return (
    <PageTemplate
      title={isBio ? BIO_HEADING : page.title}
      titleClassName={
        isBio
          ? `${ebGaramond.className} text-[clamp(36px,9vw,72px)] leading-none tracking-[-1px]`
          : undefined
      }
      subtitle={isBio ? BIO_DESCRIPTION : page.subtitle}
      subtitleClassName={isBio ? `${ebGaramond.className} [--text-xl:20px]` : undefined}
      coverMedia={page.coverMedia}
      metadata={formattedDate}
    >
      {pageContent}
    </PageTemplate>
  )
}
