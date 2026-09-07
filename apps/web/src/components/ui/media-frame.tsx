import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type MediaFrameProps = ComponentProps<'div'> & {
  /** Force a border outside a case study, such as an article cover. */
  bordered?: boolean
}

/** A shared media edge that stays above images, video players, and carousel slides. */
export function MediaFrame({ children, className, bordered, ...props }: MediaFrameProps) {
  return (
    <div
      {...props}
      data-slot="media-frame"
      className={cn(
        'relative isolate overflow-hidden rounded-[8px]',
        bordered && '[--content-media-border:var(--border)]',
        className,
      )}
    >
      {children}
      <div
        aria-hidden="true"
        data-slot="media-frame-border"
        className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] border border-[var(--content-media-border,transparent)]"
      />
    </div>
  )
}
