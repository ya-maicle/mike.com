'use client'

import * as React from 'react'
import getSupabaseClient, {
  createSupabaseMagicLinkClient,
  exchangeSupabaseOAuthCode,
} from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import { upsertProfileFromUser } from '@/lib/profile'
import { isValidReturnPath } from '@/lib/url-validation'
import { isCaseStudyPath, withAccessDenied } from '@/lib/portfolio-access-client'
import { captureAnalyticsEvent, resetAnalyticsIdentity } from '@/lib/analytics/client'
import { consumePortfolioAccessContext } from '@/lib/analytics/portfolio-access'
import { requestedStudySlugFromPath, type PortfolioAuthMethod } from '@/lib/analytics/events'
import { GOOGLE_ONE_TAP_LOGIN_PENDING_KEY } from '@/lib/google-one-tap'
import { isSensitiveAuthPath } from '@/lib/auth-routes'
import { MAGIC_LINK_REQUEST_STORAGE_KEY, type MagicLinkCredential } from '@/lib/magic-link'

type PortfolioClaimResult = {
  status: 'granted' | 'denied' | 'blocked'
  companySlug?: string
}

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  completeMagicLink: (credential: MagicLinkCredential) => Promise<MagicLinkCompletionResult>
  confirmMagicLinkSwitch: () => Promise<MagicLinkSwitchResult>
  cancelMagicLinkSwitch: () => Promise<void>
}

type MagicLinkCompletionResult =
  | { status: 'complete' }
  | {
      status: 'switch_required'
      currentEmail: string | null
      candidateEmail: string | null
    }
  | { status: 'error' }

type MagicLinkSwitchResult = { status: 'complete' } | { status: 'error' }

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

