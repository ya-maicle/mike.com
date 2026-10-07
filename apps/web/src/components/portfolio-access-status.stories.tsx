import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PortfolioAccessStatus } from './portfolio-access-status'

const meta = {
  title: 'Portfolio/Access status',
  component: PortfolioAccessStatus,
  parameters: { layout: 'padded' },
  args: { state: { status: 'pending', email: 'visitor@example.com', studies: [] } },
} satisfies Meta<typeof PortfolioAccessStatus>
export default meta
type Story = StoryObj<typeof meta>
export const Pending: Story = {}
export const Approved: Story = {
  args: {
    state: {
      status: 'approved',
      email: 'visitor@example.com',
      studies: [{ title: 'Example private case study', slug: 'example' }],
    },
  },
}
export const Declined: Story = {
  args: { state: { status: 'declined', email: 'visitor@example.com', studies: [] } },
}
export const Blocked: Story = {
  args: { state: { status: 'blocked', email: 'visitor@example.com', studies: [] } },
}
export const Expired: Story = {
  args: { state: { status: 'expired', email: 'visitor@example.com', studies: [] } },
}
export const Revoked: Story = {
  args: { state: { status: 'revoked', email: 'visitor@example.com', studies: [] } },
}
