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
  maxResolution?: '720p' | '1080p' | '1440p' | '2160p'
}

export const DecorativeVideo = React.forwardRef<HTMLVideoElement | null, DecorativeVideoProps>(
  function DecorativeVideo(
    { playbackId, tokens, poster, className, videoClassName, maxResolution = '1080p' },
    ref,
  ) {
    const containerRef = React.useRef<HTMLDivElement>(null)

    const [hasBeenVisible, setHasBeenVisible] = React.useState(false)

    React.useEffect(() => {
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
    }, [])

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
            className={videoClassName}
          />
        ) : null}
      </div>
    )
  },
)
