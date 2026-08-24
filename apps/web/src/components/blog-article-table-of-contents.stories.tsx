import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { BlogArticleTableOfContents } from './blog-article-table-of-contents'

const headings = [
  { id: 'setting-the-boundary', text: 'Setting the boundary' },
  { id: 'designing-for-judgment', text: 'Designing for judgment' },
  { id: 'what-changes-next', text: 'What changes next' },
]

const meta = {
  title: 'Blog/ArticleTableOfContents',
  component: BlogArticleTableOfContents,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="@container grid min-h-[1400px] grid-cols-12 px-6 py-12">
        <Story />
        <div className="col-span-12 space-y-16 @6xl:col-span-6 @6xl:col-start-4">
          {headings.map((heading) => (
            <section key={heading.id} className="min-h-[420px]">
              <h2 id={heading.id} className="scroll-mt-28">
                {heading.text}
              </h2>
              <p className="text-xl leading-7">
                Example article copy for checking sticky navigation and active-section behavior.
              </p>
            </section>
          ))}
        </div>
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof BlogArticleTableOfContents>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = { args: { headings } }
