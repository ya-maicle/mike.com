'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'

const MuxContentPlayer = dynamic(
  () => import('@/components/mux-content-player').then((m) => m.MuxContentPlayer),
  { ssr: false },
)

export interface DecorativeVideoProps {
  playbackId: string
  poster?: string
  className?: string
  videoClassName?: string
  maxResolution?: '720p' | '1080p' | '1440p' | '2160p'
}

export const DecorativeVideo = React.forwardRef<HTMLVideoElement | null, DecorativeVideoProps>(
  function DecorativeVideo(
    { playbackId, poster, className, videoClassName, maxResolution = '1080p' },
    ref,
  ) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const playerRef = React.useRef<HTMLVideoElement | null>(null)
    React.useImperativeHandle<HTMLVideoElement | null, HTMLVideoElement | null>(
      ref,
      () => playerRef.current,
      [],
    )

    const [isVisible, setIsVisible] = React.useState(false)

    React.useEffect(() => {
      const container = containerRef.current
      if (!container) return
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            setIsVisible(entry.isIntersecting)
          }
        },
        { rootMargin: '200px' },
      )
      observer.observe(container)
      return () => observer.disconnect()
    }, [])

    return (
      <div ref={containerRef} className={className}>
        {isVisible ? (
          <MuxContentPlayer
            ref={playerRef}
            playbackId={playbackId}
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
