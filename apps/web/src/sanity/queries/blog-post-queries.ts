import type { PortableTextBlock } from '@portabletext/types'
import { groq } from 'next-sanity'

import type { CarouselBlock, CoverMedia, ImageBlock, SanityImage, VideoBlock } from '../queries'
import { COVER_PROJECTION, IMAGE_PROJECTION, MUX_VIDEO_PROJECTION } from '../queries'

export const blogPostTag = (slug: string) => `blogPost:${slug}`
export const blogPostsTag = 'blogPosts'

const BLOG_POST_BLOCKS_PROJECTION = groq`{
  ...,
  _type == 'imageBlock' => { ..., image${IMAGE_PROJECTION} },
  _type == 'videoBlock' => { ..., video${MUX_VIDEO_PROJECTION} },
  _type == 'carouselBlock' => {
    ...,
    items[]{ kind, image${IMAGE_PROJECTION}, video${MUX_VIDEO_PROJECTION} }
  }
}`

export const PUBLISHED_BLOG_POSTS = groq`
  *[
    _type == "blogPost" &&
    defined(slug.current) &&
    defined(publishedAt) &&
    publishedAt <= now()
  ] | order(publishedAt desc){
    _id,
    title,
    excerpt,
    slug,
    publishedAt,
    cover${COVER_PROJECTION},
    coverImage${IMAGE_PROJECTION}
  }
`

export const BLOG_POST_BY_SLUG = groq`
  *[
    _type == "blogPost" &&
    slug.current == $slug &&
    defined(publishedAt) &&
    publishedAt <= now()
  ][0]{
    _id,
    title,
    excerpt,
    slug,
    publishedAt,
    cover${COVER_PROJECTION},
    coverImage${IMAGE_PROJECTION},
    content[]${BLOG_POST_BLOCKS_PROJECTION},
    narration{
      durationSeconds,
      provider,
      model,
      voiceId,
      voiceName,
      generatedAt,
      sourceHash,
      audioFile{
        asset->{ _id, url, mimeType, size, originalFilename }
      }
    },
    seoSettings{
      metaTitle,
      metaDescription,
      shareImage${IMAGE_PROJECTION}
    }
  }
`

export type BlogPostSummary = {
  _id: string
  title: string
  excerpt: string
  slug: { current: string }
  publishedAt: string
  cover?: CoverMedia
  /** @deprecated Legacy field retained as a safe fallback during the cover-media migration. */
  coverImage?: SanityImage
}

export type BlogPost = BlogPostSummary & {
  content: (PortableTextBlock | ImageBlock | VideoBlock | CarouselBlock)[]
  narration?: {
    durationSeconds?: number
    provider?: string
    model?: string
    voiceId?: string
    voiceName?: string
    generatedAt?: string
    sourceHash?: string
    audioFile?: {
      asset?: {
        _id: string
        url: string
        mimeType?: string
        size?: number
        originalFilename?: string
      }
    }
  }
  seoSettings?: {
    metaTitle?: string
    metaDescription?: string
    shareImage?: SanityImage
  }
}
