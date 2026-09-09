import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MediaFrame } from './media-frame'
import { Button } from './button'

const meta = {
  title: 'UI/Media Frame',
  component: MediaFrame,
  args: {
    bordered: true,
    className: 'aspect-video w-full max-w-xl',
    children: (
      <div className="absolute inset-0 bg-background">
        <Button className="absolute bottom-4 right-4" variant="secondary">
          Media control
        </Button>
      </div>
    ),
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MediaFrame>

export default meta
type Story = StoryObj<typeof meta>

export const Light: Story = {}
export const Dark: Story = {
  decorators: [
    (Story) => (
      <div className="dark bg-background p-4">
        <Story />
      </div>
    ),
  ],
}
export const InheritedFromCaseStudy: Story = {
  args: { bordered: false },
  decorators: [
    (Story) => (
      <div data-case-study-layout>
        <Story />
      </div>
    ),
  ],
}
export const OutsideCaseStudy: Story = { args: { bordered: false } }
