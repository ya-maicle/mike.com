'use client'

import * as React from 'react'
import { DecorativeVideo } from '@/components/decorative-video'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DecorativeVideoPlayerProps {
  playbackId: string
  className?: string
  aspectRatio?: string
}

function toCssAspectRatio(ratio?: string): string {
  if (!ratio) return '16 / 9'
  const [w, h] = ratio.split(/[:/]/).map((n) => Number(n.trim()))
  if (!w || !h || !Number.isFinite(w) || !Number.isFinite(h)) return '16 / 9'
  return `${w} / ${h}`
}

export function DecorativeVideoPlayer({
  playbackId,
  className,
  aspectRatio,
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
    <div
      className={cn('relative group overflow-hidden rounded-[8px]', className)}
      style={{ aspectRatio: toCssAspectRatio(aspectRatio) }}
    >
      <DecorativeVideo
        ref={videoRef}
        playbackId={playbackId}
        className="absolute inset-0 h-full w-full"
        // scale-[1.02]: overfills the rounded clip to prevent subpixel hairlines
        videoClassName="block h-full w-full object-cover scale-[1.02] origin-center"
      />

      <div className="absolute bottom-4 right-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full w-7 h-7 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground border border-border/10 transition-transform active:scale-95"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-3 w-3 fill-current" />
          ) : (
            <Play className="h-3 w-3 fill-current ml-0.5" />
          )}
        </Button>
      </div>
    </div>
  )
}
