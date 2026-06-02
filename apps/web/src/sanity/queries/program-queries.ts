import { groq } from 'next-sanity'
import { IMAGE_PROJECTION, MUX_VIDEO_PROJECTION } from '../queries'
import type { SanityImage } from '../queries'

export const programTag = (slug: string) => `program:${slug}`
export const programsTag = 'programs'

const HERO_EXAMPLE_PROJECTION = groq`{
  study->{
    _id,
    title,
    slug,
    headerMedia{
      type,
      image${IMAGE_PROJECTION},
      video{asset->{playbackId}}
    },
    coverImage${IMAGE_PROJECTION}
  }
}`

export const PROGRAM_BY_SLUG = groq`
  *[_type == "program" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    slug,
    tagline,
    summary,
    homeListDescription,
    heroExamples[]${HERO_EXAMPLE_PROJECTION},
    thesis,
    approachIntro,
    moves[]{
      _key,
      title,
      body,
      media{
        type,
        image${IMAGE_PROJECTION},
        video${MUX_VIDEO_PROJECTION}
      }
    },
    proofIntro,
    proofs[]{
      _key,
      markerType,
      marker,
      title,
      body,
      caseStudy->{
        title,
        slug
      }
    },
    seoSettings
  }
`

export const PUBLISHED_PROGRAMS = groq`
  *[_type == "program" && defined(slug.current)] | order(coalesce(featuredOrder, 9999) asc, title asc){
    _id,
    title,
    slug,
    tagline,
    summary,
    homeListDescription,
    featuredOrder
  }
`

export type ProgramHeroExample = {
  study?: {
    _id: string
    title: string
    slug: { current: string }
    headerMedia?: {
      type: 'image' | 'video'
      image?: SanityImage
      video?: { asset: { playbackId: string } }
    }
    coverImage?: SanityImage
  } | null
}

export type ProgramMove = {
  _key: string
  title: string
  body: string
  media?: {
    type: 'image' | 'video'
    image?: SanityImage
    video?: { asset: { playbackId: string; aspectRatio?: string } }
  }
}

export type ProgramProof = {
  _key: string
  markerType?: 'metric' | 'direction' | 'outcome'
  marker: string
  title: string
  body: string
  caseStudy?: {
    title: string
    slug?: { current: string }
  } | null
}

export type Program = {
  _id: string
  _type: 'program'
  title: string
  slug: { current: string }
  tagline?: string
  summary: string
  homeListDescription: string
  featuredOrder?: number
  heroExamples?: ProgramHeroExample[]
  thesis?: string
  approachIntro?: string
  moves?: ProgramMove[]
  proofIntro?: string
  proofs?: ProgramProof[]
  seoSettings?: {
    metaTitle?: string
    metaDescription?: string
  }
}
