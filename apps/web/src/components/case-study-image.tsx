'use client'

import * as React from 'react'
import { Expand, Minus, Plus } from 'lucide-react'

import { ResponsiveSanityImage } from '@/components/responsive-sanity-image'
import { SanityImage } from '@/components/sanity-image'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  CASE_STUDY_MOBILE_MEDIA_QUERY,
  CASE_STUDY_ZOOM_LEVELS,
  fitCaseStudyImage,
  selectCaseStudyImage,
} from '@/lib/case-study-image'
import { cn } from '@/lib/utils'
import type { SanityImage as SanityImageType } from '@/sanity/queries'

type AspectRatio = number | `${number}/${number}` | 'auto'

interface CaseStudyImageProps {
  image: SanityImageType
  mobileImage?: SanityImageType
  caption?: string
  className?: string
  sizes: string
  aspectRatio?: AspectRatio
  loading?: 'eager' | 'lazy'
  priority?: boolean
  triggerMode?: 'image' | 'control'
}

export function CaseStudyImage({
  image,
  mobileImage,
  caption,
  className,
  sizes,
  aspectRatio = 'auto',
  loading,
  priority,
  triggerMode = 'image',
}: CaseStudyImageProps) {
  const [open, setOpen] = React.useState(false)
  const [zoomIndex, setZoomIndex] = React.useState(0)
  const [isMobileLightbox, setIsMobileLightbox] = React.useState(false)
  const [viewport, setViewport] = React.useState({ width: 0, height: 0 })
  const [scrollElement, setScrollElement] = React.useState<HTMLDivElement | null>(null)
  const zoom = CASE_STUDY_ZOOM_LEVELS[zoomIndex]
  const lightboxImage = selectCaseStudyImage(image, mobileImage, isMobileLightbox)

  React.useEffect(() => {
    if (!open) return

    const media = window.matchMedia(CASE_STUDY_MOBILE_MEDIA_QUERY)
    const updateImage = () => {
      setIsMobileLightbox(media.matches)
      setZoomIndex(0)
    }

    media.addEventListener('change', updateImage)
    return () => media.removeEventListener('change', updateImage)
  }, [open])

  React.useEffect(() => {
    if (!open || !scrollElement) return
    const updateViewport = () => {
      setViewport({ width: scrollElement.clientWidth, height: scrollElement.clientHeight })
    }
    const observer = new ResizeObserver(updateViewport)
    observer.observe(scrollElement)
    updateViewport()
    return () => observer.disconnect()
  }, [open, scrollElement])

  React.useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => {
      const element = scrollElement
      if (!element) return
      element.scrollTo({
        left: Math.max(0, (element.scrollWidth - element.clientWidth) / 2),
        top: Math.max(0, (element.scrollHeight - element.clientHeight) / 2),
        behavior: zoomIndex === 0 ? 'auto' : 'smooth',
      })
    })
    return () => cancelAnimationFrame(frame)
  }, [lightboxImage, open, scrollElement, viewport, zoomIndex])

  const fitted = fitCaseStudyImage(lightboxImage, viewport, caption ? 152 : 112)
  const zoomOut = () => setZoomIndex((current) => Math.max(0, current - 1))
  const zoomIn = () =>
    setZoomIndex((current) => Math.min(CASE_STUDY_ZOOM_LEVELS.length - 1, current + 1))

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      zoomIn()
    } else if (event.key === '-') {
      event.preventDefault()
      zoomOut()
    } else if (event.key === '0') {
      event.preventDefault()
      setZoomIndex(0)
    }
  }

  const responsiveImage = (
    <ResponsiveSanityImage
      image={image}
      mobileImage={mobileImage}
      className={className}
      sizes={sizes}
      aspectRatio={aspectRatio}
      loading={loading}
      priority={priority}
    />
  )

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setIsMobileLightbox(window.matchMedia(CASE_STUDY_MOBILE_MEDIA_QUERY).matches)
        }
        setOpen(nextOpen)
        setZoomIndex(0)
      }}
    >
      {triggerMode === 'image' ? (
        <DialogTrigger asChild>
          <button
            type="button"
            className="group relative block w-full cursor-zoom-in rounded-[8px] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Open larger view of ${image.alt || 'case study image'}`}
          >
            {responsiveImage}
            <span className="absolute right-3 top-3 flex size-11 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground opacity-100 shadow-sm backdrop-blur-md transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
              <Expand className="size-4" aria-hidden="true" />
            </span>
          </button>
        </DialogTrigger>
      ) : (
        <div className="group relative">
          {responsiveImage}
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-3 top-3 z-10 size-11 border border-border/60 bg-background/70 opacity-100 shadow-sm backdrop-blur-md md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100"
              aria-label={`Open larger view of ${image.alt || 'case study image'}`}
            >
              <Expand className="size-4" />
            </Button>
          </DialogTrigger>
        </div>
      )}

      <DialogContent
        aria-describedby={undefined}
        onKeyDown={handleKeyDown}
        className={cn(
          'h-dvh w-screen max-w-none gap-0 rounded-none border-0 bg-background/95 p-0 shadow-none',
          '[&>button:last-child]:flex [&>button:last-child]:size-11 [&>button:last-child]:items-center [&>button:last-child]:justify-center',
          '[&>button:last-child]:rounded-full [&>button:last-child]:border [&>button:last-child]:border-border/60',
          '[&>button:last-child]:bg-background/70 [&>button:last-child]:opacity-100 [&>button:last-child]:backdrop-blur-md',
        )}
      >
        <DialogTitle className="sr-only">
          Larger view of {lightboxImage.alt || image.alt || 'case study image'}
        </DialogTitle>

        <div
          className="absolute left-4 top-4 z-20 flex items-center gap-2"
          role="group"
          aria-label="Image zoom controls"
        >
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-11 border border-border/60 bg-background/70 shadow-sm backdrop-blur-md"
            onClick={zoomOut}
            disabled={zoomIndex === 0}
            aria-label="Zoom out"
          >
            <Minus className="size-4" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-11 min-w-16 border border-border/60 bg-background/70 px-3 text-sm shadow-sm backdrop-blur-md"
            onClick={() => setZoomIndex(0)}
            aria-label="Reset image zoom to fit"
          >
            {zoomIndex === 0 ? 'Fit' : `${Math.round(zoom * 100)}%`}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="size-11 border border-border/60 bg-background/70 shadow-sm backdrop-blur-md"
            onClick={zoomIn}
            disabled={zoomIndex === CASE_STUDY_ZOOM_LEVELS.length - 1}
            aria-label="Zoom in"
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <div
          ref={setScrollElement}
          className="h-full w-full touch-pan-x touch-pan-y overflow-auto overscroll-contain"
          tabIndex={0}
          aria-label="Zoomed image. Scroll to pan when magnified."
        >
          <div className="grid min-h-full min-w-full place-items-center p-4">
            <div
              className="shrink-0 overflow-hidden rounded-[8px]"
              style={{ width: fitted.width * zoom, height: fitted.height * zoom }}
            >
              <SanityImage
                image={lightboxImage}
                className="h-full w-full max-w-none object-contain"
                sizes={`${Math.round(zoom * 100)}vw`}
                aspectRatio="auto"
              />
            </div>
          </div>
        </div>

        {caption && (
          <p className="absolute bottom-4 left-1/2 z-20 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-full border border-border/60 bg-background/80 px-4 py-2 text-center text-sm text-muted-foreground shadow-sm backdrop-blur-md">
            {caption}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
