import imageUrlBuilder from '@sanity/image-url'
import type { SanityImage } from './queries'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!

const builder = imageUrlBuilder({ projectId, dataset })

export function urlFor(image: SanityImage) {
  return builder.image(image)
}
