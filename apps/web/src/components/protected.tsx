'use client'

import * as React from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { useLoginModal } from '@/components/providers/login-modal-provider'

type ProtectedProps = {
  children: React.ReactNode
  fallback?: React.ReactNode
  onUnauthed?: 'modal' | 'none'
}

/**
 * Client-side guard for gated content.
 * - Shows `fallback` (or nothing) when unauthenticated
 * - Optionally opens the login modal automatically
 */
export function Protected({ children, fallback, onUnauthed = 'modal' }: ProtectedProps) {
  const { user, loading } = useAuth()
  const { openLogin } = useLoginModal()

  React.useEffect(() => {
    if (!loading && !user && onUnauthed === 'modal') {
      openLogin()
    }
  }, [loading, user, onUnauthed, openLogin])

  if (loading) return <div className="p-6">Loading…</div>
  if (!user) return <>{fallback ?? null}</>
  return <>{children}</>
}

export default Protected
