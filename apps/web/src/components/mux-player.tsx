'use client'
import * as React from 'react'
import { MediaController } from 'media-chrome/react'

export interface MuxPlayerProps {
  playbackId?: string
  title?: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  showControls?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MuxPlayer = React.forwardRef<any, MuxPlayerProps>(
  (
    {
      playbackId,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      title,
      poster,
      className,
      autoPlay,
      muted,
      loop,
      showControls,
    },
    ref,
  ) => {
    const videoRef = React.useRef<HTMLVideoElement>(null)

    React.useImperativeHandle(ref, () => videoRef.current)

    if (!playbackId) return null

    const posterUrl = poster || `https://image.mux.com/${playbackId}/thumbnail.jpg`
    const streamUrl = `https://stream.mux.com/${playbackId}.m3u8`

    if (autoPlay && showControls === false) {
      return (
        <div className={className}>
          <video
            ref={videoRef}
            src={streamUrl}
            poster={posterUrl}
            autoPlay
            muted
            loop={loop}
            playsInline
            style={{
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.5rem',
              overflow: 'hidden',
            }}
          />
        </div>
      )
    }

    return (
      <div className={className} suppressHydrationWarning>
        <MediaController
          suppressHydrationWarning
          style={
            {
              display: 'block',
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              '--media-primary-color': 'white',
              '--media-secondary-color': 'transparent',
              '--media-control-background': 'transparent',
              '--media-control-hover-background': 'transparent',
            } as React.CSSProperties
          }
        >
          <video
            ref={videoRef}
            slot="media"
            src={streamUrl}
            poster={posterUrl}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            playsInline
            preload="metadata"
            crossOrigin="anonymous"
            suppressHydrationWarning
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </MediaController>
      </div>
    )
  },
)
MuxPlayer.displayName = 'MuxPlayer'
