'use client'

import * as React from 'react'
import getSupabaseClient from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import { upsertProfileFromUser } from '@/lib/profile'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const supabase = getSupabaseClient()
    let mounted = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return
      setSession(data.session ?? null)
      setUser(data.session?.user ?? null)
      setLoading(false)
      if (data.session?.user) {
        // Ensure profile exists/updates after initial load
        upsertProfileFromUser(data.session.user).catch(() => {})
      }
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user ?? null)
      if (event === 'SIGNED_IN' && newSession?.user) {
        try {
          await upsertProfileFromUser(newSession.user)
        } catch {}
      }
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = React.useMemo(() => ({ user, session, loading }), [user, session, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
