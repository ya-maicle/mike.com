/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { sanityFetch } from '@/sanity/client'
import { ALL_CASE_STUDY_SLUGS_QUERY } from '@/sanity/queries'
import { CASE_STUDY_WITH_BLOCKS } from '@/sanity/queries/case-study-queries'
import type { CaseStudy } from '@/sanity/queries'

import { Button } from '@/components/ui/button'
import { PortableTextLite } from '@/components/portable-text-lite'
import { MuxPlayer } from '@/components/mux-player'
import { CaseStudyCarousel } from '@/components/case-study-carousel'
import { DecorativeVideoBlock } from '@/components/decorative-video-block'

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

import { SanityImage } from '@/components/sanity-image'

function CaseStudyBlock({ block }: { block: any }) {
  if (block._type === 'imageBlock') {
    return (
      <section className="w-full space-y-3 py-2">
        <SanityImage image={block.image} className="w-full h-auto rounded-[8px]" />
        {block.image?.caption ? (
          <div className="mx-auto max-w-[592px] mt-2 text-center text-sm text-muted-foreground">
            {block.image.caption}
          </div>
        ) : null}
        {block.title ? (
          <div className="mx-auto max-w-[592px]">
            <h3 className="text-xl font-semibold tracking-tight">{block.title}</h3>
          </div>
        ) : null}
        {block.description ? (
          <div className="mx-auto max-w-[592px]">
            <p className="text-muted-foreground">{block.description}</p>
          </div>
        ) : null}
      </section>
    )
  }

  if (block._type === 'videoBlock') {
    const playbackId: string | undefined = block.video?.asset?.playbackId
    if (!playbackId) return null

    if (block.mode === 'decorative') {
      return (
        <DecorativeVideoBlock
          playbackId={playbackId}
          title={block.title}
          description={block.description}
        />
      )
    }

    return (
      <section className="w-full space-y-3 py-2 max-w-[var(--content-max-width)] mx-auto">
        <MuxPlayer
          playbackId={playbackId}
          title={block.title}
          className="w-full h-auto rounded-[8px] overflow-hidden"
          autoPlay
          muted
          loop
        />
        {block.title ? (
          <div className="mx-auto max-w-[592px]">
            <h3 className="text-xl font-semibold tracking-tight">{block.title}</h3>
          </div>
        ) : null}
        {block.description ? (
          <div className="mx-auto max-w-[592px]">
            <p className="text-muted-foreground">{block.description}</p>
          </div>
        ) : null}
      </section>
    )
  }

  if (block._type === 'carouselBlock') {
    const items: any[] = Array.isArray(block.items) ? block.items : []
    return <CaseStudyCarousel items={items} title={block.title} description={block.description} />
  }

  if (block._type === 'twoColumnImageBlock') {
    return (
      <section className="w-full py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <SanityImage
              image={block.leftImage}
              className="w-full h-auto rounded-[8px]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {block.leftImage?.caption && (
              <div className="text-sm text-muted-foreground">{block.leftImage.caption}</div>
            )}
          </div>
          <div className="space-y-2">
            <SanityImage
              image={block.rightImage}
              className="w-full h-auto rounded-[8px]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {block.rightImage?.caption && (
              <div className="text-sm text-muted-foreground">{block.rightImage.caption}</div>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (block._type === 'block') {
    return (
      <section className="mx-auto max-w-[592px] space-y-3 py-8">
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
    <div className="min-h-screen pb-24">
      <div className="mx-auto max-w-[592px] pt-6 pb-16 space-y-8 text-center flex flex-col items-center">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
          {data.projectInfo?.year && <span>{data.projectInfo.year}</span>}
          {data.projectInfo?.year && data.projectInfo?.sector && <span>&nbsp;&nbsp;</span>}
          {data.projectInfo?.sector && <span>{data.projectInfo.sector}</span>}
        </div>

        <h1 className="text-5xl font-medium tracking-tight text-foreground leading-none">
          {data.title}
        </h1>

        {data.summary ? (
          <p className="text-lg leading-relaxed text-black dark:text-white">{data.summary}</p>
        ) : null}

        <div>
          <Button asChild variant="secondary" size="lg">
            <Link href={data.projectInfo?.link || '#'}>About the project</Link>
          </Button>
        </div>
      </div>

      {data.headerMedia ? (
        <section className="w-full my-2">
          {data.headerMedia.type === 'video' && data.headerMedia.video?.asset?.playbackId ? (
            <MuxPlayer
              playbackId={data.headerMedia.video.asset.playbackId}
              className="w-full h-auto max-h-[90vh] object-cover rounded-[8px] overflow-hidden"
              autoPlay
              muted
              loop
            />
          ) : data.headerMedia.image ? (
            <SanityImage
              image={data.headerMedia.image}
              className="w-full h-auto object-cover max-h-[90vh] rounded-[8px]"
              priority
              sizes="100vw"
            />
          ) : null}
        </section>
      ) : data.coverImage ? (
        <section className="w-full my-2">
          <SanityImage
            image={data.coverImage}
            className="w-full h-auto object-cover max-h-[90vh] rounded-[8px]"
            priority
            sizes="100vw"
          />
        </section>
      ) : null}

      <div className="space-y-0">
        {data.content?.map((block: any, i: number) => (
          <CaseStudyBlock key={block._key || i} block={block} />
        ))}
      </div>
    </div>
  )
}
