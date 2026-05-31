'use client'

import * as React from 'react'
import MuxPlayerReact from '@mux/mux-player-react/lazy'
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react'

export interface MuxContentPlayerProps {
  playbackId: string
  title?: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  maxResolution?: '720p' | '1080p' | '1440p' | '2160p'
}

export const MuxContentPlayer = React.forwardRef<HTMLVideoElement | null, MuxContentPlayerProps>(
  function MuxContentPlayer(
    {
      playbackId,
      title,
      poster,
      className,
      autoPlay = false,
      muted = false,
      loop = false,
      controls = true,
      maxResolution = '1440p',
    },
    ref,
  ) {
    const posterUrl =
      poster || `https://image.mux.com/${playbackId}/thumbnail.jpg?fit_mode=preserve`

    return (
      <MuxPlayerReact
        ref={ref as React.Ref<MuxPlayerRefAttributes>}
        playbackId={playbackId}
        poster={posterUrl}
        title={title}
        streamType="on-demand"
        maxResolution={maxResolution}
        autoPlay={autoPlay ? 'muted' : false}
        muted={muted}
        loop={loop}
        nohotkeys={!controls}
        playsInline
        className={className}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          aspectRatio: 'auto',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          '--controls': controls ? undefined : 'none',
          '--media-object-fit': 'cover',
        }}
      />
    )
  },
)
