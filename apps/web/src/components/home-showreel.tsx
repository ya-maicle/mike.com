'use client'

import * as React from 'react'
import { MuxContentPlayer } from '@/components/mux-content-player'
import { Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

export function HomeShowreel({ playbackId }: { playbackId: string }) {
  const [open, setOpen] = React.useState(false)
  const [paused, setPaused] = React.useState(false)
  const [reducedMotion, setReducedMotion] = React.useState(true)
  const previewRef = React.useRef<HTMLVideoElement>(null)
  const poster = `https://image.mux.com/${playbackId}/thumbnail.jpg?time=4.5&width=1920&fit_mode=preserve`
  const playPreview = !open && !paused && !reducedMotion

  React.useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(preference.matches)
    update()
    preference.addEventListener('change', update)
    return () => preference.removeEventListener('change', update)
  }, [])

  React.useEffect(() => {
    const preview = previewRef.current
    if (!preview) return
    if (playPreview) void preview.play?.()?.catch(() => {})
    else preview.pause?.()
  }, [playPreview])

  function changeOpen(next: boolean) {
    if (next) previewRef.current?.pause?.()
    setOpen(next)
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <div className="group relative aspect-video overflow-hidden rounded-lg bg-black">
        <div data-showreel-preview aria-hidden="true" className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element -- Keep the Mux poster in SSR without a second image proxy. */}
          <img
            src={poster}
            alt=""
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <MuxContentPlayer
            ref={previewRef}
            playbackId={playbackId}
            poster={poster}
            autoPlay={playPreview}
            muted
            loop
            controls={false}
            maxResolution="1080p"
            className="absolute inset-0"
          />
        </div>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            aria-label="Play showreel with sound"
            className="absolute inset-0 h-full w-full rounded-none p-0 hover:bg-transparent focus-visible:ring-inset focus-visible:ring-white"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-black/70 text-white transition-transform group-hover:scale-105 motion-reduce:transform-none">
              <Play className="size-6 translate-x-0.5 fill-current" aria-hidden="true" />
            </span>
          </Button>
        </DialogTrigger>
        {!reducedMotion ? (
          <Button
            variant="ghost"
            size="icon"
            aria-label={paused ? 'Play background preview' : 'Pause background preview'}
            onClick={() => setPaused((value) => !value)}
            className="absolute bottom-4 right-4 size-10 bg-black/70 text-white hover:bg-black hover:text-white"
          >
            {paused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
          </Button>
        ) : null}
      </div>
      <DialogContent
        variant="media"
        aria-describedby={undefined}
        onClick={(event) => {
          if (event.target === event.currentTarget) changeOpen(false)
        }}
      >
        <DialogTitle className="sr-only">Product design showreel</DialogTitle>
        {open ? (
          <div className="aspect-video w-full max-w-[calc((100dvh-2rem)*16/9)] overflow-hidden rounded-lg">
            <MuxContentPlayer
              playbackId={playbackId}
              title="Product design showreel"
              autoPlay
              muted={false}
              objectFit="contain"
              maxResolution="1080p"
              controls
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
