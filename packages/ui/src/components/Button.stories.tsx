import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Primitives/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: 'Button',
  },
  parameters: {
    a11y: { disable: false },
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'success', 'warning', 'info', 'outline', 'ghost'],
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg', 'icon'],
    },
    loading: {
      control: { type: 'boolean' },
    },
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Default: Story = {
  name: 'Default',
  args: {
    variant: 'default',
  },
}

export const Secondary: Story = {
  name: 'Secondary',
  args: {
    variant: 'secondary',
  },
}

export const Outline: Story = {
  name: 'Outline',
  args: {
    variant: 'outline',
  },
}

export const Ghost: Story = {
  name: 'Ghost',
  args: {
    variant: 'ghost',
  },
}

export const Destructive: Story = {
  name: 'Destructive',
  args: {
    variant: 'destructive',
  },
}

export const Success: Story = {
  name: 'Success',
  args: {
    variant: 'success',
  },
}

export const Warning: Story = {
  name: 'Warning',
  args: {
    variant: 'warning',
  },
}

export const Info: Story = {
  name: 'Info',
  args: {
    variant: 'info',
  },
}

export const Small: Story = {
  name: 'Small',
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  name: 'Large',
  args: {
    size: 'lg',
  },
}

export const Icon: Story = {
  name: 'Icon',
  args: {
    size: 'icon',
    children: '✓',
  },
}

export const Loading: Story = {
  name: 'Loading',
  args: {
    loading: true,
  },
}

export const WithIcons: Story = {
  name: 'With Icons',
  args: {
    leftIcon: '←',
    rightIcon: '→',
    children: 'Button with icons',
  },
}

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
}

export const AllSizes: Story = {
  name: 'All Sizes',
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">✓</Button>
    </div>
  ),
}
