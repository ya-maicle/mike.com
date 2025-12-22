import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { sanityFetch } from '@/sanity/client'
import { PageTemplate } from '@/components/page-template'
import { LegalPageContent } from '@/components/legal-page-content'
import type { PortableTextBlock } from '@portabletext/types'
import type { SanityImage } from '@/sanity/queries'

type CoverMedia =
  | { type: 'image'; image: SanityImage }
  | { type: 'video'; video: { asset: { playbackId: string } } }

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

type PageProps = { params: Promise<{ slug: string }> }

// Reserved slugs that have their own routes
const RESERVED_SLUGS = ['work', 'login', 'privacy', 'terms', 'stories']

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

  const page = await sanityFetch<PageData | null>(
    `*[_type == "page" && slug.current == $slug][0]{ 
      _id,
      title, 
      subtitle,
      coverMedia {
        type,
        image {
          asset->{
            _id,
            url,
            metadata { dimensions }
          },
          alt
        },
        video {
          asset->{ playbackId }
        }
      },
      content[]{
        ...,
        _type == 'imageBlock' => {
          ...,
          image{..., asset->}
        },
        _type == 'videoBlock' => {
          ...,
          video{asset->{playbackId}}
        },
        _type == 'carouselBlock' => {
          ...,
          items[]{
            kind,
            image{..., asset->},
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

  return (
    <PageTemplate
      title={page.title}
      subtitle={page.subtitle}
      coverMedia={page.coverMedia}
      metadata={formattedDate}
    >
      <LegalPageContent content={page.content} />
    </PageTemplate>
  )
}
