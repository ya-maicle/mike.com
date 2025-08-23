import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Label } from './label'
import { Input } from './input'

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Your email address',
  },
}

export const WithInput: Story = {
  render: () => (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="m@example.com" />
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="flex flex-col space-y-2">
      <Label htmlFor="email-required">
        Email <span className="text-destructive">*</span>
      </Label>
      <Input type="email" id="email-required" placeholder="m@example.com" required />
    </div>
  ),
}

export const WithCheckbox: Story = {
  render: () => (
    <div className="items-top flex space-x-2">
      <div className="grid gap-1.5 leading-none">
        <Label
          htmlFor="terms1"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Accept terms and conditions
        </Label>
        <p className="text-sm text-muted-foreground">
          You agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  ),
}

export const FormLabels: Story = {
  render: () => (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2">
        <Label htmlFor="first-name">First Name</Label>
        <Input id="first-name" placeholder="John" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="last-name">Last Name</Label>
        <Input id="last-name" placeholder="Doe" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="company">
          Company <span className="text-muted-foreground">(optional)</span>
        </Label>
        <Input id="company" placeholder="Acme Inc." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <textarea
          id="bio"
          placeholder="Tell us about yourself..."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
    </div>
  ),
}
