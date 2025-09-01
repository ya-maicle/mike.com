import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './button'
import { Icon } from './icon'
import * as Icons from './icons'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'success', 'warning', 'info', 'outline', 'ghost', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Button',
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

export const Success: Story = {
  args: {
    variant: 'success',
    children: 'Success',
  },
}

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Warning',
  },
}

export const Info: Story = {
  args: {
    variant: 'info',
    children: 'Info',
  },
}


export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
}

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
}

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
}

export const IconButton: Story = {
  args: {
    size: 'icon',
    children: <Icon icon={Icons.Plus} size="sm" />,
  },
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <Icon icon={Icons.Download} size="sm" className="mr-2" />
        Download
      </>
    ),
  },
}

export const WithRightIcon: Story = {
  args: {
    variant: 'outline',
    children: (
      <>
        Continue
        <Icon icon={Icons.ChevronRight} size="sm" className="ml-2" />
      </>
    ),
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
}

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Icon icon={Icons.Spinner} size="sm" className="mr-2 animate-spin" />
        Loading...
      </>
    ),
  },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="success">Success</Button>
      <Button variant="warning">Warning</Button>
      <Button variant="info">Info</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
}

export const AllSizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button>Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Icon icon={Icons.Heart} size="sm" />
      </Button>
    </div>
  ),
}

export const ActionButtons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Icon icon={Icons.Plus} size="sm" className="mr-2" />
        Create
      </Button>
      <Button variant="outline">
        <Icon icon={Icons.Edit} size="sm" className="mr-2" />
        Edit
      </Button>
      <Button variant="destructive">
        <Icon icon={Icons.Trash} size="sm" className="mr-2" />
        Delete
      </Button>
      <Button variant="secondary">
        <Icon icon={Icons.Copy} size="sm" className="mr-2" />
        Copy
      </Button>
      <Button variant="ghost">
        <Icon icon={Icons.Share} size="sm" className="mr-2" />
        Share
      </Button>
    </div>
  ),
}

export const IconOnlyButtons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button size="icon" variant="outline">
        <Icon icon={Icons.Search} size="sm" />
      </Button>
      <Button size="icon" variant="outline">
        <Icon icon={Icons.Settings} size="sm" />
      </Button>
      <Button size="icon" variant="outline">
        <Icon icon={Icons.Bell} size="sm" />
      </Button>
      <Button size="icon" variant="outline">
        <Icon icon={Icons.User} size="sm" />
      </Button>
      <Button size="icon" variant="ghost">
        <Icon icon={Icons.MoreVertical} size="sm" />
      </Button>
    </div>
  ),
}
