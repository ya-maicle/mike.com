'use client'
/* eslint-disable */
import * as React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
type CarouselApi = any
type CarouselOptions = any
type CarouselPlugin = any
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Orientation = 'horizontal' | 'vertical'

type CarouselContextProps = {
  carouselApi?: CarouselApi
  orientation: Orientation
  viewportRef: (node: HTMLElement | null) => void
  canScrollPrev: boolean
  canScrollNext: boolean
  scrollPrev: () => void
  scrollNext: () => void
}

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarouselContext() {
  const ctx = React.useContext(CarouselContext)
  if (!ctx) throw new Error('Carousel components must be used within <Carousel>')
  return ctx
}

export type { CarouselApi }

export type CarouselProps = React.HTMLAttributes<HTMLDivElement> & {
  opts?: CarouselOptions
  plugins?: CarouselPlugin[]
  orientation?: Orientation
  setApi?: (api: CarouselApi) => void
}

export const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
  ({ className, children, opts, plugins, orientation = 'horizontal', setApi, ...props }, ref) => {
    const [viewportRef, api] = useEmblaCarousel(
      { align: 'start', axis: orientation === 'horizontal' ? 'x' : 'y', ...opts },
      plugins,
    )
    const [canScrollPrev, setCanScrollPrev] = React.useState(false)
    const [canScrollNext, setCanScrollNext] = React.useState(false)

    const onSelect = React.useCallback(() => {
      if (!api) return
      setCanScrollPrev(api.canScrollPrev())
      setCanScrollNext(api.canScrollNext())
    }, [api])

    React.useEffect(() => {
      if (!api) return
      setApi?.(api)
      onSelect()
      api.on('reInit', onSelect)
      api.on('select', onSelect)
      return () => {
        api.off('reInit', onSelect)
        api.off('select', onSelect)
      }
    }, [api, onSelect, setApi])

    const scrollPrev = React.useCallback(() => api?.scrollPrev(), [api])
    const scrollNext = React.useCallback(() => api?.scrollNext(), [api])

    return (
      <CarouselContext.Provider
        value={{
          carouselApi: api,
          orientation,
          viewportRef,
          canScrollPrev,
          canScrollNext,
          scrollPrev,
          scrollNext,
        }}
      >
        <div ref={ref} className={cn('relative', className)} {...props}>
          {children}
        </div>
      </CarouselContext.Provider>
    )
  },
)
Carousel.displayName = 'Carousel'

export const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { viewportRef, orientation } = useCarouselContext()
  return (
    <div ref={viewportRef} className="overflow-hidden">
      <div
        ref={ref}
        className={cn('flex', orientation === 'vertical' ? 'flex-col -mt-4' : '-ml-4', className)}
        {...props}
      />
    </div>
  )
})
CarouselContent.displayName = 'CarouselContent'

export const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn('min-w-0 shrink-0 grow-0 basis-full pl-4', className)}
        {...props}
      />
    )
  },
)
CarouselItem.displayName = 'CarouselItem'

export const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { canScrollPrev, scrollPrev } = useCarouselContext()
  return (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        'absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50',
        className,
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <ChevronLeft className="size-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = 'CarouselPrevious'

export const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => {
  const { canScrollNext, scrollNext } = useCarouselContext()
  return (
    <Button
      ref={ref}
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        'absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50',
        className,
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      {...props}
    >
      <ChevronRight className="size-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = 'CarouselNext'
