'use client'

import * as React from 'react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { SanityImage } from '@/components/sanity-image'
import { MuxPlayer } from '@/components/mux-player'
import { ArrowLeft, ArrowRight, Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CaseStudyCarouselProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
  title?: string
  description?: string
}

export function CaseStudyCarousel({ items, title, description }: CaseStudyCarouselProps) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [isPlaying, setIsPlaying] = React.useState(false)

  React.useEffect(() => {
    if (!api || !isPlaying) return
    const interval = setInterval(() => {
      api.scrollNext()
    }, 4000)
    return () => clearInterval(interval)
  }, [api, isPlaying])

  const onUserInteract = () => {
    setIsPlaying(false)
  }

  return (
    <section className="w-full space-y-4 max-w-[var(--content-max-width)] mx-auto">
      <div className="relative group overflow-hidden rounded-[8px]">
        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-0">
            {items.map((item, i) => (
              <CarouselItem key={i} className="pl-0 basis-full">
                <div className="relative w-full aspect-video bg-muted">
                  {item.kind === 'image' ? (
                    <SanityImage
                      image={item.image}
                      className="w-full h-full object-cover"
                      sizes="100vw"
                    />
                  ) : (
                    <MuxPlayer
                      playbackId={item.video?.asset?.playbackId}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                    />
                  )}
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 md:gap-2 z-10">
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full w-6 h-6 md:w-7 md:h-7 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground border border-border/10"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="h-2.5 w-2.5 md:h-3 md:w-3 fill-current" />
            ) : (
              <Play className="h-2.5 w-2.5 md:h-3 md:w-3 fill-current" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full w-6 h-6 md:w-7 md:h-7 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground border border-border/10"
            onClick={() => {
              onUserInteract()
              api?.scrollPrev()
            }}
          >
            <ArrowLeft className="h-2.5 w-2.5 md:h-3 md:w-3" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full w-6 h-6 md:w-7 md:h-7 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground border border-border/10"
            onClick={() => {
              onUserInteract()
              api?.scrollNext()
            }}
          >
            <ArrowRight className="h-2.5 w-2.5 md:h-3 md:w-3" />
          </Button>
        </div>
      </div>

      {(title || description) && (
        <div className="mx-auto max-w-[592px]">
          {title && <h3 className="text-xl font-semibold tracking-tight">{title}</h3>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
    </section>
  )
}
