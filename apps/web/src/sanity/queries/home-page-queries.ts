import { groq } from 'next-sanity'
import { IMAGE_PROJECTION, type SanityImage } from '../queries'

export const homePageTag = 'homePage'

export const HOME_PAGE_QUERY = groq`
  *[_type == "homePage"][0]{
    _id,
    tagline,
    subtitle,
    heroButtons{
      primaryButton,
      secondaryButton
    },
    coverMedia{
      type,
      image${IMAGE_PROJECTION},
      video{asset->{playbackId}}
    },
    programsSection{
      label,
      heading,
      button,
      programs[]->{
        _id,
        title,
        "description": homeListDescription,
        "slug": slug.current
      },
      footerLink
    },
    featuredWorkSection{
      label,
      heading,
      button,
      projects[]->{
        _id,
        title,
        slug,
        summary,
        "visibility": coalesce(visibility, "public"),
        coverImage${IMAGE_PROJECTION},
        projectInfo{
          sector,
          year
        },
        publishedAt
      }
    },
    seoSettings
  }
`

export type HomePage = {
  _id: string
  tagline: string
  subtitle?: string
  heroButtons?: {
    primaryButton?: { text?: string; link?: string }
    secondaryButton?: { text?: string; link?: string }
  }
  coverMedia?: {
    type: 'image' | 'video'
    image?: SanityImage
    video?: { asset: { playbackId: string } }
  }
  programsSection?: {
    label?: string
    heading?: string
    button?: { text?: string; link?: string }
    programs?: Array<{
      _id: string
      title: string
      description: string
      slug: string | null
    }>
    footerLink?: { text?: string; link?: string }
  }
  featuredWorkSection?: {
    label?: string
    heading?: string
    button?: { text?: string; link?: string }
    projects?: Array<{
      _id: string
      title: string
      slug: { current: string }
      summary: string
      visibility?: 'public' | 'recruiter'
      coverImage: SanityImage
      projectInfo?: {
        sector?: string[]
        year?: string
        link?: { text?: string; url?: string }
      }
      publishedAt: string
    }>
  }
  seoSettings?: {
    metaTitle?: string
    metaDescription?: string
  }
}
