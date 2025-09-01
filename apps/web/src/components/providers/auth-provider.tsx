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

  // Debug logger (enable by setting NEXT_PUBLIC_AUTH_DEBUG=1 or localStorage.setItem('auth-debug','1'))
  const isDebug = React.useMemo(() => {
    if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_AUTH_DEBUG === '1'
    try {
      return (
        process.env.NEXT_PUBLIC_AUTH_DEBUG === '1' ||
        localStorage.getItem('auth-debug') === '1' ||
        process.env.NODE_ENV !== 'production'
      )
    } catch {
      return process.env.NEXT_PUBLIC_AUTH_DEBUG === '1'
    }
  }, [])
  const mask = (v?: string | null) => (v ? `${v.slice(0, 6)}…` : v)
  const dlog = (...args: any[]) => {
    if (!isDebug) return
    // eslint-disable-next-line no-console
    console.log('[AUTH]', ...args)
  }

  const cleanupAuthParams = React.useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      const url = new URL(window.location.href)
      const isAuthReturn =
        url.searchParams.has('code') ||
        url.searchParams.has('token_hash') ||
        url.searchParams.has('error_description')
      if (!isAuthReturn) return
      ;['code', 'state', 'error_description', 'error', 'provider', 'token_hash', 'type'].forEach(
        (p) => url.searchParams.delete(p),
      )
      const next =
        url.pathname + (url.searchParams.toString() ? `?${url.searchParams}` : '') + url.hash
      window.history.replaceState({}, '', next)
    } catch {}
  }, [])

  React.useEffect(() => {
    let mounted = true

    // 0) Detect PKCE vs Magic Link, prep code_verifier for PKCE
    let hasPkceCode = false
    let hasTokenHash = false
    let tokenHash: string | null = null
    let tokenType: string | null = null
    if (typeof window !== 'undefined') {
      try {
        const href = window.location.href
        const url = new URL(href)
        hasPkceCode = !!url.searchParams.get('code')
        tokenHash = url.searchParams.get('token_hash')
        tokenType = url.searchParams.get('type')
        hasTokenHash = !!tokenHash
        dlog('Mount href:', href)
        dlog('Detected return flags:', { hasPkceCode, hasTokenHash, type: tokenType })
        if (hasPkceCode) {
          for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i)
            if (!k) continue
            if (/^sb-.*-auth-token-code-verifier$/.test(k) && !sessionStorage.getItem(k)) {
              const v = localStorage.getItem(k)
              if (v) sessionStorage.setItem(k, v)
              dlog('Copied code_verifier to sessionStorage from', k)
            }
          }
        }
      } catch {}
    }

    const supabase = getSupabaseClient()

    // 1) Subscribe first so SIGNED_IN from code exchange is captured
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      dlog('onAuthStateChange:', event, {
        hasSession: !!newSession,
        userId: newSession?.user?.id,
        exp: newSession?.expires_at,
      })
      setSession(newSession)
      setUser(newSession?.user ?? null)
      // Ensure we never get stuck in loading after an auth event
      setLoading(false)
      if (event === 'SIGNED_IN' && newSession?.user) {
        try {
          await upsertProfileFromUser(newSession.user)
        } catch {}
        // Remove OAuth/Magic Link query params once we've processed the session
        cleanupAuthParams()
      }
    })

    // 2) Attempt PKCE (code) exchange or Magic Link (token_hash) verify, then read session
    ;(async () => {
      try {
        if (typeof window !== 'undefined') {
          const href = window.location.href
          try {
            if (hasPkceCode) {
              dlog('Exchanging PKCE code via exchangeCodeForSession…')
              await Promise.race([
                supabase.auth.exchangeCodeForSession(href),
                new Promise((resolve) => setTimeout(resolve, 4000)),
              ])
              cleanupAuthParams()
            } else if (hasTokenHash && tokenHash) {
              const rawType = (tokenType || '').toLowerCase()
              const type =
                rawType === 'recovery' ||
                rawType === 'email_change' ||
                rawType === 'invite' ||
                rawType === 'signup'
                  ? rawType
                  : 'magiclink'
              dlog('Verifying magic link via verifyOtp…', { type, tokenHash: mask(tokenHash) })
              await (supabase.auth as any).verifyOtp({ token_hash: tokenHash, type })
              cleanupAuthParams()
            }
          } catch (err) {
            dlog('Exchange/verify error:', (err as any)?.message || err)
          }
        }
        const { data } = await supabase.auth.getSession()
        if (!mounted) return
        dlog('Post-exchange getSession:', {
          hasSession: !!data.session,
          userId: data.session?.user?.id,
        })
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
          dlog('storage: app-auth-event', payload)
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
        dlog('storage: supabase token key changed', { key, present: e.newValue != null })
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
        dlog('visibilitychange: visible → revalidate session')
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
  }, [cleanupAuthParams])

  const signOut = React.useCallback(async () => {
    const supabase = getSupabaseClient()
    // 1) Immediately clear local session to avoid UI hang
    try {
      dlog('signOut: local')
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
      dlog('signOut: broadcast app-auth-event')
      localStorage.setItem('app-auth-event', JSON.stringify({ event: 'SIGNED_OUT', t: Date.now() }))
    } catch {}

    // 2) Fire-and-forget a global revoke in the background (non-blocking)
    try {
      dlog('signOut: global (background)')
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
