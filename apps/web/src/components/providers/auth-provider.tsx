'use client'

import * as React from 'react'
import getSupabaseClient from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import { upsertProfileFromUser } from '@/lib/profile'

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

  React.useEffect(() => {
    let mounted = true

    // 0) If returning via magic link/PKCE in a new tab, ensure the code_verifier
    // is present in sessionStorage BEFORE creating the Supabase client, so that
    // any internal URL detection/exchange can succeed.
    let needsExchange = false
    if (typeof window !== 'undefined') {
      try {
        const href = window.location.href
        const url = new URL(href)
        const hasCodeOrTokenHash = !!(
          url.searchParams.get('code') || url.searchParams.get('token_hash')
        )
        // Only run manual exchange for code/token_hash; leave hash tokens to detectSessionInUrl
        needsExchange = hasCodeOrTokenHash
        if (needsExchange) {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i)
            if (!k) continue
            if (/^sb-.*-auth-token-code-verifier$/.test(k) && !sessionStorage.getItem(k)) {
              const v = localStorage.getItem(k)
              if (v) sessionStorage.setItem(k, v)
            }
          }
        }
      } catch {}
    }

    const supabase = getSupabaseClient()

    // 1) Subscribe first so SIGNED_IN from code exchange is captured
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      // Ensure we never get stuck in loading after an auth event
      setLoading(false)
      if (event === 'SIGNED_IN' && newSession?.user) {
        try {
          await upsertProfileFromUser(newSession.user)
        } catch {}
      }
    })

    // 2) Attempt code exchange (if indicated), then read session
    ;(async () => {
      try {
        if (typeof window !== 'undefined' && needsExchange) {
          const href = window.location.href
          try {
            // Best-effort exchange; allow up to 4s in slow networks
            await Promise.race([
              supabase.auth.exchangeCodeForSession(href),
              new Promise((resolve) => setTimeout(resolve, 4000)),
            ])
          } catch {}
        }
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        setSession(data.session ?? null)
        setUser(data.session?.user ?? null)
        setLoading(false)
        if (data.session?.user) {
          // Ensure profile exists/updates after initial load (non-blocking)
          upsertProfileFromUser(data.session.user).catch(() => {})
        }
      } catch {
        if (!mounted) return
        setLoading(false)
      }
    })()

    // Fallback: listen to storage changes across tabs and resync session
    const onStorage = (e: StorageEvent) => {
      const key = e.key || ''
      // Our custom broadcast: force local sign-out to clear Supabase client memory
      if (key === 'app-auth-event') {
        try {
          const payload = JSON.parse(e.newValue || '{}') as { event?: string }
          if (payload?.event === 'SIGNED_OUT') {
            // do not await; ensure immediate state update
            supabase.auth.signOut({ scope: 'local' }).catch(() => {})
            setSession(null)
            setUser(null)
            setLoading(false)
            return
          }
        } catch {}
      }
      // Supabase token changes: resync session
      if (/^sb-.*-auth-token(\..*)?$/.test(key)) {
        // If token removed (e.newValue === null), treat as signed out
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

    // Visibility change: resync when a tab becomes active (last-ditch fix)
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
  }, [])

  const signOut = React.useCallback(async () => {
    const supabase = getSupabaseClient()
    // 1) Immediately clear local session to avoid UI hang
    try {
      await Promise.race([
        supabase.auth.signOut({ scope: 'local' }),
        new Promise((resolve) => setTimeout(resolve, 500)),
      ])
    } catch {}

    // 1b) Hard purge any lingering Supabase auth keys as a safety net (Safari/localStorage quirks)
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

    // 1c) Clear context so UI updates instantly
    setSession(null)
    setUser(null)
    setLoading(false)
    // Broadcast to other tabs to resync
    try {
      localStorage.setItem('app-auth-event', JSON.stringify({ event: 'SIGNED_OUT', t: Date.now() }))
    } catch {}

    // 2) Fire-and-forget a global revoke in the background (non-blocking)
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
