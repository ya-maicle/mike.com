import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { BlogArchive } from './blog-archive'
import type { BlogPostSummary } from '@/sanity/queries/blog-post-queries'

const titles = [
  'Designing products for a world of AI agents',
  'The case for curiosity in design leadership',
  'What senior designers should learn next',
  'Making strategy visible to the whole team',
  'A practical field guide to product critique',
  'Why the interface is no longer the whole product',
  'Leading through ambiguity without creating noise',
  'How to build trust into an AI experience',
  'The career value of writing about your work',
  'Design systems after the age of static screens',
  'A better way to present complex product decisions',
  'Notes on craft, taste, and shipping',
]

const coverImage: NonNullable<NonNullable<BlogPostSummary['cover']>['image']> = {
  _type: 'image',
  alt: 'Abstract blue and orange forms',
  asset: {
    _id: 'image-ff338b84dd63ac41db413a2db435c9068127f2f0-1200x630-jpg',
    url: 'https://cdn.sanity.io/images/nf3mt1vl/development/ff338b84dd63ac41db413a2db435c9068127f2f0-1200x630.jpg',
    metadata: { dimensions: { width: 1200, height: 630 } },
  },
}

const posts: BlogPostSummary[] = titles.map((title, index) => ({
  _id: `post-${index + 1}`,
  title,
  excerpt: 'A short summary for metadata and search previews.',
  slug: { current: `article-${index + 1}` },
  publishedAt: new Date(Date.UTC(2026, 7, 24 - index)).toISOString(),
  cover: { type: 'image', image: coverImage },
}))

const meta = {
  title: 'Layout/BlogArchive',
  component: BlogArchive,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <main className="-mx-8 px-6 pt-6 md:px-8 md:pt-16">
        <div className="mx-auto max-w-[var(--content-max-width)]">
          <header className="pt-12 pb-14 md:pb-16">
            <h1 className="m-0 text-[length:var(--text-5xl)] font-normal leading-[1.05] tracking-[-0.03em]">
              Blog
            </h1>
          </header>
          <Story />
        </div>
      </main>
    ),
  ],
} satisfies Meta<typeof BlogArchive>

export default meta
type Story = StoryObj<typeof meta>

export const ReferenceLayout: Story = { args: { posts } }

export const Empty: Story = { args: { posts: [] } }
