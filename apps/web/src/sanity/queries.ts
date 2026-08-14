import { groq } from 'next-sanity'

// Shared GROQ fragments — keep image projections identical across queries so
// SanityImage always has _id + dimensions + lqip available client-side.
export const IMAGE_ASSET_PROJECTION = groq`{ _id, url, metadata { lqip, dimensions } }`
export const IMAGE_PROJECTION = groq`{..., asset->${IMAGE_ASSET_PROJECTION}}`

export const MUX_VIDEO_PROJECTION = groq`{
  asset->{
    playbackId,
    "playbackPolicy": coalesce(data.playback_ids[0].policy, "public"),
    "aspectRatio": data.aspect_ratio
  }
}`
export const COVER_PROJECTION = groq`{ type, image${IMAGE_PROJECTION}, video${MUX_VIDEO_PROJECTION} }`

export type SanityImage = {
  _type: 'image'
  asset?: {
    _ref?: string
    _id?: string
    url?: string
    metadata?: {
      lqip?: string
      dimensions?: {
        width: number
        height: number
        aspectRatio?: number
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
  video: {
    asset: {
      playbackId: string
      playbackPolicy?: 'public' | 'signed'
      aspectRatio?: string
    }
  }
  title?: string
  description?: string
}

export type CarouselBlock = {
  _type: 'carouselBlock'
  _key?: string
  items: (
    | { kind: 'image'; image: SanityImage }
    | {
        kind: 'video'
        video: { asset: { playbackId: string; playbackPolicy?: 'public' | 'signed' } }
      }
  )[]
  title?: string
  description?: string
}

export type TwoColumnImageBlock = {
  _type: 'twoColumnImageBlock'
  _key?: string
  leftKind?: 'image' | 'video'
  rightKind?: 'image' | 'video'
  leftImage?: SanityImage
  rightImage?: SanityImage
  leftVideo?: {
    asset?: {
      playbackId?: string
      playbackPolicy?: 'public' | 'signed'
      aspectRatio?: string
    }
  }
  rightVideo?: {
    asset?: {
      playbackId?: string
      playbackPolicy?: 'public' | 'signed'
      aspectRatio?: string
    }
  }
}

export type CoverMedia = {
  type?: 'image' | 'video'
  image?: SanityImage
  video?: {
    asset?: {
      playbackId?: string
      playbackPolicy?: 'public' | 'signed'
      aspectRatio?: string
    }
  }
}

export type CaseStudy = {
  _id: string
  _type: 'caseStudy'
  title: string
  summary?: string
  visibility?: 'public' | 'recruiter'
  slug: { current: string }
  publishedAt?: string
  cover?: CoverMedia
  /** @deprecated Legacy field; migrated into `cover`. Kept for fallback until the migration runs. */
  coverImage?: SanityImage
  headerMedia?: {
    type: 'image' | 'video'
    image?: SanityImage
    video?: {
      asset: {
        playbackId: string
        playbackPolicy?: 'public' | 'signed'
        aspectRatio?: string
      }
    }
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
