'use client'

import Image from 'next/image'
import { urlFor } from '@/sanity/image-builder'
import type { SanityImage as SanityImageType } from '@/sanity/queries'

interface SanityImageProps {
  image: SanityImageType
  sizes?: string
  className?: string
  priority?: boolean
  quality?: number
}

export function SanityImage({
  image,
  sizes = '(max-width: 768px) 100vw, (max-width: 1376px) 100vw, 1376px',
  className,
  priority,
  quality = 90,
}: SanityImageProps) {
  if (!image?.asset) return null

  // Get dimensions from image metadata
  const width = image.asset.metadata?.dimensions?.width || 1920
  const height = image.asset.metadata?.dimensions?.height || 1080

  // Build optimized URL with hotspot/crop support
  const src = urlFor(image).auto('format').quality(quality).fit('crop').url()

  if (!src) return null

  return (
    <Image
      src={src}
      alt={image.alt || ''}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      priority={priority}
      quality={quality}
    />
  )
}
