import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { HomeShowreel } from './home-showreel'
import { CookiePreferencesProvider } from './providers/cookie-preferences-provider'
import { MobileNavigationProvider } from './providers/mobile-navigation-provider'
import { MUX_DEMO_PLAYBACK_ID } from '@/stories/video-fixtures'

const meta: Meta<typeof HomeShowreel> = {
  title: 'Components/Home Showreel',
  component: HomeShowreel,
  args: { playbackId: MUX_DEMO_PLAYBACK_ID },
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[1376px] p-4">
        <MobileNavigationProvider>
          <CookiePreferencesProvider>
            <Story />
          </CookiePreferencesProvider>
        </MobileNavigationProvider>
      </div>
    ),
  ],
}
export default meta
type Story = StoryObj<typeof meta>
export const Default: Story = {}
