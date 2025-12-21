'use client'

import * as React from 'react'
import {
  MediaController,
  MediaControlBar,
  MediaPlayButton,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaMuteButton,
  MediaFullscreenButton,
} from 'media-chrome/react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react'

interface CustomVideoPlayerProps {
  playbackId: string
  title?: string
  poster?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
}

export function CustomVideoPlayer({
  playbackId,
  title,
  poster,
  className,
  autoPlay = false,
  muted = false,
  loop = false,
}: CustomVideoPlayerProps) {
  const posterUrl = poster || `https://image.mux.com/${playbackId}/thumbnail.jpg`
  const streamUrl = `https://stream.mux.com/${playbackId}.m3u8`

  return (
    <div className={className} suppressHydrationWarning>
      <MediaController
        suppressHydrationWarning
        style={
          {
            display: 'block',
            width: '100%',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            '--media-primary-color': 'white',
            '--media-secondary-color': 'transparent',
            '--media-control-background': 'transparent',
            '--media-control-hover-background': 'transparent',
            '--media-button-icon-width': '18px',
            '--media-button-icon-height': '18px',
            '--media-range-track-height': '3px',
            '--media-range-thumb-height': '0px',
            '--media-range-thumb-width': '0px',
            '--media-range-bar-color': 'white',
            '--media-range-track-background': 'rgba(255, 255, 255, 0.3)',
            '--media-time-range-buffered-color': 'rgba(255, 255, 255, 0.5)',
            '--media-font-family': 'inherit',
            '--media-font-size': '13px',
            '--media-focus-visible-box-shadow': 'none',
          } as React.CSSProperties
        }
      >
        <video
          slot="media"
          src={streamUrl}
          poster={posterUrl}
          playsInline
          preload="metadata"
          crossOrigin="anonymous"
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          title={title}
          suppressHydrationWarning
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        <MediaControlBar
          style={{
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.6))',
            paddingTop: '48px',
            paddingLeft: '16px',
            paddingRight: '16px',
            paddingBottom: '12px',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <MediaPlayButton style={{ width: '20px', height: '20px' }}>
            <span slot="play">
              <Play className="w-[18px] h-[18px] text-white fill-white" />
            </span>
            <span slot="pause">
              <Pause className="w-[18px] h-[18px] text-white fill-white" />
            </span>
          </MediaPlayButton>

          <MediaTimeDisplay
            showDuration
            style={{
              fontSize: '13px',
              opacity: 0.9,
              minWidth: 'auto',
            }}
          />

          <MediaTimeRange style={{ flex: 1 }} />

          <MediaMuteButton style={{ width: '20px', height: '20px' }}>
            <span slot="high">
              <Volume2 className="w-[18px] h-[18px] text-white" />
            </span>
            <span slot="medium">
              <Volume2 className="w-[18px] h-[18px] text-white" />
            </span>
            <span slot="low">
              <Volume2 className="w-[18px] h-[18px] text-white" />
            </span>
            <span slot="off">
              <VolumeX className="w-[18px] h-[18px] text-white" />
            </span>
          </MediaMuteButton>

          <MediaFullscreenButton style={{ width: '20px', height: '20px' }}>
            <span slot="enter">
              <Maximize className="w-[18px] h-[18px] text-white" />
            </span>
            <span slot="exit">
              <Minimize className="w-[18px] h-[18px] text-white" />
            </span>
          </MediaFullscreenButton>
        </MediaControlBar>
      </MediaController>
    </div>
  )
}
