import { groq } from 'next-sanity'

export const ALL_CASE_STUDY_SLUGS_QUERY = groq`
  *[_type == "caseStudy" && defined(slug.current) && published != false]{
    "slug": slug.current
  }
`

export const CASE_STUDY_BY_SLUG_QUERY = groq`
  *[_type == "caseStudy" && slug.current == $slug][0]{
    _id,
    title,
    summary,
    publishedAt,
    seoSettings,
    slug,
    coverImage{..., asset->},
    projectInfo,

    // Inline content blocks
    content[]{
      ...,
      _type == 'imageBlock' => {
        ...,
        image{..., asset->}
      },
      _type == 'videoBlock' => {
        ...,
        video{asset->{playbackId}}
      },
      _type == 'carouselBlock' => {
        ...,
        items[]{
          kind,
          image{..., asset->},
          video{asset->{playbackId}}
        }
      }
    }
  }
`

export type SanityImage = {
  _type: 'image'
  asset?: {
    _ref?: string
    _id?: string
    url?: string
    metadata?: {
      dimensions: {
        width: number
        height: number
      }
    }
  }
  alt?: string
  caption?: string
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
}

export type ImageBlock = {
  _type: 'imageBlock'
  _key?: string
  image: SanityImage
  title?: string
  description?: string
}

export type VideoBlock = {
  _type: 'videoBlock'
  _key?: string
  video: { asset: { playbackId: string } }
  title?: string
  description?: string
}

export type CarouselBlock = {
  _type: 'carouselBlock'
  _key?: string
  items: (
    | { kind: 'image'; image: SanityImage }
    | { kind: 'video'; video: { asset: { playbackId: string } } }
  )[]
  title?: string
  description?: string
}

export type TwoColumnImageBlock = {
  _type: 'twoColumnImageBlock'
  _key?: string
  leftImage: SanityImage
  rightImage: SanityImage
}

export type CaseStudy = {
  _id: string
  _type: 'caseStudy'
  title: string
  summary?: string
  slug: { current: string }
  publishedAt?: string
  coverImage?: SanityImage
  headerMedia?: {
    type: 'image' | 'video'
    image?: SanityImage
    video?: { asset: { playbackId: string } }
  }
  projectInfo?: {
    client?: string
    sector?: string[]
    discipline?: string[]
    year?: string
    link?: { text?: string; url?: string }
  }
  content?: (
    | { _type: 'block'; [key: string]: any } // eslint-disable-line @typescript-eslint/no-explicit-any
    | ImageBlock
    | VideoBlock
    | CarouselBlock
    | TwoColumnImageBlock
  )[]
  panelContent?: (
    | { _type: 'block'; [key: string]: any } // eslint-disable-line @typescript-eslint/no-explicit-any
    | ImageBlock
    | VideoBlock
    | CarouselBlock
    | TwoColumnImageBlock
  )[]
  seoSettings?: {
    metaTitle?: string
    metaDescription?: string
    shareImage?: SanityImage
  }
}