function clearPendingMagicLinkRequest() {
  try {
    sessionStorage.removeItem(MAGIC_LINK_REQUEST_STORAGE_KEY)
  } catch {
    // Authentication must continue when browser storage is unavailable.
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)
  const capturedCompletionsRef = React.useRef(new Set<string>())
  const handledSessionsRef = React.useRef(new Set<string>())
  const magicLinkCompletionRef = React.useRef<Promise<MagicLinkCompletionResult> | null>(null)
  const magicLinkSwitchRef = React.useRef<Promise<MagicLinkSwitchResult> | null>(null)
  const pendingMagicLinkSessionRef = React.useRef<Session | null>(null)

  const isDebug = React.useMemo(() => {
    if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_AUTH_DEBUG === '1'

    if ((process.env.NODE_ENV as string) === 'production') {
      return process.env.NEXT_PUBLIC_AUTH_DEBUG === '1'
    }

    try {
      return (
        process.env.NEXT_PUBLIC_AUTH_DEBUG === '1' ||
        localStorage.getItem('auth-debug') === '1' ||
        process.env.NODE_ENV !== 'production'
      )
    } catch {
      return process.env.NODE_ENV !== 'production'
    }
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
    async (
      newSession: Session,
      authCallback: 'oauth' | 'magic_link' | null,
      isOneTapSignIn = false,
    ) => {
      await upsertProfileFromUser(newSession.user)

      let urlReturnUrl: string | null = null
      try {
        const url = new URL(window.location.href)
        const params = url.searchParams
        const maybeReturnUrl = params.get('auth_return_to')
        urlReturnUrl = isValidReturnPath(maybeReturnUrl) ? maybeReturnUrl : null
        if (authCallback || params.has('error')) {
          params.delete('code')
          params.delete('error')
          params.delete('error_description')
          params.delete('error_code')
          params.delete('auth_return_to')
          url.hash = ''
          window.history.replaceState({}, '', url.toString())
          dlog('Cleaned up URL params')
        }
      } catch {}

      let returnUrl: string | null = null
      try {
        returnUrl = localStorage.getItem('auth-return-url')
      } catch {}
      const safeReturnUrl = urlReturnUrl || (isValidReturnPath(returnUrl) ? returnUrl : null)
      const claim = await claimPortfolioAccess(
        newSession,
        safeReturnUrl || window.location.pathname,
      )
      const claimStatus = claim.status

      const analyticsContext = consumePortfolioAccessContext()
      const shouldCompleteAuth = authCallback !== null || isOneTapSignIn

      if (analyticsContext || shouldCompleteAuth) {
        const authMethod: PortfolioAuthMethod =
          analyticsContext?.authMethod ??
          (authCallback === 'magic_link' || newSession.user.app_metadata?.provider !== 'google'
            ? 'magic_link'
            : 'google')
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

      if (!safeReturnUrl || (!shouldCompleteAuth && claimStatus !== 'granted')) return

      try {
        localStorage.removeItem('auth-return-url')
      } catch {}

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

  const handleSessionOnce = React.useCallback(
    (newSession: Session, callback: 'oauth' | 'magic_link' | null, isOneTapSignIn = false) => {
      const sessionKey = newSession.access_token
      if (handledSessionsRef.current.has(sessionKey)) return
      handledSessionsRef.current.add(sessionKey)
      handleSignedInSession(newSession, callback, isOneTapSignIn).catch((error) => {
        handledSessionsRef.current.delete(sessionKey)
        dlog('Post-login handling failed:', error)
      })
    },
    [dlog, handleSignedInSession],
  )

  const discardMagicLinkSession = React.useCallback(
    async (candidateSession: Session) => {
      const transientClient = createSupabaseMagicLinkClient()
      try {
        const { error } = await transientClient.auth.setSession({
          access_token: candidateSession.access_token,
          refresh_token: candidateSession.refresh_token,
        })
        if (!error) await transientClient.auth.signOut({ scope: 'local' })
      } catch (error) {
        dlog(
          'Discarding the unused magic-link session failed:',
          error instanceof Error ? error.message : 'Unknown error',
        )
      } finally {
        try {
          await transientClient.auth.stopAutoRefresh()
        } catch {
          // Cleanup must not affect the active session or confirmation result.
        }
      }
    },
    [dlog],
  )

  const completeMagicLink = React.useCallback(
    (credential: MagicLinkCredential) => {
      if (magicLinkCompletionRef.current) return magicLinkCompletionRef.current

      const completion = (async (): Promise<MagicLinkCompletionResult> => {
        try {
          const supabase = getSupabaseClient()
          let candidateSession: Session

          if (credential.kind === 'token_hash') {
            const transientClient = createSupabaseMagicLinkClient()

            try {
              const { data, error } = await transientClient.auth.verifyOtp({
                token_hash: credential.tokenHash,
                type: 'email',
              })
              if (error || !data.session) throw error ?? new Error('No session returned.')
              candidateSession = data.session
            } finally {
              try {
                await transientClient.auth.stopAutoRefresh()
              } catch {
                // Never lose a consumed one-time token because cleanup failed.
              }
            }
          } else {
            const transientClient = createSupabaseMagicLinkClient()

            try {
              const { data, error } = await transientClient.auth.setSession({
                access_token: credential.accessToken,
                refresh_token: credential.refreshToken,
              })
              if (error || !data.session) throw error ?? new Error('No session returned.')
              candidateSession = data.session
            } finally {
              try {
                await transientClient.auth.stopAutoRefresh()
              } catch {
                // Never hide a valid legacy session because cleanup failed.
              }
            }
          }

          // Verification can take a while. Compare against the latest persistent
          // session immediately before adoption, not the one from page load.
          const { data: currentData, error: currentError } = await supabase.auth.getSession()
          if (currentError) throw currentError
          const currentSession = currentData.session
          const requiresAccountSwitch =
            currentSession?.user.id && currentSession.user.id !== candidateSession.user.id

          if (requiresAccountSwitch) {
            pendingMagicLinkSessionRef.current = candidateSession
            return {
              status: 'switch_required',
              currentEmail: currentSession.user.email ?? null,
              candidateEmail: candidateSession.user.email ?? null,
            }
          }

          const { data, error } = await supabase.auth.setSession({
            access_token: candidateSession.access_token,
            refresh_token: candidateSession.refresh_token,
          })
          if (error || !data.session) {
            throw error ?? new Error('The session could not be persisted.')
          }
          candidateSession = data.session

          pendingMagicLinkSessionRef.current = null
          setSession(candidateSession)
          setUser(candidateSession.user)
          clearPendingMagicLinkRequest()
          handleSessionOnce(candidateSession, 'magic_link')
          return { status: 'complete' }
        } catch (error) {
          dlog(
            'Magic-link completion failed:',
            error instanceof Error ? error.message : 'Unknown error',
          )
          return { status: 'error' }
        }
      })()

      magicLinkCompletionRef.current = completion
      void completion.finally(() => {
        if (magicLinkCompletionRef.current === completion) {
          magicLinkCompletionRef.current = null
        }
      })
      return completion
    },
    [dlog, handleSessionOnce],
  )

  const confirmMagicLinkSwitch = React.useCallback(() => {
    if (magicLinkSwitchRef.current) return magicLinkSwitchRef.current

    const completion = (async (): Promise<MagicLinkSwitchResult> => {
      const candidateSession = pendingMagicLinkSessionRef.current
      if (!candidateSession) return { status: 'error' }

      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase.auth.setSession({
          access_token: candidateSession.access_token,
          refresh_token: candidateSession.refresh_token,
        })
        if (error || !data.session) {
          throw error ?? new Error('The session could not be persisted.')
        }

        pendingMagicLinkSessionRef.current = null
        setSession(data.session)
        setUser(data.session.user)
        clearPendingMagicLinkRequest()
        handleSessionOnce(data.session, 'magic_link')
        return { status: 'complete' }
      } catch (error) {
        dlog(
          'Magic-link account switch failed:',
          error instanceof Error ? error.message : 'Unknown error',
        )
        return { status: 'error' }
      }
    })()

    magicLinkSwitchRef.current = completion
    void completion.finally(() => {
      if (magicLinkSwitchRef.current === completion) {
        magicLinkSwitchRef.current = null
      }
    })
    return completion
  }, [dlog, handleSessionOnce])

  const cancelMagicLinkSwitch = React.useCallback(async () => {
    const candidateSession = pendingMagicLinkSessionRef.current
    pendingMagicLinkSessionRef.current = null
    if (!candidateSession) return
    await discardMagicLinkSession(candidateSession)
  }, [discardMagicLinkSession])

  React.useEffect(() => {
    let mounted = true
    const supabase = getSupabaseClient()
    const pathname = window.location.pathname
    const isSensitiveAuthEntry = isSensitiveAuthPath(pathname)
    const callbackParams = new URLSearchParams(window.location.search)
    const oauthCode = isSensitiveAuthEntry ? null : callbackParams.get('code')
    const callbackError =
      !isSensitiveAuthEntry &&
      (callbackParams.has('error') || callbackParams.has('error_description'))

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      dlog('onAuthStateChange:', event, {
        hasSession: !!newSession,
        userId: newSession?.user?.id,
      })
      setSession(newSession)
      setUser(newSession?.user ?? null)
      setLoading(false)
      if (newSession && !isSensitiveAuthEntry) clearPendingMagicLinkRequest()

      let isOneTapSignIn = false
      if (event === 'SIGNED_IN') {
        try {
          isOneTapSignIn = sessionStorage.getItem(GOOGLE_ONE_TAP_LOGIN_PENDING_KEY) === '1'
          if (isOneTapSignIn) sessionStorage.removeItem(GOOGLE_ONE_TAP_LOGIN_PENDING_KEY)
        } catch {}
      }

      if (event === 'SIGNED_IN' && newSession?.user && isOneTapSignIn) {
        handleSessionOnce(newSession, null, true)
      }
    })

    if (oauthCode) {
      const cleanUrl = new URL(window.location.href)
      cleanUrl.searchParams.delete('code')
      window.history.replaceState({}, '', cleanUrl.toString())
      dlog('OAuth callback detected')

      void exchangeSupabaseOAuthCode(oauthCode)
        .then(async (candidateSession) => {
          let shouldDiscardCandidate = true

          try {
            if (!mounted) {
              await discardMagicLinkSession(candidateSession)
              shouldDiscardCandidate = false
              return
            }

            const { data: currentData, error: currentError } = await supabase.auth.getSession()
            if (currentError) throw currentError

            const currentSession = currentData.session
            if (currentSession && currentSession.user.id !== candidateSession.user.id) {
              await discardMagicLinkSession(candidateSession)
              shouldDiscardCandidate = false
              if (mounted) window.location.replace('/auth/confirm?error=account_conflict')
              return
            }

            if (!mounted) {
              await discardMagicLinkSession(candidateSession)
              shouldDiscardCandidate = false
              return
            }

            const { data, error } = await supabase.auth.setSession({
              access_token: candidateSession.access_token,
              refresh_token: candidateSession.refresh_token,
            })
            if (error || !data.session) {
              throw error ?? new Error('The session could not be persisted.')
            }
            shouldDiscardCandidate = false
            if (!mounted) return

            setSession(data.session)
            setUser(data.session.user)
            clearPendingMagicLinkRequest()
            handleSessionOnce(data.session, 'oauth')
          } catch (error) {
            if (shouldDiscardCandidate) await discardMagicLinkSession(candidateSession)
            throw error
          }
        })
        .catch((error) => {
          if (!mounted) return
          dlog('OAuth code exchange exception:', error)
          setLoading(false)
          window.location.replace('/auth/confirm?error=invalid_link')
        })
    } else if (callbackError) {
      window.location.replace('/auth/confirm?error=invalid_link')
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      dlog('Initial getSession:', {
        hasSession: !!data.session,
        userId: data.session?.user?.id,
      })
      setSession(data.session ?? null)
      setUser(data.session?.user ?? null)
      setLoading(false)
      if (data.session && !isSensitiveAuthEntry) clearPendingMagicLinkRequest()

      if (data.session?.user && !oauthCode && !isSensitiveAuthEntry) {
        handleSessionOnce(data.session, null)
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
          if (data.session && !isSensitiveAuthEntry) clearPendingMagicLinkRequest()
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
          if (data.session && !isSensitiveAuthEntry) clearPendingMagicLinkRequest()
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
  }, [discardMagicLinkSession, dlog, handleSessionOnce])

  const signOut = React.useCallback(async () => {
    const supabase = getSupabaseClient()
    await cancelMagicLinkSwitch()
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
  }, [cancelMagicLinkSwitch])

  const value = React.useMemo(
    () => ({
      user,
      session,
      loading,
      signOut,
      completeMagicLink,
      confirmMagicLinkSwitch,
      cancelMagicLinkSwitch,
    }),
    [
      user,
      session,
      loading,
      signOut,
      completeMagicLink,
      confirmMagicLinkSwitch,
      cancelMagicLinkSwitch,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
