import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CaseStudyLayout } from './case-study-layout'
import { CookiePreferencesProvider } from './providers/cookie-preferences-provider'
import { MobileNavigationProvider } from './providers/mobile-navigation-provider'
import { Button } from '@/components/ui/button'
import { MUX_DEMO_PLAYBACK_ID } from '@/stories/video-fixtures'
import type { CaseStudy, SanityImage } from '@/sanity/queries'

// Public sample image already used by the blog archive stories; no CMS writes.
const image: SanityImage = {
  _type: 'image',
  alt: 'Sample case-study image',
  asset: {
    _id: 'image-ff338b84dd63ac41db413a2db435c9068127f2f0-1200x630-jpg',
    metadata: { dimensions: { width: 1200, height: 630 } },
  },
}
const video = { asset: { playbackId: MUX_DEMO_PLAYBACK_ID, aspectRatio: '16:9' } }
const imageBlock = { _type: 'imageBlock' as const, image, title: 'Image and caption' }
const decorativeVideo = { _type: 'videoBlock' as const, video, mode: 'decorative' }
const mediaSamples: NonNullable<CaseStudy['content']> = [
  { ...imageBlock, image: { ...image, caption: 'Captions sit outside the media border.' } },
  { _type: 'videoBlock', video, title: 'Video with controls' },
  { ...decorativeVideo, title: 'Decorative video' },
  { _type: 'twoColumnImageBlock', leftImage: image, rightImage: image },
  {
    _type: 'twoColumnImageBlock',
    leftKind: 'image',
    leftImage: image,
    rightKind: 'video',
    rightVideo: video,
  },
  {
    _type: 'twoColumnImageBlock',
    leftKind: 'video',
    leftVideo: video,
    rightKind: 'video',
    rightVideo: video,
  },
  {
    _type: 'carouselBlock',
    title: 'Image and video carousel',
    items: [
      { kind: 'image', image },
      { kind: 'video', video },
    ],
  },
]
const blocks = mediaSamples.map((block, index) => ({ ...block, _key: `media-${index}` }))
const mediaLabels = [
  'image',
  'video',
  'decorative video',
  'image pair',
  'mixed pair',
  'video pair',
  'carousel',
]

const study: CaseStudy = {
  _id: 'storybook-media-coverage',
  _type: 'caseStudy',
  title: 'Case-study media borders',
  summary: 'Every media type shares one thin border. Open About the project to review panel media.',
  slug: { current: 'storybook-media-coverage' },
  headerMedia: { type: 'image', image },
  content: blocks,
  panelContent: blocks,
}

const meta = {
  title: 'Case Study/Media Borders',
  component: CaseStudyLayout,
  args: { data: study },
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
  decorators: [
    (Story) => (
      <MobileNavigationProvider>
        <CookiePreferencesProvider>
          <Story />
        </CookiePreferencesProvider>
      </MobileNavigationProvider>
    ),
  ],
} satisfies Meta<typeof CaseStudyLayout>
export default meta
type Story = StoryObj<typeof meta>

export const AllMedia: Story = {}
export const Dark: Story = {
  // The mobile panel is portaled to body, so the theme must cover the whole document.
  beforeEach: () => {
    const wasDark = document.documentElement.classList.contains('dark')
    document.documentElement.classList.add('dark')
    return () => {
      if (!wasDark) document.documentElement.classList.remove('dark')
    }
  },
}
export const VideoCover: Story = {
  args: { data: { ...study, headerMedia: { type: 'video', video } } },
}

function AddNewMediaDemo() {
  const [content, setContent] = useState<NonNullable<CaseStudy['content']>>([])
  return (
    <>
      <div className="flex flex-wrap gap-2 p-4">
        {blocks.map((block, index) => (
          <Button
            key={block._key}
            variant="secondary"
            onClick={() =>
              setContent((current) => [...current, { ...block, _key: `added-${current.length}` }])
            }
          >
            Add {mediaLabels[index]}
          </Button>
        ))}
      </div>
      <CaseStudyLayout
        data={{ ...study, headerMedia: undefined, content, panelContent: content }}
      />
    </>
  )
}

export const NewlyAddedMedia: Story = { render: () => <AddNewMediaDemo /> }
