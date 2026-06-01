'use client'

import { SanityImage } from '@/components/sanity-image'
import { DecorativeVideo } from '@/components/decorative-video'
import { cn } from '@/lib/utils'
import type { ResolvedCover } from '@/lib/cover-media'

type CoverMediaFillProps = {
  cover: ResolvedCover
  sizes: string
  imageAspectRatio: `${number}/${number}`
  className?: string
  priority?: boolean
}

export function CoverMediaFill({
  cover,
  sizes,
  imageAspectRatio,
  className,
  priority,
}: CoverMediaFillProps) {
  if (!cover) return null

  if (cover.kind === 'video') {
    return (
      <DecorativeVideo
        playbackId={cover.playbackId}
        className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}
        videoClassName="block h-full w-full object-cover"
      />
    )
  }

  return (
    <SanityImage
      image={cover.image}
      className={cn('h-full w-full object-cover', className)}
      sizes={sizes}
      aspectRatio={imageAspectRatio}
      priority={priority}
    />
  )
}
