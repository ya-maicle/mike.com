import imageUrlBuilder from '@sanity/image-url'
import type { SanityImage } from './queries'

// Sanity project configuration
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

// Initialize the image URL builder
const builder = imageUrlBuilder({ projectId, dataset })

/**
 * Generate an optimized image URL with automatic:
 * - Format conversion (WebP/AVIF)
 * - Hotspot/crop respect
 * - Quality optimization
 * - Dimension resizing
 */
export function urlFor(image: SanityImage) {
  return builder.image(image)
}

/**
 * Get an optimized image URL with common defaults
 * @param image Sanity image object
 * @param options Width, height, quality, DPR settings
 */
export function getOptimizedImageUrl(
  image: SanityImage,
  options: {
    width?: number
    height?: number
    quality?: number
    dpr?: number
  } = {},
) {
  const { width, height, quality = 90, dpr = 2 } = options

  let builder = urlFor(image).auto('format').quality(quality).dpr(dpr).fit('crop')

  if (width) builder = builder.width(width)
  if (height) builder = builder.height(height)

  return builder.url()
}
