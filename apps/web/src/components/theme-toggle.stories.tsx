import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ThemeToggle } from './theme-toggle'

const meta: Meta<typeof ThemeToggle> = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const InHeader: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <h1 className="text-xl font-semibold">My Application</h1>
        <ThemeToggle />
      </header>
      <div className="p-6">
        <p className="text-muted-foreground">
          Click the theme toggle button to switch between light, dark, and system themes. The button
          shows a sun icon in light mode and a moon icon in dark mode.
        </p>
      </div>
    </div>
  ),
}

export const InNavbar: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <nav className="flex items-center justify-between px-6 py-3 bg-background border-b">
        <div className="flex items-center space-x-6">
          <div className="font-bold">Logo</div>
          <div className="flex space-x-4">
            <a href="#" className="text-sm font-medium hover:text-primary">
              Home
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              About
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary">
              Contact
            </a>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button className="text-sm font-medium">Sign In</button>
        </div>
      </nav>
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Welcome to our site</h2>
        <p className="text-muted-foreground">
          This is an example of how the theme toggle can be integrated into a navigation bar. Try
          switching between light and dark themes using the toggle button.
        </p>
      </div>
    </div>
  ),
}

export const Standalone: Story = {
  render: () => (
    <div className="space-y-4 text-center">
      <h3 className="text-lg font-semibold">Theme Toggle</h3>
      <ThemeToggle />
      <p className="text-sm text-muted-foreground max-w-md">
        This theme toggle allows users to switch between light mode, dark mode, and system
        preference. The icon animates when switching themes.
      </p>
    </div>
  ),
}
