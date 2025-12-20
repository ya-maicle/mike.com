import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { PageTemplate } from './page-template'

const meta: Meta<typeof PageTemplate> = {
  title: 'Layout/PageTemplate',
  component: PageTemplate,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    headerAlign: {
      control: 'select',
      options: ['center', 'left'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Page Title',
    metadata: 'Updated: December 18, 2025',
    subtitle: 'A brief description of this page and its purpose.',
    children: (
      <div className="space-y-4">
        <p>
          This is the page content area. It can contain any React components, including PortableText
          content, forms, or custom layouts.
        </p>
        <p>
          The PageTemplate component provides a consistent structure for all pages, with
          customizable header alignment and content width.
        </p>
      </div>
    ),
  },
}

export const NarrowCentered: Story = {
  args: {
    title: 'Privacy Policy',
    metadata: 'Updated: December 18, 2025',
    headerAlign: 'center',
    children: (
      <div className="space-y-4">
        <h2>Introduction</h2>
        <p>
          This Privacy Policy describes how we collect, use, and protect your personal information
          when you use our services.
        </p>
        <h2>Information We Collect</h2>
        <p>
          We collect information you provide directly to us, such as when you create an account,
          make a purchase, or contact us for support.
        </p>
      </div>
    ),
  },
}

export const WideLeftAligned: Story = {
  args: {
    title: 'Our Work',
    subtitle: 'Explore our portfolio of projects and case studies.',
    headerAlign: 'left',
    children: (
      <div className="grid grid-cols-2 gap-8">
        <div className="aspect-video bg-muted rounded-lg" />
        <div className="aspect-video bg-muted rounded-lg" />
        <div className="aspect-video bg-muted rounded-lg" />
        <div className="aspect-video bg-muted rounded-lg" />
      </div>
    ),
  },
}

export const MinimalHeader: Story = {
  args: {
    title: 'Contact Us',
    headerAlign: 'center',
    children: (
      <div className="space-y-4 text-center">
        <p>Get in touch with our team.</p>
        <p className="text-muted-foreground">hello@example.com</p>
      </div>
    ),
  },
}
