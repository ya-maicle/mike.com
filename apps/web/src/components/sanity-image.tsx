'use client'

import Image from 'next/image'
import sanityLoader from '@/sanity/loader'
import type { SanityImage as SanityImageType } from '@/sanity/queries'

export function SanityImage({
  image,
  sizes = '(max-width: 768px) 100vw, (max-width: 1376px) 100vw, 1376px',
  className,
  priority,
}: {
  image: SanityImageType
  sizes?: string
  className?: string
  priority?: boolean
}) {
  if (!image?.asset?.url) return null

  return (
    <Image
      loader={sanityLoader}
      src={image.asset.url}
      alt={image.alt || ''}
      width={image.asset.metadata?.dimensions?.width || 1920}
      height={image.asset.metadata?.dimensions?.height || 1080}
      sizes={sizes}
      className={className}
      priority={priority}
      quality={90}
    />
  )
}
