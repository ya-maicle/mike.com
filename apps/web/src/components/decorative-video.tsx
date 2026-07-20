'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'
import { getMuxPosterUrl } from '@/lib/mux-poster'

const MuxContentPlayer = dynamic(
  () => import('@/components/mux-content-player').then((m) => m.MuxContentPlayer),
  { ssr: false },
)

export interface DecorativeVideoProps {
  playbackId: string
  tokens?: import('@/components/mux-content-player').MuxPlaybackTokens
  poster?: string
  className?: string
  videoClassName?: string
  maxResolution?: import('@/components/mux-content-player').MuxMaxResolution
  minResolution?: import('@/components/mux-content-player').MuxMinResolution
  /** Expose the hero poster in SSR and load it before mounting the stream. */
  priority?: boolean
  /**
   * Mount the player immediately instead of waiting for the
   * IntersectionObserver — for above-the-fold heroes, where waiting for
   * hydration + intersection delays the poster→video swap.
   */
  eager?: boolean
}

export const DecorativeVideo = React.forwardRef<HTMLVideoElement | null, DecorativeVideoProps>(
  function DecorativeVideo(
    {
      playbackId,
      tokens,
      poster,
      className,
      videoClassName,
      maxResolution = '1080p',
      minResolution,
      eager = false,
      priority = false,
    },
    ref,
  ) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const posterRef = React.useRef<HTMLImageElement>(null)

    const [hasBeenVisible, setHasBeenVisible] = React.useState(eager)
    const [isPosterReady, setIsPosterReady] = React.useState(false)
    const posterUrl = getMuxPosterUrl({
      playbackId,
      poster,
      thumbnailToken: tokens?.thumbnail,
    })

    React.useEffect(() => {
      if (!priority) return
      if (posterRef.current?.complete) setIsPosterReady(true)
    }, [priority])

    React.useEffect(() => {
      if (eager) return
      const container = containerRef.current
      if (!container) return
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setHasBeenVisible(true)
            observer.disconnect()
          }
        },
        { rootMargin: '200px' },
      )
      observer.observe(container)
      return () => observer.disconnect()
    }, [eager])

    return (
      <div ref={containerRef} className={cn(priority && 'relative overflow-hidden', className)}>
        {priority ? (
          // Keep only true hero LCP candidates in server-rendered HTML. Lazy
          // videos retain their original player-driven poster behavior.
          // eslint-disable-next-line @next/next/no-img-element -- Preserve the original Mux asset without a recompression proxy.
          <img
            ref={posterRef}
            src={posterUrl}
            alt=""
            aria-hidden="true"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className={cn('absolute inset-0 block h-full w-full object-cover', videoClassName)}
            onLoad={() => setIsPosterReady(true)}
            onError={() => setIsPosterReady(true)}
          />
        ) : null}
        {hasBeenVisible && (!priority || isPosterReady) ? (
          <MuxContentPlayer
            ref={ref}
            playbackId={playbackId}
            tokens={tokens}
            poster={poster}
            autoPlay
            muted
            loop
            controls={false}
            maxResolution={maxResolution}
            minResolution={minResolution}
            className={cn(priority && 'absolute inset-0', videoClassName)}
          />
        ) : null}
      </div>
    )
  },
)
