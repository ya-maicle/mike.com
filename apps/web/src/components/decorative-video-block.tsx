'use client'

import { DecorativeVideoPlayer } from '@/components/decorative-video-player'

interface DecorativeVideoBlockProps {
  playbackId: string
  tokens?: import('@/components/mux-content-player').MuxPlaybackTokens
  title?: string
  description?: string
  aspectRatio?: string
  maxResolution?: import('@/components/mux-content-player').MuxMaxResolution
  minResolution?: import('@/components/mux-content-player').MuxMinResolution
  eager?: boolean
}

export function DecorativeVideoBlock({
  playbackId,
  tokens,
  title,
  description,
  aspectRatio,
  maxResolution,
  minResolution,
  eager,
}: DecorativeVideoBlockProps) {
  return (
    <section className="w-full space-y-3 max-w-[var(--content-max-width)] mx-auto">
      <DecorativeVideoPlayer
        playbackId={playbackId}
        tokens={tokens}
        aspectRatio={aspectRatio}
        maxResolution={maxResolution}
        minResolution={minResolution}
        eager={eager}
      />
      {(title || description) && (
        <div className="mx-auto max-w-[592px]">
          {title && <h3 className="text-xl font-semibold">{title}</h3>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
    </section>
  )
}
