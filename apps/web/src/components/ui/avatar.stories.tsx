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
      <AvatarImage src="/default-avatars/avatar-1.png" displaySize={32} alt="Default avatar" />
      <AvatarFallback>MK</AvatarFallback>
    </Avatar>
  ),
}

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="/broken-image.png" displaySize={32} alt="Broken avatar" />
      <AvatarFallback>MK</AvatarFallback>
    </Avatar>
  ),
}

export const RectangularImage: Story = {
  render: () => (
    <Avatar className="size-24">
      <AvatarImage
        src={`data:image/svg+xml,${encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="120"><rect width="240" height="120" fill="#bae6fd"/><circle cx="120" cy="60" r="44" fill="#0369a1"/><circle cx="105" cy="50" r="5" fill="white"/><circle cx="135" cy="50" r="5" fill="white"/></svg>',
        )}`}
        displaySize={96}
        alt="Rectangular image cropped into an avatar"
      />
      <AvatarFallback>RC</AvatarFallback>
    </Avatar>
  ),
}

export const DefaultAvatars: Story = {
  render: () => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <Avatar key={n}>
          <AvatarImage
            src={`/default-avatars/avatar-${n}.png`}
            displaySize={32}
            alt={`Default avatar ${n}`}
          />
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
        <AvatarImage src="/default-avatars/avatar-2.png" displaySize={24} alt="Small avatar" />
        <AvatarFallback>S</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="/default-avatars/avatar-2.png" displaySize={32} alt="Default avatar" />
        <AvatarFallback>M</AvatarFallback>
      </Avatar>
      <Avatar className="h-14 w-14">
        <AvatarImage src="/default-avatars/avatar-2.png" displaySize={56} alt="Large avatar" />
        <AvatarFallback>L</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const ProfileInterfaceSizes: Story = {
  render: () => (
    <div className="flex items-end gap-6">
      {[
        { label: 'Header · 32px', size: 32 },
        { label: 'Menu · 36px', size: 36 },
        { label: 'Editor · 112px', size: 112 },
      ].map(({ label, size }) => (
        <div key={label} className="flex flex-col items-center gap-2">
          <Avatar style={{ height: size, width: size }}>
            <AvatarImage
              src="/default-avatars/avatar-2.png"
              displaySize={size}
              alt={`${label} avatar`}
            />
            <AvatarFallback>MI</AvatarFallback>
          </Avatar>
          <span className="text-muted-foreground text-xs">{label}</span>
        </div>
      ))}
    </div>
  ),
}
