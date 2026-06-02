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
   *   content area reaches desktop width (`@6xl` / 72rem).
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
 * The bleed + content-aligned padding live in the `.carousel-bleed` class (see
 * globals.css); see there for why the inset is viewport-based rather than `%`.
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
        'carousel-bleed',
        align === 'medium' && 'carousel-bleed-medium',
        gapClassName,
        className,
      )}
    >
      {children}
    </div>
  )
}
