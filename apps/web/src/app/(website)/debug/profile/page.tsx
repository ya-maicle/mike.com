import { notFound } from 'next/navigation'

import { ProfileDebugClient } from './profile-debug-client'

// Force dynamic rendering to prevent static generation issues with Supabase
export const dynamic = 'force-dynamic'

export default function ProfileDebugPage() {
  // Reason: debug tooling stays available locally and on preview deployments,
  // but must not ship as a public surface on the production domain.
  if (process.env.VERCEL_ENV === 'production') notFound()
  return <ProfileDebugClient />
}
