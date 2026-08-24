import { BlogPostCard } from '@/components/blog-post-card'
import type { BlogPostSummary } from '@/sanity/queries/blog-post-queries'

export function BlogArchive({ posts }: { posts: BlogPostSummary[] }) {
  if (posts.length === 0) {
    return (
      <div className="border-t border-border py-12 md:py-16">
        <p className="m-0 max-w-xl text-xl leading-7 text-muted-foreground">
          The first article is in the works. Check back soon.
        </p>
      </div>
    )
  }

  const [featured, ...rest] = posts
  const rail = rest.slice(0, 3)
  const archive = rest.slice(3)

  return (
    <div className="pb-16 md:pb-24">
      <section aria-label="Featured articles" className="lg:grid lg:grid-cols-4 lg:gap-6">
        <div className="lg:sticky lg:top-16 lg:col-span-3 lg:self-start">
          <BlogPostCard
            post={featured}
            variant="featured"
            priority
            placement="featured"
            position={1}
          />
        </div>

        {rail.length > 0 ? (
          <div className="hidden gap-x-6 gap-y-16 lg:grid lg:grid-cols-1 lg:pb-16">
            {rail.map((post, index) => (
              <BlogPostCard key={post._id} post={post} placement="rail" position={index + 2} />
            ))}
          </div>
        ) : null}
      </section>

      {rest.length > 0 ? (
        <section
          aria-label="All articles"
          className="mt-20 grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 md:grid-cols-4 lg:hidden"
        >
          {rest.map((post, index) => (
            <BlogPostCard key={post._id} post={post} placement="archive" position={index + 2} />
          ))}
        </section>
      ) : null}

      {archive.length > 0 ? (
        <section
          aria-label="All articles"
          className="mt-20 hidden grid-cols-4 gap-x-6 gap-y-20 lg:grid"
        >
          {archive.map((post, index) => (
            <BlogPostCard key={post._id} post={post} placement="archive" position={index + 5} />
          ))}
        </section>
      ) : null}
    </div>
  )
}
