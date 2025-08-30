'use client'

import * as React from 'react'
import getSupabaseClient from '@/lib/supabase'

type Mode = 'login' | 'signup'

type LoginModalContextValue = {
  open: boolean
  setOpen: (open: boolean) => void
  mode: Mode
  setMode: (mode: Mode) => void
  openLogin: () => void
  openSignup: () => void
  closeLogin: () => void
}

const LoginModalContext = React.createContext<LoginModalContextValue | undefined>(undefined)

export function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<Mode>('login')
  const openLogin = React.useCallback(() => {
    setMode('login')
    setOpen(true)
  }, [])
  const openSignup = React.useCallback(() => {
    setMode('signup')
    setOpen(true)
  }, [])
  const closeLogin = React.useCallback(() => setOpen(false), [])
  const value = React.useMemo(
    () => ({ open, setOpen, mode, setMode, openLogin, openSignup, closeLogin }),
    [open, mode],
  )
  // Auto-close on successful sign-in
  React.useEffect(() => {
    const supabase = getSupabaseClient()
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        setOpen(false)
        setMode('login')
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])
  return <LoginModalContext.Provider value={value}>{children}</LoginModalContext.Provider>
}

export function useLoginModal() {
  const ctx = React.useContext(LoginModalContext)
  if (!ctx) throw new Error('useLoginModal must be used within LoginModalProvider')
  return ctx
}
