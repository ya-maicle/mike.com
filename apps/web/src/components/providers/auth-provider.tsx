'use client'

import * as React from 'react'
import getSupabaseClient from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import { upsertProfileFromUser } from '@/lib/profile'
import { isValidReturnPath } from '@/lib/url-validation'

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
        upsertProfileFromUser(newSession.user).catch(() => {})

        try {
          const url = new URL(window.location.href)
          const params = url.searchParams
          if (params.has('code') || params.has('error')) {
            params.delete('code')
            params.delete('error')
            params.delete('error_description')
            params.delete('error_code')
            window.history.replaceState({}, '', url.toString())
            dlog('Cleaned up URL params')
          }
        } catch {}

        try {
          const returnUrl = localStorage.getItem('auth-return-url')
          if (isValidReturnPath(returnUrl)) {
            dlog('Redirecting to:', returnUrl)
            localStorage.removeItem('auth-return-url')
            window.location.replace(returnUrl!)
          }
        } catch {}
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
        upsertProfileFromUser(data.session.user).catch(() => {})

        if (isOAuthCallback) {
          try {
            const returnUrl = localStorage.getItem('auth-return-url')
            if (isValidReturnPath(returnUrl)) {
              dlog('Redirecting to:', returnUrl)
              localStorage.removeItem('auth-return-url')
              window.location.replace(returnUrl!)
            }
          } catch {}
        }
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
  }, [dlog])

  const signOut = React.useCallback(async () => {
    const supabase = getSupabaseClient()

    try {
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ])
    } catch {}

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
