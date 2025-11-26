/* eslint-disable */
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'

import { sanityFetch } from '@/sanity/client'
import { ALL_CASE_STUDY_SLUGS_QUERY } from '@/sanity/queries'
import { CASE_STUDY_WITH_BLOCKS } from '@/sanity/queries/case-study-queries'
import type { CaseStudy, SanityImage as SanityImageType } from '@/sanity/queries'
import { imageUrl } from '@/sanity/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PortableTextLite } from '@/components/portable-text-lite'
import { MuxPlayer } from '@/components/mux-player'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>(
    ALL_CASE_STUDY_SLUGS_QUERY,
    {},
    { tag: 'caseStudy' },
  )
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params
  const data = await sanityFetch<CaseStudy | null>(
    CASE_STUDY_WITH_BLOCKS,
    { slug },
    { tag: `caseStudy:${slug}` },
  )
  if (!data) return { title: 'Case Study not found' }
  return {
    title: data.seoSettings?.metaTitle || `${data.title} – Work – Mike Y.`,
    description: data.seoSettings?.metaDescription || data.summary || undefined,
  }
}

function SanityImage({
  image,
  widths = [640, 960, 1200],
  sizes = '(min-width: 1024px) 960px, 100vw',
  className,
  priority,
}: {
  image: SanityImageType
  widths?: number[]
  sizes?: string
  className?: string
  priority?: boolean
}) {
  if (!image?.asset) return null
  const largest = Math.max(...widths)
  return (
    <Image
      src={imageUrl(image, { width: largest })}
      alt={image.alt || ''}
      width={largest}
      height={Math.round((largest * 9) / 16)}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  )
}

function CaseStudyBlock({ block }: { block: any }) {
  // Handle the four block types (caseStudyBlock, imageBlock, videoBlock, carouselBlock)
  if (block._type === 'imageBlock') {
    return (
      <section className="mx-auto max-w-5xl space-y-3 py-8">
        <SanityImage image={block.image} className="w-full rounded-lg border" />
        {block.image?.caption ? (
          <div className="mt-2 text-center text-sm text-muted-foreground">
            {block.image.caption}
          </div>
        ) : null}
        {block.title ? (
          <h3 className="text-xl font-semibold tracking-tight">{block.title}</h3>
        ) : null}
        {block.description ? <p className="text-muted-foreground">{block.description}</p> : null}
      </section>
    )
  }

  if (block._type === 'videoBlock') {
    const playbackId: string | undefined = block.video?.asset?.playbackId
    return (
      <section className="mx-auto max-w-5xl space-y-3 py-8">
        <MuxPlayer
          playbackId={playbackId}
          title={block.title}
          className="w-full rounded-lg border"
        />
        {block.title ? (
          <h3 className="text-xl font-semibold tracking-tight">{block.title}</h3>
        ) : null}
        {block.description ? <p className="text-muted-foreground">{block.description}</p> : null}
      </section>
    )
  }

  if (block._type === 'carouselBlock') {
    const items: any[] = Array.isArray(block.items) ? block.items : []
    return (
      <section className="mx-auto max-w-5xl space-y-3 py-8">
        <Carousel opts={{ align: 'start' }}>
          <CarouselContent className="-ml-4">
            {items.map((item, i) => (
              <CarouselItem key={i} className="pl-4 md:basis-2/3 lg:basis-1/2">
                {item.kind === 'image' ? (
                  <SanityImage image={item.image} className="w-full rounded-lg border" />
                ) : (
                  <MuxPlayer
                    playbackId={item.video?.asset?.playbackId}
                    title={block.title}
                    className="w-full rounded-lg border"
                  />
                )}
                {item.image?.caption ? (
                  <div className="mt-2 text-center text-sm text-muted-foreground">
                    {item.image.caption}
                  </div>
                ) : null}
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
        {block.title ? (
          <h3 className="text-xl font-semibold tracking-tight">{block.title}</h3>
        ) : null}
        {block.description ? <p className="text-muted-foreground">{block.description}</p> : null}
      </section>
    )
  }

  // Default: standard portable text block
  if (block._type === 'block') {
    return (
      <section className="mx-auto max-w-3xl space-y-3 py-8">
        <PortableTextLite value={[block]} />
      </section>
    )
  }

  return null
}

export default async function CaseStudyPage(props: PageProps) {
  const { slug } = await props.params
  const data = await sanityFetch<CaseStudy | null>(
    CASE_STUDY_WITH_BLOCKS,
    { slug },
    { tag: `caseStudy:${slug}` },
  )
  if (!data) return notFound()

  return (
    <div className="space-y-12 pb-24">
      {/* Back link */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm">
          <Link href="/work" className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" /> Back to Work
          </Link>
        </Button>
      </div>

      {/* Page header (centered) */}
      <header className="mx-auto max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">{data.title}</h1>
        {data.summary ? (
          <p className="text-muted-foreground text-xl leading-relaxed">{data.summary}</p>
        ) : null}
      </header>

      {/* Project Info Grid */}
      {data.projectInfo ? (
        <section className="mx-auto max-w-4xl border-y py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.projectInfo.client ? (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Client
                </div>
                <div className="font-medium">{data.projectInfo.client}</div>
              </div>
            ) : null}
            {data.projectInfo.sector ? (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Sector
                </div>
                <div className="font-medium">{data.projectInfo.sector}</div>
              </div>
            ) : null}
            {data.projectInfo.discipline ? (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Discipline
                </div>
                <div className="font-medium">{data.projectInfo.discipline}</div>
              </div>
            ) : null}
            {data.projectInfo.year ? (
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Year
                </div>
                <div className="font-medium">{data.projectInfo.year}</div>
              </div>
            ) : null}
          </div>
          {data.projectInfo.link ? (
            <div className="mt-6 flex justify-center">
              <Button asChild variant="outline">
                <a href={data.projectInfo.link} target="_blank" rel="noreferrer" className="gap-2">
                  Visit Project <ExternalLink className="size-4" />
                </a>
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Hero Image */}
      {data.coverImage ? (
        <section className="mx-auto max-w-6xl">
          <SanityImage image={data.coverImage} className="w-full rounded-xl shadow-sm" priority />
        </section>
      ) : null}

      {/* Content Blocks */}
      <div className="space-y-8">
        {data.content?.map((block: any, i: number) => (
          <CaseStudyBlock key={block._key || i} block={block} />
        ))}
      </div>
    </div>
  )
}
