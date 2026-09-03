import type { Metadata } from 'next'
import { cache } from 'react'

import { BlogArchive } from '@/components/blog-archive'
import { createPageMetadata } from '@/lib/seo'
import { shouldIndexBlogArchive } from '@/lib/search-indexing'
import { sanityFetch } from '@/sanity/client'
import {
  blogPostsTag,
  PUBLISHED_BLOG_POSTS,
  type BlogPostSummary,
} from '@/sanity/queries/blog-post-queries'

const getPublishedBlogPosts = cache(() =>
  sanityFetch<BlogPostSummary[]>(
    PUBLISHED_BLOG_POSTS,
    {},
    {
      tag: blogPostsTag,
    },
  ),
)

export async function generateMetadata(): Promise<Metadata> {
  const posts = await getPublishedBlogPosts()

  return createPageMetadata({
    title: 'Blog',
    description:
      'Writing by Mike Iukhtenko about product design, design leadership, careers, and emerging ways of working with AI.',
    path: '/blog',
    noIndex: !shouldIndexBlogArchive(posts.length),
  })
}

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts()

  return (
    <div>
      <header className="pt-12 pb-14 md:pb-16">
        <h1 className="m-0 text-[length:var(--text-5xl)] font-normal leading-[1.05] tracking-[-0.03em]">
          Blog
        </h1>
      </header>
      <BlogArchive posts={posts} />
    </div>
  )
}
