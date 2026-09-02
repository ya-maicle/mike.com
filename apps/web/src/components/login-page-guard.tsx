'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { isValidReturnPath } from '@/lib/url-validation'

function getSignedInDestination() {
  try {
    const returnPath = localStorage.getItem('auth-return-url')
    if (isValidReturnPath(returnPath)) return returnPath!
  } catch {
    // Storage is optional; home is always a safe authenticated destination.
  }
  return '/'
}

export function LoginPageGuard({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()
  const router = useRouter()

  React.useEffect(() => {
    if (!loading && user) {
      router.replace(getSignedInDestination())
    }
  }, [loading, router, user])

  if (loading || user) return null

  return <>{children}</>
}
