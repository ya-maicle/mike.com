import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Avatar, AvatarImage, AvatarFallback } from './avatar'

const meta: Meta<typeof Avatar> = {
  title: 'UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/default-avatars/avatar-1.png" alt="Default avatar" />
      <AvatarFallback>MK</AvatarFallback>
    </Avatar>
  ),
}

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/broken-image.png" alt="Broken avatar" />
      <AvatarFallback>MK</AvatarFallback>
    </Avatar>
  ),
}

export const DefaultAvatars: Story = {
  render: () => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <Avatar key={n}>
          <AvatarImage src={`/default-avatars/avatar-${n}.png`} alt={`Default avatar ${n}`} />
          <AvatarFallback>{n}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar className="h-6 w-6">
        <AvatarImage src="/default-avatars/avatar-2.png" alt="Small avatar" />
        <AvatarFallback>S</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/default-avatars/avatar-2.png" alt="Default avatar" />
        <AvatarFallback>M</AvatarFallback>
      </Avatar>
      <Avatar className="h-14 w-14">
        <AvatarImage src="/default-avatars/avatar-2.png" alt="Large avatar" />
        <AvatarFallback>L</AvatarFallback>
      </Avatar>
    </div>
  ),
}
