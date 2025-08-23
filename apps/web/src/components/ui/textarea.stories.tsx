import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import * as React from 'react'
import { Textarea } from './textarea'
import { Label } from './label'
import { Button } from './button'

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    rows: { control: { type: 'number', min: 1, max: 20, step: 1 } },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message">Your message</Label>
      <Textarea placeholder="Type your message here." id="message" />
    </div>
  ),
}

export const WithLabelAndDescription: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="message-2">Your message</Label>
      <Textarea placeholder="Type your message here." id="message-2" />
      <p className="text-sm text-muted-foreground">
        Your message will be copied to the support team.
      </p>
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Disabled textarea',
  },
}

export const WithButton: Story = {
  render: () => (
    <div className="grid w-full gap-2">
      <Textarea placeholder="Type your message here." />
      <Button>Send message</Button>
    </div>
  ),
}

export const ContactForm: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <input
          id="name"
          placeholder="Your name"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <input
          type="email"
          id="email"
          placeholder="your@email.com"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Tell us how we can help you..." rows={4} />
      </div>
      <Button className="w-full">Send Message</Button>
    </div>
  ),
}

export const CodeEditor: Story = {
  render: () => (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="code">JavaScript Code</Label>
      <Textarea
        id="code"
        placeholder="function hello() {&#10;  console.log('Hello, World!');&#10;}"
        className="font-mono text-sm"
        rows={8}
      />
    </div>
  ),
}

export const CharacterLimit: Story = {
  render: () => {
    const maxLength = 280
    const [value, setValue] = React.useState('')

    return (
      <div className="grid w-full gap-1.5">
        <Label htmlFor="tweet">What&apos;s happening?</Label>
        <Textarea
          id="tweet"
          placeholder="Share your thoughts..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={maxLength}
        />
        <p className="text-sm text-muted-foreground text-right">
          {value.length}/{maxLength}
        </p>
      </div>
    )
  },
}
