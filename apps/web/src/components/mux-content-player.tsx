'use client'

import * as React from 'react'
import MuxPlayerReact from '@mux/mux-player-react/lazy'
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react'

export interface MuxPlaybackTokens {
  playback?: string
  thumbnail?: string
  storyboard?: string
}

export type MuxMaxResolution = '720p' | '1080p' | '1440p' | '2160p'
export type MuxMinResolution = '480p' | '540p' | '720p' | '1080p' | '1440p' | '2160p'

export interface MuxContentPlayerProps {
  playbackId: string
  /** Required for assets with a signed playback policy; omit for public assets. */
  tokens?: MuxPlaybackTokens
  title?: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
  maxResolution?: MuxMaxResolution
  /**
   * ABR floor — keeps Mux from starting on a soft low rendition. Only set this
   * on decorative loops; the gated content player must stay adaptive so it
   * never stalls behind user-initiated playback.
   */
  minResolution?: MuxMinResolution
}

export const MuxContentPlayer = React.forwardRef<HTMLVideoElement | null, MuxContentPlayerProps>(
  function MuxContentPlayer(
    {
      playbackId,
      tokens,
      title,
      poster,
      className,
      autoPlay = false,
      muted = false,
      loop = false,
      controls = true,
      // Reason: content videos render in the 1376px canvas = 2752 device px on
      // retina; a 1440p ceiling leaves them permanently soft there.
      maxResolution = '2160p',
      minResolution,
    },
    ref,
  ) {
    // Reason: signed thumbnail URLs reject loose query params — render params
    // (fit_mode) are embedded in the token claims instead.
    const posterUrl =
      poster ||
      (tokens?.thumbnail
        ? `https://image.mux.com/${playbackId}/thumbnail.jpg?token=${tokens.thumbnail}`
        : `https://image.mux.com/${playbackId}/thumbnail.jpg?fit_mode=preserve`)

    return (
      <MuxPlayerReact
        ref={ref as React.Ref<MuxPlayerRefAttributes>}
        playbackId={playbackId}
        tokens={tokens}
        poster={posterUrl}
        title={title}
        streamType="on-demand"
        maxResolution={maxResolution}
        minResolution={minResolution}
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
          '--controls': controls ? undefined : 'none',
          '--media-object-fit': 'cover',
        }}
      />
    )
  },
)
