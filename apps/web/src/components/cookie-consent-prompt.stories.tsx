import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { CookieConsentPrompt } from './cookie-consent-prompt'

const meta: Meta<typeof CookieConsentPrompt> = {
  title: 'Components/Cookie Consent Prompt',
  component: CookieConsentPrompt,
  args: {
    onAccept: () => undefined,
    onReject: () => undefined,
    onManage: () => undefined,
  },
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

export const Desktop: Story = {}

export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}

export const SaveError: Story = {
  args: {
    saveError: 'Your preference could not be saved. Please try again.',
  },
}
