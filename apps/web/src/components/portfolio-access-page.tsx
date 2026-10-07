'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './providers/auth-provider'
import { usePortfolioRequest } from './providers/portfolio-request-provider'
import { LoginForm } from './login-form'
import { PortfolioAccessRequestForm } from './portfolio-access-request-form'
import { PortfolioAccessStatus } from './portfolio-access-status'
import { Button } from '@/components/ui/button'
import { captureAnalyticsEvent } from '@/lib/analytics/client'

export function PortfolioAccessPage({
  signInOnly = false,
  signInFailed = false,
}: {
  signInOnly?: boolean
  signInFailed?: boolean
}) {
  const { session, loading } = useAuth()
  const router = useRouter()
  const { state, error, checking, refresh, submit } = usePortfolioRequest()
  const [login, setLogin] = useState(signInOnly)
  const [initialized, setInitialized] = useState(false)
  const [intent, setIntent] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [requestError, setRequestError] = useState(
    signInFailed ? 'Sign-in wasn’t completed. Your details are still here; please try again.' : '',
  )
  const started = useRef(false)
  const inFlight = useRef(false)

  useEffect(() => {
    const value = new URLSearchParams(window.location.hash.slice(1)).get('request')
    if (value) {
      setIntent(value)
      window.history.replaceState({}, '', '/access')
    }
    setInitialized(true)
  }, [])

  const sendIntent = useCallback(async () => {
    if (!intent || !session || inFlight.current) return
    inFlight.current = true
    setSending(true)
    setRequestError('')
    try {
      const result = await submit({ intent })
      // Keep Next's canonical URL in sync so a permission refresh cannot restore the intent.
      router.replace('/access', { scroll: false })
      setIntent(null)
      try {
        sessionStorage.removeItem('portfolio-request-details:v1')
      } catch {
        /* Optional browser draft. */
      }
      if (result.status === 'pending')
        captureAnalyticsEvent('portfolio_access_requested', { scope: 'portfolio' })
    } catch (failure) {
      setRequestError(
        failure instanceof Error ? failure.message : 'We could not send your request.',
      )
    } finally {
      inFlight.current = false
      setSending(false)
    }
  }, [intent, session, submit, router])

  useEffect(() => {
    if (!intent || !session || started.current) return
    started.current = true
    void sendIntent()
  }, [intent, session, sendIntent])

  const showForm = !state || state.status === 'none' || state.status === 'expired'
  const saving = sending || (intent && session && !started.current)
  return (
    <div className="mx-auto max-w-xl space-y-6 py-8 md:py-12">
      {requestError ? (
        <p role="alert" className="text-sm text-destructive">
          {requestError}
        </p>
      ) : null}
      {!initialized || loading || saving ? (
        <p role="status">{saving ? 'Sending your portfolio request…' : 'Checking your account…'}</p>
      ) : intent && requestError && session ? (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => void sendIntent()}>Try saving again</Button>
          <Button
            variant="outline"
            onClick={() => {
              setIntent(null)
              setRequestError('')
            }}
          >
            Start a new request
          </Button>
        </div>
      ) : !session ? (
        login ? (
          <div className="space-y-4">
            <LoginForm returnTo="/access" />
            <Button variant="link" className="w-full" onClick={() => setLogin(false)}>
              New here? Request portfolio access
            </Button>
          </div>
        ) : (
          <PortfolioAccessRequestForm onSignIn={() => setLogin(true)} />
        )
      ) : !state && !error ? (
        <p role="status">Checking your portfolio access…</p>
      ) : (
        <>
          {state && state.status !== 'none' ? (
            <PortfolioAccessStatus
              state={state}
              checking={checking}
              onRefresh={() => void refresh()}
            />
          ) : null}
          {showForm && !error ? (
            <PortfolioAccessRequestForm onSignIn={() => setLogin(true)} />
          ) : null}
        </>
      )}
      {error ? (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          <Button variant="outline" onClick={() => void refresh()} disabled={checking}>
            Try again
          </Button>
        </div>
      ) : null}
      <Button variant="link" asChild>
        <Link href="/work">Back to the portfolio</Link>
      </Button>
    </div>
  )
}
