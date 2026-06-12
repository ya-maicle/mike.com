'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'

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
    },
    ref,
  ) {
    const containerRef = React.useRef<HTMLDivElement>(null)

    const [hasBeenVisible, setHasBeenVisible] = React.useState(eager)

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
      <div ref={containerRef} className={className}>
        {hasBeenVisible ? (
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
            className={videoClassName}
          />
        ) : null}
      </div>
    )
  },
)
