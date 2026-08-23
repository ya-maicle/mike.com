'use client'

import * as React from 'react'
import getSupabaseClient from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import { upsertProfileFromUser } from '@/lib/profile'
import { isValidReturnPath } from '@/lib/url-validation'
import { isCaseStudyPath, withAccessDenied } from '@/lib/portfolio-access-client'
import { captureAnalyticsEvent, resetAnalyticsIdentity } from '@/lib/analytics/client'
import { consumePortfolioAccessContext } from '@/lib/analytics/portfolio-access'
import { requestedStudySlugFromPath, type PortfolioAuthMethod } from '@/lib/analytics/events'

type PortfolioClaimResult = {
  status: 'granted' | 'denied' | 'blocked'
  companySlug?: string
}

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)
  const capturedCompletionsRef = React.useRef(new Set<string>())

  const isDebug = React.useMemo(() => {
    if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_AUTH_DEBUG === '1'

    if ((process.env.NODE_ENV as string) === 'production') {
      return process.env.NEXT_PUBLIC_AUTH_DEBUG === '1'
    }

    return (
      process.env.NEXT_PUBLIC_AUTH_DEBUG === '1' ||
      localStorage.getItem('auth-debug') === '1' ||
      process.env.NODE_ENV !== 'production'
    )
  }, [])

  const dlog = React.useCallback(
    (...args: unknown[]) => {
      if (!isDebug) return
      // eslint-disable-next-line no-console
      console.log('[AUTH]', ...args)
    },
    [isDebug],
  )

  const claimPortfolioAccess = React.useCallback(
    async (newSession: Session, path?: string | null) => {
      try {
        const res = await fetch('/api/portfolio-access/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: newSession.access_token,
            path,
          }),
        })
        if (!res.ok) return { status: 'denied' } satisfies PortfolioClaimResult
        const payload = (await res.json()) as Partial<PortfolioClaimResult>
        dlog('Portfolio access claim:', payload.status)
        return {
          status: payload.status ?? 'denied',
          ...(payload.companySlug ? { companySlug: payload.companySlug } : {}),
        } satisfies PortfolioClaimResult
      } catch (error) {
        dlog('Portfolio access claim failed:', error)
        return { status: 'denied' } satisfies PortfolioClaimResult
      }
    },
    [dlog],
  )

  const handleSignedInSession = React.useCallback(
    async (newSession: Session, isOAuthCallback: boolean) => {
      await upsertProfileFromUser(newSession.user)

      let urlReturnUrl: string | null = null
      try {
        const url = new URL(window.location.href)
        const params = url.searchParams
        const maybeReturnUrl = params.get('auth_return_to')
        urlReturnUrl = isValidReturnPath(maybeReturnUrl) ? maybeReturnUrl : null
        if (params.has('code') || params.has('error')) {
          params.delete('code')
          params.delete('error')
          params.delete('error_description')
          params.delete('error_code')
          params.delete('auth_return_to')
          window.history.replaceState({}, '', url.toString())
          dlog('Cleaned up URL params')
        }
      } catch {}

      const returnUrl = localStorage.getItem('auth-return-url')
      const safeReturnUrl = urlReturnUrl || (isValidReturnPath(returnUrl) ? returnUrl : null)
      const claim = await claimPortfolioAccess(
        newSession,
        safeReturnUrl || window.location.pathname,
      )
      const claimStatus = claim.status

      const analyticsContext = consumePortfolioAccessContext()
      if (analyticsContext || isOAuthCallback) {
        const authMethod: PortfolioAuthMethod =
          analyticsContext?.authMethod ??
          (newSession.user.app_metadata?.provider === 'google' ? 'google' : 'magic_link')
        const completionKey = [
          newSession.user.id,
          claimStatus,
          newSession.expires_at ?? 'session',
          safeReturnUrl ?? window.location.pathname,
        ].join(':')

        if (!capturedCompletionsRef.current.has(completionKey)) {
          capturedCompletionsRef.current.add(completionKey)
          captureAnalyticsEvent('portfolio_access_completed', {
            outcome: claimStatus,
            auth_method: authMethod,
            entry_point: analyticsContext?.entryPoint ?? 'login_page',
            requested_study_slug:
              analyticsContext?.requestedStudySlug ?? requestedStudySlugFromPath(safeReturnUrl),
            company_slug: claim.companySlug,
          })
        }
      }

      if (!safeReturnUrl || (!isOAuthCallback && claimStatus !== 'granted')) return

      localStorage.removeItem('auth-return-url')

      if (claimStatus === 'granted' || !isCaseStudyPath(safeReturnUrl)) {
        dlog('Redirecting to:', safeReturnUrl)
        window.location.replace(safeReturnUrl)
        return
      }

      dlog('Redirecting to restricted case study prompt:', safeReturnUrl)
      window.location.replace(withAccessDenied(safeReturnUrl))
    },
    [claimPortfolioAccess, dlog],
  )

  React.useEffect(() => {
    let mounted = true
    const supabase = getSupabaseClient()

    const isOAuthCallback =
      typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('code')

    if (isOAuthCallback) {
      dlog('OAuth callback detected')
    }

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      dlog('onAuthStateChange:', event, {
        hasSession: !!newSession,
        userId: newSession?.user?.id,
      })
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)

      const shouldHandlePostLogin = (event === 'SIGNED_IN' || isOAuthCallback) && !!newSession?.user

      if (shouldHandlePostLogin) {
        handleSignedInSession(newSession, isOAuthCallback).catch(() => {})
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      dlog('Initial getSession:', {
        hasSession: !!data.session,
        userId: data.session?.user?.id,
      })
      setSession(data.session ?? null)
      setUser(data.session?.user ?? null)
      setLoading(false)

      if (data.session?.user) {
        handleSignedInSession(data.session, isOAuthCallback).catch(() => {})
      }
    })

    const onStorage = (e: StorageEvent) => {
      const key = e.key || ''
      if (key === 'app-auth-event') {
        try {
          const payload = JSON.parse(e.newValue || '{}') as { event?: string }
          if (payload?.event === 'SIGNED_OUT') {
            supabase.auth.signOut({ scope: 'local' }).catch(() => {})
            setSession(null)
            setUser(null)
            setLoading(false)
            return
          }
        } catch {}
      }
      if (/^sb-.*-auth-token(\..*)?$/.test(key)) {
        if (e.newValue === null) {
          supabase.auth.signOut({ scope: 'local' }).catch(() => {})
          setSession(null)
          setUser(null)
          setLoading(false)
          return
        }
        supabase.auth.getSession().then(({ data }) => {
          setSession(data.session ?? null)
          setUser(data.session?.user ?? null)
          setLoading(false)
        })
      }
    }
    window.addEventListener('storage', onStorage)

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession().then(({ data }) => {
          setSession(data.session ?? null)
          setUser(data.session?.user ?? null)
          setLoading(false)
        })
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [dlog, handleSignedInSession])

  const signOut = React.useCallback(async () => {
    const supabase = getSupabaseClient()
    resetAnalyticsIdentity()

    try {
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ])
    } catch {}

    fetch('/api/portfolio-access/logout', { method: 'POST' }).catch(() => {})

    try {
      const toDelete: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (!k) continue
        if (/^sb-.*-auth-token(\..*)?$/.test(k) || k.includes('supabase.auth.token')) {
          toDelete.push(k)
        }
      }
      toDelete.forEach((k) => localStorage.removeItem(k))
    } catch {}

    setSession(null)
    setUser(null)
    setLoading(false)

    try {
      localStorage.setItem('app-auth-event', JSON.stringify({ event: 'SIGNED_OUT', t: Date.now() }))
    } catch {}

    try {
      const p = supabase.auth.signOut({ scope: 'global' })
      Promise.race([p, new Promise((resolve) => setTimeout(resolve, 2000))]).catch(() => {})
    } catch {}
  }, [])

  const value = React.useMemo(
    () => ({ user, session, loading, signOut }),
    [user, session, loading, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
