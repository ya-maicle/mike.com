import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Logotype, LogoMark } from './logotype'

const meta: Meta<typeof Logotype> = {
  title: 'UI/Logotype',
  component: Logotype,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'muted', 'destructive', 'outline'],
    },
    showText: {
      control: { type: 'boolean' },
    },
    text: {
      control: { type: 'text' },
    },
    as: {
      control: { type: 'select' },
      options: ['div', 'a', 'button'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    showText: true,
    text: 'Maicle',
  },
}

export const LogoOnly: Story = {
  args: {
    showText: false,
  },
}

export const Sizes: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">With Text</h3>
        <div className="flex flex-col items-start gap-6">
          <Logotype size="xs" text="Extra Small" />
          <Logotype size="sm" text="Small" />
          <Logotype size="md" text="Medium" />
          <Logotype size="lg" text="Large" />
          <Logotype size="xl" text="Extra Large" />
          <Logotype size="2xl" text="2X Large" />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Logo Only</h3>
        <div className="flex flex-col items-start gap-6">
          <Logotype size="xs" showText={false} />
          <Logotype size="sm" showText={false} />
          <Logotype size="md" showText={false} />
          <Logotype size="lg" showText={false} />
          <Logotype size="xl" showText={false} />
          <Logotype size="2xl" showText={false} />
        </div>
      </div>
    </div>
  ),
}

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">With Text</h3>
        <div className="flex flex-col gap-4">
          <Logotype variant="default" text="Default" />
          <Logotype variant="muted" text="Muted" />
          <Logotype variant="destructive" text="Destructive" />
          <Logotype variant="outline" text="Outline" />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Logo Only</h3>
        <div className="flex flex-col gap-4">
          <Logotype variant="default" showText={false} />
          <Logotype variant="muted" showText={false} />
          <Logotype variant="destructive" showText={false} />
          <Logotype variant="outline" showText={false} />
        </div>
      </div>
    </div>
  ),
}

export const AsLink: Story = {
  args: {
    as: 'a',
    href: '#',
    showText: true,
    text: 'Maicle',
    size: 'lg',
  },
  render: (args) => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Click the logo below (it&apos;s a link)</p>
      <Logotype {...args} />
    </div>
  ),
}

export const AsButton: Story = {
  args: {
    as: 'button',
    showText: true,
    text: 'Maicle',
    size: 'lg',
  },
  render: (args) => (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Click the logo below (it&apos;s a button)</p>
      <Logotype {...args} onClick={() => alert('Logo clicked!')} />
    </div>
  ),
}

export const CustomText: Story = {
  render: () => (
    <div className="space-y-4">
      <Logotype size="lg" text="My Company" />
      <Logotype size="lg" text="Brand Name" />
      <Logotype size="lg" text="StartupCo" />
      <Logotype size="lg" text="Design Studio" />
    </div>
  ),
}

export const Navigation: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <nav className="flex items-center justify-between p-6 border-b">
        <Logotype as="a" href="#" size="lg" text="Maicle" />
        <div className="flex items-center gap-6">
          <a href="#" className="text-sm font-medium hover:text-primary">
            Products
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary">
            About
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary">
            Contact
          </a>
        </div>
      </nav>
    </div>
  ),
}

export const Footer: Story = {
  render: () => (
    <div className="w-full max-w-4xl">
      <footer className="border-t p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Logotype size="md" text="Maicle" />
            <p className="text-sm text-muted-foreground max-w-md">
              Building the future of design systems with beautiful, accessible components.
            </p>
          </div>
          <div className="flex gap-6">
            <a href="#" className="text-sm hover:text-primary">
              Privacy
            </a>
            <a href="#" className="text-sm hover:text-primary">
              Terms
            </a>
            <a href="#" className="text-sm hover:text-primary">
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  ),
}

export const LoginPage: Story = {
  render: () => (
    <div className="w-full max-w-sm mx-auto space-y-6">
      <div className="text-center">
        <Logotype size="xl" text="Maicle" className="justify-center mb-2" />
        <p className="text-sm text-muted-foreground">Sign in to your account</p>
      </div>
      <div className="space-y-4 p-6 border rounded-lg">
        <div className="space-y-2">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>
        <button className="w-full bg-primary text-primary-foreground py-2 rounded-md">
          Sign In
        </button>
      </div>
    </div>
  ),
}

export const ThemeShowcase: Story = {
  render: () => (
    <div className="space-y-8 p-6">
      <h2 className="text-2xl font-bold">Theme Adaptation</h2>
      <p className="text-muted-foreground">
        The logo automatically adapts to light and dark themes using `fill=&quot;currentColor&quot;`.
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 bg-background border rounded-lg">
          <h3 className="font-semibold mb-4">Light Theme Simulation</h3>
          <div className="space-y-4">
            <Logotype size="lg" text="Maicle" className="text-foreground" />
            <Logotype size="md" showText={false} className="text-muted-foreground" />
          </div>
        </div>
        
        <div className="p-6 rounded-lg dark bg-background text-foreground">
          <h3 className="font-semibold mb-4">Dark Theme Simulation</h3>
          <div className="space-y-4">
            <Logotype size="lg" text="Maicle" className="text-foreground" />
            <Logotype size="md" showText={false} className="text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  ),
}

export const StandaloneLogoMark: Story = {
  render: () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Standalone LogoMark Component</h3>
      <p className="text-sm text-muted-foreground">
        You can also use just the LogoMark component without text.
      </p>
      <div className="flex items-center gap-6">
        <LogoMark size="xs" />
        <LogoMark size="sm" />
        <LogoMark size="md" />
        <LogoMark size="lg" />
        <LogoMark size="xl" />
        <LogoMark size="2xl" />
      </div>
    </div>
  ),
}
