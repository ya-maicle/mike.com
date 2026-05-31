import imageUrlBuilder from '@sanity/image-url'
import type { SanityImage } from './queries'

// Sanity project configuration
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

// Initialize the image URL builder
const builder = imageUrlBuilder({ projectId, dataset })

/**
 * Build a Sanity image URL. Wraps `@sanity/image-url` with project + dataset
 * pre-configured. Use chained methods (`.width()`, `.height()`, `.fit()`,
 * `.auto('format')`, `.quality()`) to control delivery.
 */
export function urlFor(image: SanityImage) {
  return builder.image(image)
}
