import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { sanityFetch, sanityNoStoreFetch } from '@/sanity/client'
import { PageTemplate } from '@/components/page-template'
import { BioPageLayout } from '@/components/bio-page-layout'
import { LegalPageContent } from '@/components/legal-page-content'
import type { PortableTextBlock } from '@portabletext/types'
import { ebGaramond } from '@/lib/fonts'
import { IMAGE_PROJECTION, MUX_VIDEO_PROJECTION, type SanityImage } from '@/sanity/queries'
import {
  ACTIVE_PORTFOLIO_ACCESS_PROFILE_BY_SLUG,
  type PortfolioAccessProfile,
} from '@/sanity/queries/portfolio-access-queries'

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
  }
}

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ k?: string }>
}

// Reserved slugs that have their own routes
const RESERVED_SLUGS = ['work', 'login', 'privacy', 'terms', 'stories', 'strengths']

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
    `*[_type == "page" && slug.current == $slug][0]{ title, seoSettings }`,
    { slug },
    { tag: `page:${slug}` },
  )

  if (!page) return { title: 'Page not found' }

  return {
    title: page.seoSettings?.metaTitle || page.title,
    description: page.seoSettings?.metaDescription || undefined,
  }
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
    <LegalPageContent
      content={page.content}
      className={isBio ? `${ebGaramond.className} [--text-xl:20px]` : undefined}
    />
  )

  if (isBio && page.coverMedia?.type === 'image' && page.coverMedia.image) {
    return (
      <BioPageLayout
        title={page.title}
        titleClassName={ebGaramond.className}
        subtitle={page.subtitle}
        subtitleClassName={ebGaramond.className}
        image={page.coverMedia.image}
        metadata={formattedDate}
      >
        {pageContent}
      </BioPageLayout>
    )
  }

  return (
    <PageTemplate
      title={page.title}
      titleClassName={isBio ? ebGaramond.className : undefined}
      subtitle={page.subtitle}
      subtitleClassName={isBio ? ebGaramond.className : undefined}
      coverMedia={page.coverMedia}
      metadata={formattedDate}
    >
      {pageContent}
    </PageTemplate>
  )
}
