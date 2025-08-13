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
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  name: 'Primary',
  args: {
    variant: 'primary',
  },
}

export const Secondary: Story = {
  name: 'Secondary',
  args: {
    variant: 'secondary',
  },
}
