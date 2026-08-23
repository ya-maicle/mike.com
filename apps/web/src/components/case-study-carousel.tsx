'use client'

import * as React from 'react'
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from '@/components/ui/carousel'
import { CaseStudyImage } from '@/components/case-study-image'
import { DecorativeVideo } from '@/components/decorative-video'
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CaseStudyCarouselProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
  title?: string
  description?: string
}

const carouselControlClass =
  'h-7 w-7 rounded-full border border-white/15 bg-background/45 text-foreground/75 shadow-sm shadow-black/10 backdrop-blur-md transition-all duration-200 hover:bg-background/60 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring/60 focus-visible:ring-offset-0 md:h-8 md:w-8'

const carouselIconClass = 'h-2.5 w-2.5 stroke-[1.75] md:h-3 md:w-3'

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
                <div
                  className={cn(
                    'relative w-full bg-muted',
                    item.kind !== 'image' || !item.mobileImage ? 'aspect-video' : 'md:aspect-video',
                  )}
                >
                  {item.kind === 'image' ? (
                    <CaseStudyImage
                      image={item.image}
                      mobileImage={item.mobileImage}
                      caption={item.image?.caption}
                      className={cn(
                        'w-full object-cover',
                        item.mobileImage ? 'h-auto md:h-full' : 'h-full',
                      )}
                      sizes="(min-width: 1376px) 1376px, 100vw"
                      aspectRatio="16/9"
                      loading="eager"
                      triggerMode="control"
                    />
                  ) : (
                    <DecorativeVideo
                      playbackId={item.video?.asset?.playbackId}
                      tokens={item.video?.asset?.tokens}
                      className="w-full h-full"
                      videoClassName="object-cover"
                      maxResolution="2160p"
                      minResolution="1080p"
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
            className={carouselControlClass}
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause carousel autoplay' : 'Play carousel autoplay'}
          >
            {isPlaying ? (
              <Pause className={carouselIconClass} />
            ) : (
              <Play className={carouselIconClass} fill="currentColor" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className={carouselControlClass}
            onClick={() => {
              onUserInteract()
              api?.scrollPrev()
            }}
            aria-label="Previous slide"
          >
            <ArrowLeft className={carouselIconClass} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className={carouselControlClass}
            onClick={() => {
              onUserInteract()
              api?.scrollNext()
            }}
            aria-label="Next slide"
          >
            <ArrowRight className={carouselIconClass} />
          </Button>
        </div>
      </div>

      {(title || description) && (
        <div className="mx-auto max-w-[592px]">
          {title && <h3 className="text-xl font-semibold">{title}</h3>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
    </section>
  )
}
