'use client'

import { DecorativeVideoPlayer } from '@/components/decorative-video-player'

interface DecorativeVideoBlockProps {
  playbackId: string
  title?: string
  description?: string
}

export function DecorativeVideoBlock({
  playbackId,
  title,
  description,
}: DecorativeVideoBlockProps) {
  return (
    <section className="w-full space-y-3 max-w-[var(--content-max-width)] mx-auto">
      <DecorativeVideoPlayer playbackId={playbackId} />
      {(title || description) && (
        <div className="mx-auto max-w-[592px]">
          {title && <h3 className="text-xl font-semibold tracking-tight">{title}</h3>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
    </section>
  )
}
