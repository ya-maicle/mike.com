import type { PortableTextBlock } from '@portabletext/types'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'

import { LegalPageContent } from '@/components/legal-page-content'
import { BlogPostAnalytics } from '@/components/blog-post-analytics'
import { BlogArticleActions } from '@/components/blog-article-actions'
import { PageTemplate } from '@/components/page-template'
import { BlogPostStructuredData } from '@/components/site-structured-data'
import { formatBlogDate } from '@/lib/blog'
import { SITE_CONFIG } from '@/lib/constants'
import { coverToHeroMedia } from '@/lib/cover-media'
import { createPageMetadata, firstMetadataText } from '@/lib/seo'
import { socialImageFromSanity } from '@/lib/sanity-social-image'
import { sanityFetch } from '@/sanity/client'
import {
  BLOG_POST_BY_SLUG,
  blogPostTag,
  blogPostsTag,
  PUBLISHED_BLOG_POSTS,
  type BlogPost,
  type BlogPostSummary,
} from '@/sanity/queries/blog-post-queries'

type BlogPostPageProps = { params: Promise<{ slug: string }> }

const getBlogPost = cache((slug: string) =>
  sanityFetch<BlogPost | null>(BLOG_POST_BY_SLUG, { slug }, { tag: blogPostTag(slug) }),
)

export async function generateStaticParams() {
  const posts = await sanityFetch<BlogPostSummary[]>(
    PUBLISHED_BLOG_POSTS,
    {},
    {
      tag: blogPostsTag,
    },
  )

  return posts.map(({ slug }) => ({ slug: slug.current }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) return { title: 'Article not found', robots: { index: false, follow: false } }

  const title = firstMetadataText(post.seoSettings?.metaTitle, post.title) ?? SITE_CONFIG.name
  const description =
    firstMetadataText(post.seoSettings?.metaDescription, post.excerpt) ?? SITE_CONFIG.description
  const coverImage = post.cover?.type === 'image' ? post.cover.image : post.coverImage
  const shareImage = post.seoSettings?.shareImage ?? coverImage

  return createPageMetadata({
    title,
    description,
    path: `/blog/${slug}`,
    type: 'article',
    publishedTime: post.publishedAt,
    image: socialImageFromSanity(shareImage, post.title),
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = await getBlogPost(slug)

  if (!post) notFound()

  const coverImage = post.cover?.type === 'image' ? post.cover.image : post.coverImage
  const socialImage = socialImageFromSanity(post.seoSettings?.shareImage ?? coverImage, post.title)
  const narrationAsset = post.narration?.audioFile?.asset
  const narrationDuration = post.narration?.durationSeconds
  const hasNarration =
    narrationAsset?.url &&
    narrationAsset.mimeType === 'audio/mpeg' &&
    typeof narrationDuration === 'number' &&
    narrationDuration > 0

  return (
    <>
      <BlogPostAnalytics postSlug={post.slug.current} />
      <BlogPostStructuredData
        title={post.title}
        description={post.excerpt}
        path={`/blog/${slug}`}
        publishedAt={post.publishedAt}
        imageUrl={socialImage?.url}
        audio={
          hasNarration ? { url: narrationAsset.url, durationSeconds: narrationDuration } : undefined
        }
      />
      <PageTemplate
        title={post.title}
        subtitle={post.excerpt}
        metadata={formatBlogDate(post.publishedAt)}
        coverMedia={coverToHeroMedia(post.cover, post.coverImage)}
        frameCoverMedia
        headerActions={
          hasNarration ? (
            <BlogArticleActions
              postSlug={post.slug.current}
              audioUrl={narrationAsset.url}
              durationSeconds={narrationDuration}
            />
          ) : undefined
        }
      >
        <LegalPageContent content={post.content as PortableTextBlock[]} />
      </PageTemplate>
    </>
  )
}
