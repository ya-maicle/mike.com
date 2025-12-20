import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface ContentGridProps {
  children: ReactNode
  className?: string
}

/**
 * 12-column grid container for content layout.
 * Max width 1376px, centered with auto margins.
 * Use gridCols utilities from lib/grid-columns.ts to control child widths.
 */
export function ContentGrid({ children, className }: ContentGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-12 gap-y-0 max-w-[var(--content-max-width)] mx-auto w-full',
        className,
      )}
    >
      {children}
    </div>
  )
}
