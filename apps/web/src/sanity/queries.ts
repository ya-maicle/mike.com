/* eslint-disable */
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
  asset: { _ref?: string; _id?: string; url?: string }
  alt?: string
  caption?: string
}

export type CaseStudy = {
  _id: string
  title: string
  summary?: string
  publishedAt?: string
  seoSettings?: { metaTitle?: string; metaDescription?: string }
  slug: { current: string }
  coverImage?: SanityImage
  projectInfo?: {
    client?: string
    sector?: string
    discipline?: string
    year?: string
    link?: string
  }
  content?: any[]
}
