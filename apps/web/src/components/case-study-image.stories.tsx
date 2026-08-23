import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CaseStudyImage } from '@/components/case-study-image'
import type { SanityImage } from '@/sanity/queries'

const desktopImage: SanityImage = {
  _type: 'image',
  alt: 'Care AI Studio workflow builder shown as a wide desktop composition.',
  asset: {
    _id: 'image-14c8293bdf5e73507cbdca13e4f0ed993ffa3064-3840x2160-png',
    metadata: { dimensions: { width: 3840, height: 2160, aspectRatio: 16 / 9 } },
  },
}

const mobileImage: SanityImage = {
  _type: 'image',
  alt: 'Care AI Studio workflow builder recomposed as a portrait mobile image.',
  asset: {
    _id: 'image-f927e7d348271009931968753cf5a6bfabafd019-1536x2048-png',
    metadata: { dimensions: { width: 1536, height: 2048, aspectRatio: 3 / 4 } },
  },
}

const meta = {
  title: 'Components/CaseStudyImage',
  component: CaseStudyImage,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[min(90vw,1000px)]">
        <Story />
      </div>
    ),
  ],
  args: {
    image: desktopImage,
    sizes: '(min-width: 1000px) 1000px, 90vw',
    aspectRatio: 'auto',
    className: 'h-auto w-full rounded-[8px]',
    caption: '[Production-derived] Inspect the workflow at a larger scale.',
  },
} satisfies Meta<typeof CaseStudyImage>

export default meta
type Story = StoryObj<typeof meta>

export const DesktopFallback: Story = {}

export const ArtDirectedMobile: Story = {
  args: { mobileImage },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
}
