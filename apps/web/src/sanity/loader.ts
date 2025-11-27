import { ImageLoaderProps } from 'next/image'

export default function sanityLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src)
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'max')
  url.searchParams.set('w', width.toString())
  if (quality) {
    url.searchParams.set('q', quality.toString())
  }
  return url.toString()
}
