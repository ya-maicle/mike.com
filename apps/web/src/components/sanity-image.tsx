'use client'

import * as React from 'react'
import Image, { type ImageLoaderProps } from 'next/image'
import { urlFor } from '@/sanity/image-builder'
import type { SanityImage as SanityImageType } from '@/sanity/queries'

type AspectRatio = number | `${number}/${number}` | 'auto'

interface SanityImageProps {
  image: SanityImageType
  sizes: string
  aspectRatio: AspectRatio
  quality?: number
  priority?: boolean
  /** Eager-load without the preload hint `priority` adds (e.g. carousel slides). */
  loading?: 'eager' | 'lazy'
  className?: string
  objectPosition?: React.CSSProperties['objectPosition']
}

// Reason: WebP below q90 shows ringing on fine UI text and gradients.
const DEFAULT_QUALITY = 90
const BASE_WIDTH = 2000

function parseRatio(aspectRatio: AspectRatio): number | null {
  if (aspectRatio === 'auto') return null
  if (typeof aspectRatio === 'number') return aspectRatio
  const [w, h] = aspectRatio.split('/').map(Number)
  if (!w || !h) return null
  return w / h
}

// Reason: the CDN silently returns the source size when asked for more pixels;
// the browser upscales instead. Warn in dev so under-sized assets are caught.
const warnedAssets = new Set<string>()

function warnIfUpscaled(image: SanityImageType, width: number, ratio: number | null) {
  if (process.env.NODE_ENV === 'production') return
  const id = image.asset?._id || image.asset?._ref
  const dims = image.asset?.metadata?.dimensions
  if (!id || !dims?.width || warnedAssets.has(id)) return
  const neededHeight = ratio !== null ? Math.round(width / ratio) : 0
  if (dims.width < width || (dims.height ?? Infinity) < neededHeight) {
    warnedAssets.add(id)
    console.warn(
      `[SanityImage] ${id}: browser requested ${width}px wide but the source is ` +
        `${dims.width}×${dims.height ?? '?'} — it will be upscaled and look soft. ` +
        `Re-export at 2× the rendered CSS size (see MEDIA-QUALITY.md).`,
    )
  }
}

function makeLoader(image: SanityImageType, ratio: number | null) {
  return ({ width, quality }: ImageLoaderProps) => {
    warnIfUpscaled(image, width, ratio)
    let builder = urlFor(image).width(width).auto('format')
    if (ratio !== null) {
      builder = builder.height(Math.round(width / ratio)).fit('crop')
    }
    if (quality) builder = builder.quality(quality)
    return builder.url() || ''
  }
}

function SanityImageImpl({
  image,
  sizes,
  aspectRatio,
  quality = DEFAULT_QUALITY,
  priority,
  loading,
  className,
  objectPosition,
}: SanityImageProps) {
  // Reason: asset id as src keeps Next.js' loader-width validator happy
  // (it compares loader output to src; identical strings trigger a warning).
  const src = image?.asset?._id || image?.asset?._ref
  if (!src) return null

  const ratio = parseRatio(aspectRatio)
  const loader = makeLoader(image, ratio)
  const blurDataURL = image.asset?.metadata?.lqip

  let width: number
  let height: number
  if (ratio !== null) {
    width = BASE_WIDTH
    height = Math.round(BASE_WIDTH / ratio)
  } else {
    width = image.asset?.metadata?.dimensions?.width ?? BASE_WIDTH
    height = image.asset?.metadata?.dimensions?.height ?? Math.round(BASE_WIDTH * 0.75)
  }

  return (
    <Image
      loader={loader}
      src={src}
      alt={image.alt || ''}
      width={width}
      height={height}
      sizes={sizes}
      className={className}
      style={objectPosition ? { objectPosition } : undefined}
      priority={priority}
      loading={priority ? undefined : loading}
      quality={quality}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
    />
  )
}

export const SanityImage = React.memo(SanityImageImpl)
