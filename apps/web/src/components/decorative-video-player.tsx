'use client'

import * as React from 'react'
import { DecorativeVideo } from '@/components/decorative-video'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DecorativeVideoPlayerProps {
  playbackId: string
  className?: string
}

export function DecorativeVideoPlayer({ playbackId, className }: DecorativeVideoPlayerProps) {
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
    <div className="relative group overflow-hidden rounded-[8px]">
      <DecorativeVideo
        ref={videoRef}
        playbackId={playbackId}
        className={cn('w-full h-auto', className)}
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
