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
  className?: string
}

const DEFAULT_QUALITY = 85
const BASE_WIDTH = 2000

function parseRatio(aspectRatio: AspectRatio): number | null {
  if (aspectRatio === 'auto') return null
  if (typeof aspectRatio === 'number') return aspectRatio
  const [w, h] = aspectRatio.split('/').map(Number)
  if (!w || !h) return null
  return w / h
}

function makeLoader(image: SanityImageType, ratio: number | null) {
  return ({ width, quality }: ImageLoaderProps) => {
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
  className,
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
      priority={priority}
      quality={quality}
      placeholder={blurDataURL ? 'blur' : 'empty'}
      blurDataURL={blurDataURL}
    />
  )
}

export const SanityImage = React.memo(SanityImageImpl)
