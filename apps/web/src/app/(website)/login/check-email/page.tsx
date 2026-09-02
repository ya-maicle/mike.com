import type { Metadata } from 'next'

import { AuthPageShell } from '@/components/auth-page-shell'
import { LoginPageGuard } from '@/components/login-page-guard'
import { MagicLinkSent } from '@/components/magic-link-sent'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'Check your email',
  description: 'Check your email to continue signing in.',
  path: '/login/check-email',
  noIndex: true,
  noFollow: true,
})

export default function CheckEmailPage() {
  return (
    <LoginPageGuard>
      <AuthPageShell>
        <MagicLinkSent />
      </AuthPageShell>
    </LoginPageGuard>
  )
}
