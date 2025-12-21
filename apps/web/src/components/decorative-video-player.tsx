'use client'

import * as React from 'react'
import { MuxPlayer } from '@/components/mux-player'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DecorativeVideoPlayerProps {
  playbackId: string
  className?: string
}

export function DecorativeVideoPlayer({ playbackId, className }: DecorativeVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(true)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = React.useRef<any>(null)

  const togglePlay = () => {
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.pause()
      } else {
        playerRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="relative group overflow-hidden rounded-[8px]">
      <MuxPlayer
        ref={playerRef}
        playbackId={playbackId}
        className={cn('w-full h-auto', className)}
        autoPlay={true}
        muted={true}
        loop={true}
        showControls={false}
      />

      <div className="absolute bottom-4 right-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full w-6 h-6 md:w-7 md:h-7 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground border border-border/10 transition-transform active:scale-95"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-2.5 w-2.5 md:h-3 md:w-3 fill-current" />
          ) : (
            <Play className="h-2.5 w-2.5 md:h-3 md:w-3 fill-current ml-0.5" />
          )}
        </Button>
      </div>
    </div>
  )
}
