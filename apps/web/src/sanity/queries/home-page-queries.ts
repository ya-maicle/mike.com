import { groq } from 'next-sanity'

// Tag for ISR revalidation
export const homePageTag = 'homePage'

// Fetch home page singleton document
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
      image{..., asset->},
      video{asset->{playbackId}}
    },
    programsSection{
      label,
      heading,
      button,
      programs[]{
        title,
        description
      },
      footerLink
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
    image?: {
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
      hotspot?: { x: number; y: number; height: number; width: number }
      crop?: { top: number; bottom: number; left: number; right: number }
    }
    video?: { asset: { playbackId: string } }
  }
  programsSection?: {
    label?: string
    heading?: string
    button?: { text?: string; link?: string }
    programs?: Array<{
      title: string
      description: string
    }>
    footerLink?: { text?: string; link?: string }
  }
  seoSettings?: {
    metaTitle?: string
    metaDescription?: string
  }
}
