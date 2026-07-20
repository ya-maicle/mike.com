import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { CookieChoices } from '@/lib/cookie-preferences'
import { CookiePreferencesDialog } from './cookie-preferences-dialog'

const meta: Meta<typeof CookiePreferencesDialog> = {
  title: 'Components/Cookie Preferences Dialog',
  component: CookiePreferencesDialog,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

function DialogStory({ initialChoices }: { initialChoices: CookieChoices }) {
  const [open, setOpen] = React.useState(true)
  const [choices, setChoices] = React.useState(initialChoices)

  return (
    <CookiePreferencesDialog
      open={open}
      choices={choices}
      onOpenChange={setOpen}
      onSave={(nextChoices) => {
        setChoices(nextChoices)
        setOpen(false)
      }}
    />
  )
}

export const Default: Story = {
  render: () => <DialogStory initialChoices={{ analytics: false }} />,
}

export const AnalyticsEnabled: Story = {
  render: () => <DialogStory initialChoices={{ analytics: true }} />,
}

export const Mobile: Story = {
  render: () => <DialogStory initialChoices={{ analytics: false }} />,
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}
