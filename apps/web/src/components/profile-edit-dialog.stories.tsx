import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '@/components/ui/button'
import { ProfileEditDialog } from './profile-edit-dialog'

const meta: Meta<typeof ProfileEditDialog> = {
  title: 'Components/ProfileEditDialog',
  component: ProfileEditDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof meta>

function ProfileEditDialogStory() {
  const [open, setOpen] = React.useState(true)

  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit profile</Button>
      <ProfileEditDialog
        open={open}
        onOpenChange={setOpen}
        userId="storybook-user"
        email="mikhail@example.com"
        profile={{
          firstName: 'Mikhail',
          lastName: 'Iukhtenko',
          avatarUrl: '/default-avatars/avatar-2.png',
        }}
        saveProfile={async ({ avatarUrl, firstName, lastName }) => ({
          avatarUrl,
          firstName,
          lastName,
        })}
        onSaved={() => undefined}
      />
    </>
  )
}

export const Default: Story = {
  render: () => <ProfileEditDialogStory />,
}

export const Mobile: Story = {
  render: () => <ProfileEditDialogStory />,
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
}
