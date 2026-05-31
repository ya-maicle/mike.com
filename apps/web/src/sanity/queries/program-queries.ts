import { groq } from 'next-sanity'
import { IMAGE_PROJECTION } from '../queries'
import type { SanityImage } from '../queries'

export const programTag = (slug: string) => `program:${slug}`
export const programsTag = 'programs'

const HERO_EXAMPLE_PROJECTION = groq`{
  _id,
  title,
  slug,
  headerMedia{
    type,
    image${IMAGE_PROJECTION},
    video{asset->{playbackId}}
  },
  coverImage${IMAGE_PROJECTION}
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
    heroExamples[]->${HERO_EXAMPLE_PROJECTION},
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
  _id: string
  title: string
  slug: { current: string }
  headerMedia?: {
    type: 'image' | 'video'
    image?: SanityImage
    video?: { asset: { playbackId: string } }
  }
  coverImage?: SanityImage
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
  seoSettings?: {
    metaTitle?: string
    metaDescription?: string
  }
}
