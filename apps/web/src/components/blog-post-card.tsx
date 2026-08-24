import Link from 'next/link'

import { CoverMediaFill } from '@/components/cover-media-fill'
import { formatBlogDate } from '@/lib/blog'
import { resolveCover } from '@/lib/cover-media'
import { cn } from '@/lib/utils'
import type { BlogCardPlacement } from '@/lib/analytics/events'
import type { BlogPostSummary } from '@/sanity/queries/blog-post-queries'

type BlogPostCardProps = {
  post: BlogPostSummary
  variant?: 'featured' | 'standard'
  priority?: boolean
  placement: BlogCardPlacement
  position: number
}

export function BlogPostCard({
  post,
  variant = 'standard',
  priority = false,
  placement,
  position,
}: BlogPostCardProps) {
  const isFeatured = variant === 'featured'
  const cover = resolveCover(post.cover, post.coverImage)

  return (
    <article>
      <Link
        href={`/blog/${post.slug.current}`}
        className="group block"
        data-analytics-blog-post-slug={post.slug.current}
        data-analytics-blog-card-placement={placement}
        data-analytics-blog-card-position={position}
      >
        <div
          className={cn(
            'relative overflow-hidden rounded-lg bg-muted',
            isFeatured ? 'aspect-[4/5] md:aspect-video' : 'aspect-square',
          )}
        >
          <CoverMediaFill
            cover={cover}
            imageAspectRatio={isFeatured ? '16/9' : '1/1'}
            sizes={
              isFeatured
                ? '(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) calc(100vw - 64px), 75vw'
                : '(max-width: 767px) calc(100vw - 48px), (max-width: 1023px) 25vw, 326px'
            }
            priority={priority}
          />
          <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-border" />
        </div>

        <div className="pt-4">
          <h2
            className={cn(
              'm-0 text-foreground',
              isFeatured
                ? 'text-display lg:pe-20'
                : 'text-[length:var(--text-2xl)] font-medium leading-[1.32] tracking-[-0.01em]',
            )}
          >
            {post.title}
          </h2>
          <p className="mt-4 mb-0 text-base font-medium leading-5 text-muted-foreground">
            {formatBlogDate(post.publishedAt)}
          </p>
        </div>
      </Link>
    </article>
  )
}
