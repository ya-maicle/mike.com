'use client'

import * as React from 'react'
import { DecorativeVideo } from '@/components/decorative-video'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MediaFrame } from '@/components/ui/media-frame'

interface DecorativeVideoPlayerProps {
  playbackId: string
  tokens?: import('@/components/mux-content-player').MuxPlaybackTokens
  className?: string
  bordered?: boolean
  aspectRatio?: string
  maxResolution?: import('@/components/mux-content-player').MuxMaxResolution
  minResolution?: import('@/components/mux-content-player').MuxMinResolution
  eager?: boolean
  priority?: boolean
}

function toCssAspectRatio(ratio?: string): string {
  if (!ratio) return '16 / 9'
  const [w, h] = ratio.split(/[:/]/).map((n) => Number(n.trim()))
  if (!w || !h || !Number.isFinite(w) || !Number.isFinite(h)) return '16 / 9'
  return `${w} / ${h}`
}

export function DecorativeVideoPlayer({
  playbackId,
  tokens,
  className,
  bordered,
  aspectRatio,
  maxResolution,
  minResolution,
  eager,
  priority,
}: DecorativeVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(true)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return
    if (isPlaying) {
      video.pause()
    } else {
      const result = video.play()
      if (result) result.catch(() => {})
    }
    setIsPlaying(!isPlaying)
  }

  return (
    <MediaFrame
      className={className}
      bordered={bordered}
      style={{ aspectRatio: toCssAspectRatio(aspectRatio) }}
    >
      <DecorativeVideo
        ref={videoRef}
        playbackId={playbackId}
        tokens={tokens}
        maxResolution={maxResolution}
        minResolution={minResolution}
        eager={eager}
        priority={priority}
        className="absolute inset-0 h-full w-full"
        videoClassName="block h-full w-full object-cover"
      />

      <DecorativeVideoPlaybackButton isPlaying={isPlaying} onClick={togglePlay} />
    </MediaFrame>
  )
}

// Shared with the homepage showreel so its control keeps the original video styling.
export function DecorativeVideoPlaybackButton({
  isPlaying,
  onClick,
}: {
  isPlaying: boolean
  onClick: () => void
}) {
  return (
    <div className="absolute bottom-4 right-4 z-10">
      <Button
        variant="secondary"
        size="icon"
        className="rounded-full w-7 h-7 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground border border-border/10 transition-transform active:scale-95"
        aria-label={isPlaying ? 'Pause background preview' : 'Play background preview'}
        onClick={onClick}
      >
        {isPlaying ? (
          <Pause className="h-3 w-3 fill-current" />
        ) : (
          <Play className="h-3 w-3 fill-current ml-0.5" />
        )}
      </Button>
    </div>
  )
}
