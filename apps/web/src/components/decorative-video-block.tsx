'use client'

import * as React from 'react'
import { MuxPlayer } from '@/components/mux-player'
import { Play, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DecorativeVideoBlockProps {
  playbackId: string
  title?: string
  description?: string
}

export function DecorativeVideoBlock({
  playbackId,
  title,
  description,
}: DecorativeVideoBlockProps) {
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
    <section className="w-full space-y-3 py-2 max-w-[var(--content-max-width)] mx-auto">
      <div className="relative group overflow-hidden rounded-[8px]">
        <div className="relative w-full aspect-video bg-muted">
          <MuxPlayer
            ref={playerRef}
            playbackId={playbackId}
            className="w-full h-full object-cover"
            autoPlay={true}
            muted
            loop
            showControls={false}
          />

          <div className="absolute bottom-4 right-4 z-10">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-10 h-10 bg-background/80 hover:bg-background backdrop-blur-sm text-foreground border border-border/10 shadow-sm"
              onClick={togglePlay}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {(title || description) && (
        <div className="mx-auto max-w-[592px]">
          {title && <h3 className="text-xl font-semibold tracking-tight">{title}</h3>}
          {description && <p className="text-muted-foreground">{description}</p>}
        </div>
      )}
    </section>
  )
}
