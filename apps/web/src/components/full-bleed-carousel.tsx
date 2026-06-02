import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type CarouselAlign = 'full' | 'medium'

type FullBleedCarouselProps = {
  /**
   * Slides to render. Each child controls its own width and should include
   * `flex-none snap-start` (e.g. `w-[85vw] max-w-sm flex-none snap-start`).
   */
  children: ReactNode
  /**
   * Where the carousel's resting edges sit at scroll start and end.
   * - `full` (default): aligned to the content-column edge.
   * - `medium`: inset to match `gridCols.medium` (8/12 centered) once the
   *   content area reaches desktop width (`@6xl`).
   */
  align?: CarouselAlign
  /** Gap utility classes between slides. */
  gapClassName?: string
  className?: string
}

/**
 * Horizontal snap carousel that bleeds to both browser edges while its slides
 * rest aligned to the surrounding content column.
 *
 * Reason: `ml-[calc(50%-50vw)] w-screen` escapes the centered content container,
 * and the symmetric `max(1.5rem, calc(50vw - 50%))` padding restores the resting
 * position to the content edge — which equals `main`'s `px-6`/`px-8` at each
 * breakpoint. `scroll-padding-left` mirrors `padding-left` so `snap-start`
 * slides land on the content edge rather than the raw viewport edge.
 */
export function FullBleedCarousel({
  children,
  align = 'full',
  gapClassName = 'gap-4 md:gap-6 lg:gap-8',
  className,
}: FullBleedCarouselProps) {
  return (
    <div
      className={cn(
        'flex snap-x snap-mandatory overflow-x-auto pb-4 scrollbar-hide',
        'ml-[calc(50%_-_50vw)] w-screen',
        'pl-[max(1.5rem,calc(50vw_-_50%))] pr-[max(1.5rem,calc(50vw_-_50%))]',
        '[scroll-padding-left:max(1.5rem,calc(50vw_-_50%))]',
        align === 'medium' && [
          '@6xl:pl-[calc(max(1.5rem,50vw_-_50%)_+_16.6667%)] @6xl:pr-[calc(max(1.5rem,50vw_-_50%)_+_16.6667%)]',
          '@6xl:[scroll-padding-left:calc(max(1.5rem,50vw_-_50%)_+_16.6667%)]',
        ],
        gapClassName,
        className,
      )}
    >
      {children}
    </div>
  )
}
