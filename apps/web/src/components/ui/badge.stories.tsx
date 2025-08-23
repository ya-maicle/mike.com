import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge } from './badge'
import { Icon } from './icon'
import * as Icons from './icons'

const meta: Meta<typeof Badge> = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
  },
}

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
}

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const WithIcon: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge>
        <Icon icon={Icons.CheckCircle} size="sm" className="mr-1" />
        Completed
      </Badge>
      <Badge variant="secondary">
        <Icon icon={Icons.Clock} size="sm" className="mr-1" />
        Pending
      </Badge>
      <Badge variant="destructive">
        <Icon icon={Icons.XCircle} size="sm" className="mr-1" />
        Failed
      </Badge>
    </div>
  ),
}

export const StatusBadges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
        <Icon icon={Icons.Check} size="sm" className="mr-1" />
        Active
      </Badge>
      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
        <Icon icon={Icons.AlertTriangle} size="sm" className="mr-1" />
        Warning
      </Badge>
      <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
        <Icon icon={Icons.Info} size="sm" className="mr-1" />
        Info
      </Badge>
      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
        <Icon icon={Icons.Star} size="sm" className="mr-1" />
        Featured
      </Badge>
    </div>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
}

export const NumberBadges: Story = {
  render: () => (
    <div className="flex gap-4">
      <div className="relative">
        <Icon icon={Icons.Bell} size="lg" />
        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
          3
        </Badge>
      </div>
      <div className="relative">
        <Icon icon={Icons.Mail} size="lg" />
        <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
          12
        </Badge>
      </div>
      <div className="relative">
        <Icon icon={Icons.MessageCircle} size="lg" />
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          99+
        </Badge>
      </div>
    </div>
  ),
}
