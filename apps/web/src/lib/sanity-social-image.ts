import type { SanityImage } from '@/sanity/queries'
import { urlFor } from '@/sanity/image-builder'
import type { ProfileImages } from '@/sanity/queries/home-page-queries'

export function socialImageFromSanity(image: SanityImage | undefined, alt: string) {
  if (!image?.asset) return undefined

  return {
    url: urlFor(image).width(1200).height(630).fit('crop').url(),
    width: 1200,
    height: 630,
    alt,
  }
}

export function profileImageUrlsFromSanity(images: ProfileImages | null | undefined) {
  if (!images) return []

  return [images.square, images.fourByThree, images.sixteenByNine]
    .filter((image): image is SanityImage => Boolean(image?.asset))
    .map((image) => urlFor(image).url())
}
