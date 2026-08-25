import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { BlogArticleActions } from './blog-article-actions'

const meta = {
  title: 'Blog/ArticleActions',
  component: BlogArticleActions,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="mx-auto w-[calc(100%-32px)] max-w-[596px] py-8">
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof BlogArticleActions>

export default meta
type Story = StoryObj<typeof meta>

export const Ready: Story = {
  args: {
    postSlug: 'designing-for-ai-agents',
    shareText: 'A practical field note about designing with AI agents.',
    audioUrl: '/sample-narration.mp3',
    durationSeconds: 1_082,
  },
}

export const WithoutNarration: Story = {
  args: {
    postSlug: 'designing-for-ai-agents',
    shareText: 'A practical field note about designing with AI agents.',
  },
}
