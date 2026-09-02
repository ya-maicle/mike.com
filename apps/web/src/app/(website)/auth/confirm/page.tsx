import type { Metadata } from 'next'

import { AuthPageShell } from '@/components/auth-page-shell'
import { MagicLinkConfirmation } from '@/components/magic-link-confirmation'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  ...createPageMetadata({
    title: 'Confirm sign in',
    description: 'Confirm your secure sign-in link.',
    path: '/auth/confirm',
    noIndex: true,
    noFollow: true,
  }),
  referrer: 'no-referrer',
}

export default function ConfirmMagicLinkPage() {
  return (
    <AuthPageShell>
      <MagicLinkConfirmation />
    </AuthPageShell>
  )
}
