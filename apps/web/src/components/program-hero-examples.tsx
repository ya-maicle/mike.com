'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { SanityImage } from '@/components/sanity-image'
import { DecorativeVideo } from '@/components/decorative-video'
import { Button } from '@/components/ui/button'
import type { ProgramHeroExample } from '@/sanity/queries/program-queries'

type ProgramHeroExamplesProps = {
  examples?: ProgramHeroExample[]
}

type ValidProgramHeroExample = ProgramHeroExample & {
  study: NonNullable<ProgramHeroExample['study']>
}

export function ProgramHeroExamples({ examples }: ProgramHeroExamplesProps) {
  const [api, setApi] = React.useState<CarouselApi>()

  const validExamples =
    examples?.filter((example): example is ValidProgramHeroExample =>
      Boolean(example.study?._id && example.study.slug?.current),
    ) ?? []
  if (validExamples.length === 0) return null

  const slideInner = (example: ValidProgramHeroExample, index: number) => {
    const { study } = example
    const isVideo =
      study.headerMedia?.type === 'video' && study.headerMedia.video?.asset?.playbackId
    const image =
      study.headerMedia?.type === 'image' && study.headerMedia.image
        ? study.headerMedia.image
        : study.coverImage

    return (
      // Safari bug: aspect-ratio + absolutely-positioned children causes incorrect layout.
      // padding-bottom 56.25% (= 9/16) establishes the 16:9 height reliably instead.
      <div className="relative w-full bg-muted" style={{ paddingBottom: '56.25%' }}>
        {isVideo ? (
          <DecorativeVideo
            playbackId={study.headerMedia!.video!.asset.playbackId}
            className="absolute inset-0 w-full h-full"
            videoClassName="object-cover"
          />
        ) : image?.asset ? (
          <SanityImage
            image={image}
            className="absolute inset-0 w-full h-full object-cover"
            sizes="(min-width: 1376px) 1376px, 100vw"
            aspectRatio="16/9"
            // Reason: only the visible slide is an LCP candidate — preloading
            // every slide competes with it. Later slides still load eagerly so
            // navigation never shows a blur-up (Embla hides them via transform,
            // which defeats native lazy-loading anyway).
            priority={index === 0}
            loading="eager"
          />
        ) : null}

        <Link
          href={`/work/${study.slug.current}`}
          className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-background/80 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-sm transition-colors hover:bg-background"
        >
          {study.title}
          <ChevronRight className="size-4 shrink-0" />
        </Link>
      </div>
    )
  }

  if (validExamples.length === 1) {
    return <div className="rounded-[8px] overflow-hidden">{slideInner(validExamples[0], 0)}</div>
  }

  return (
    <div className="relative rounded-[8px] overflow-hidden">
      <Carousel setApi={setApi} opts={{ loop: true, align: 'start' }} className="w-full">
        <CarouselContent className="-ml-0">
          {validExamples.map((example, index) => (
            <CarouselItem key={example.study._id} className="pl-0 basis-full">
              {slideInner(example, index)}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 z-10">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full w-8 h-8 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground border border-border/10"
          onClick={() => api?.scrollPrev()}
          aria-label="Previous example"
        >
          <ArrowLeft className="size-3.5" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full w-8 h-8 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground border border-border/10"
          onClick={() => api?.scrollNext()}
          aria-label="Next example"
        >
          <ArrowRight className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
