'use client'

import { getImageProps } from 'next/image'

import { SanityImage, getSanityImageProps, type SanityImageProps } from '@/components/sanity-image'
import type { SanityImage as SanityImageType } from '@/sanity/queries'

interface ResponsiveSanityImageProps extends SanityImageProps {
  mobileImage?: SanityImageType
}

function withoutPlaceholder(props: NonNullable<ReturnType<typeof getSanityImageProps>>) {
  return {
    ...props,
    placeholder: 'empty' as const,
    blurDataURL: undefined,
  }
}

export function ResponsiveSanityImage({
  image,
  mobileImage,
  ...props
}: ResponsiveSanityImageProps) {
  if (!mobileImage?.asset) {
    return <SanityImage image={image} {...props} />
  }

  const desktopInput = getSanityImageProps({ image, ...props })
  const mobileInput = getSanityImageProps({ image: mobileImage, ...props, aspectRatio: 'auto' })

  if (!desktopInput || !mobileInput) {
    return <SanityImage image={image} {...props} />
  }

  const {
    props: { srcSet: desktopSrcSet, alt: desktopAlt, ...desktopProps },
  } = getImageProps(withoutPlaceholder(desktopInput))
  const {
    props: { srcSet: mobileSrcSet, sizes: mobileSizes },
  } = getImageProps(withoutPlaceholder(mobileInput))

  return (
    <picture className="block">
      <source media="(max-width: 767px)" srcSet={mobileSrcSet} sizes={mobileSizes} />
      {/* Next.js recommends getImageProps + picture for art-directed responsive images. */}
      <img {...desktopProps} alt={desktopAlt} srcSet={desktopSrcSet} />
    </picture>
  )
}
