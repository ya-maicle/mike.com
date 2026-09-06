import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { MuxContentPlayer } from './mux-content-player'
import { CookiePreferencesProvider } from './providers/cookie-preferences-provider'
import { MobileNavigationProvider } from './providers/mobile-navigation-provider'
import { MUX_DEMO_PLAYBACK_ID } from '@/stories/video-fixtures'

const meta: Meta<typeof MuxContentPlayer> = {
  title: 'Components/Video Player',
  component: MuxContentPlayer,
  args: {
    playbackId: MUX_DEMO_PLAYBACK_ID,
    title: 'Product design showreel',
    controls: true,
    objectFit: 'contain',
    maxResolution: '1080p',
  },
  render: (args) => (
    <div className="aspect-video w-full max-w-4xl overflow-hidden rounded-lg bg-black">
      <MuxContentPlayer {...args} />
    </div>
  ),
  decorators: [
    (Story) => (
      <MobileNavigationProvider>
        <CookiePreferencesProvider>
          <Story />
        </CookiePreferencesProvider>
      </MobileNavigationProvider>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="w-[358px] max-w-full">
        <Story />
      </div>
    ),
  ],
}

export const Dark: Story = {
  decorators: [
    (Story) => (
      <div className="dark bg-background p-4">
        <Story />
      </div>
    ),
  ],
}
