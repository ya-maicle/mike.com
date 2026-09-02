'use client'

import Link from 'next/link'
import * as React from 'react'

import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { AlertCircle, CheckCircle, Shield, Spinner } from '@/components/ui/icons'
import { SITE_CONFIG } from '@/lib/constants'
import {
  getCleanMagicLinkUrl,
  parseMagicLinkEntry,
  type MagicLinkCredential,
} from '@/lib/magic-link'

type ConfirmationState =
  | 'loading'
  | 'ready'
  | 'verifying'
  | 'switch'
  | 'discarding'
  | 'success'
  | 'error'
type AccountSwitchDetails = {
  currentEmail: string | null
  candidateEmail: string | null
}

const SITE_HOSTNAME = new URL(SITE_CONFIG.url).hostname.replace(/^www\./, '')
const SLOW_COMPLETION_DELAY_MS = 8_000
const SUCCESS_FALLBACK_DELAY_MS = 8_000

function rememberReturnPath(returnPath: string | null) {
  if (!returnPath) return
  try {
    localStorage.setItem('auth-return-url', returnPath)
  } catch {
    // Falling back to the home page is safe when browser storage is unavailable.
  }
}

export function MagicLinkConfirmation() {
  const { completeMagicLink, confirmMagicLinkSwitch, cancelMagicLinkSwitch } = useAuth()
  const headingRef = React.useRef<HTMLDivElement>(null)
  const credentialRef = React.useRef<MagicLinkCredential | null>(null)
  const initializedRef = React.useRef(false)
  const autoExchangeStartedRef = React.useRef(false)
  const verificationInFlightRef = React.useRef(false)
  const switchDecisionInFlightRef = React.useRef(false)
  const [state, setState] = React.useState<ConfirmationState>('loading')
  const [switchDetails, setSwitchDetails] = React.useState<AccountSwitchDetails | null>(null)
  const [takingLonger, setTakingLonger] = React.useState(false)
  const [showSuccessFallback, setShowSuccessFallback] = React.useState(false)

  const finishSignIn = React.useCallback(
    async (credential: MagicLinkCredential) => {
      if (verificationInFlightRef.current) return
      verificationInFlightRef.current = true
      setTakingLonger(false)
      setState(credential.kind === 'token_hash' ? 'verifying' : 'loading')

      try {
        const result = await completeMagicLink(credential)
        credentialRef.current = null
        if (result.status === 'switch_required') {
          setSwitchDetails({
            currentEmail: result.currentEmail,
            candidateEmail: result.candidateEmail,
          })
          setState('switch')
          return
        }

        setState(result.status === 'complete' ? 'success' : 'error')
      } catch {
        credentialRef.current = null
        setState('error')
      } finally {
        verificationInFlightRef.current = false
      }
    },
    [completeMagicLink],
  )

  React.useEffect(() => {
    function processMagicLinkLocation() {
      const entry = parseMagicLinkEntry(window.location.href)
      rememberReturnPath(entry.returnPath)
      const cleanUrl = getCleanMagicLinkUrl(window.location.href)
      window.history.replaceState({}, '', cleanUrl.toString())

      credentialRef.current = null
      autoExchangeStartedRef.current = false
      if (entry.status === 'error') {
        setState('error')
        return
      }

      credentialRef.current = entry.credential
      setState(entry.status === 'ready' ? 'ready' : 'loading')
    }

    if (!initializedRef.current) {
      initializedRef.current = true
      processMagicLinkLocation()
    }

    function handleHashChange() {
      if (!window.location.hash) return
      processMagicLinkLocation()
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  React.useEffect(() => {
    const credential = credentialRef.current
    if (
      state !== 'loading' ||
      !credential ||
      credential.kind === 'token_hash' ||
      autoExchangeStartedRef.current
    ) {
      return
    }

    autoExchangeStartedRef.current = true
    void finishSignIn(credential)
  }, [finishSignIn, state])

  React.useEffect(() => {
    headingRef.current?.focus()
  }, [state])

  React.useEffect(() => {
    if (state !== 'loading' && state !== 'verifying') return

    const timeout = window.setTimeout(() => {
      setTakingLonger(true)
    }, SLOW_COMPLETION_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [state])

  React.useEffect(() => {
    if (state !== 'success') return

    const timeout = window.setTimeout(() => {
      setShowSuccessFallback(true)
    }, SUCCESS_FALLBACK_DELAY_MS)

    return () => window.clearTimeout(timeout)
  }, [state])

  function confirmSignIn() {
    const credential = credentialRef.current
    if (!credential || credential.kind !== 'token_hash') {
      setState('error')
      return
    }
    void finishSignIn(credential)
  }

  async function confirmAccountSwitch() {
    if (switchDecisionInFlightRef.current) return
    switchDecisionInFlightRef.current = true
    setState('verifying')
    try {
      const result = await confirmMagicLinkSwitch()
      setState(result.status === 'complete' ? 'success' : 'error')
    } catch {
      setState('error')
    } finally {
      switchDecisionInFlightRef.current = false
    }
  }

  async function keepCurrentAccount() {
    if (switchDecisionInFlightRef.current) return
    switchDecisionInFlightRef.current = true
    setState('discarding')
    try {
      await cancelMagicLinkSwitch()
      window.location.replace('/')
    } catch {
      setState('error')
      switchDecisionInFlightRef.current = false
    }
  }

  const isError = state === 'error'
  const isWorking =
    state === 'loading' || state === 'verifying' || state === 'discarding' || state === 'success'

  return (
    <Card className="w-full gap-6 border-0 bg-transparent py-0 text-center shadow-none">
      <CardHeader className="items-center gap-4 px-0">
        <span
          aria-hidden="true"
          className="bg-secondary text-secondary-foreground flex size-14 items-center justify-center justify-self-center rounded-full"
        >
          <span
            className={
              state === 'loading' || state === 'verifying' || state === 'discarding'
                ? 'flex animate-spin motion-reduce:animate-none'
                : 'flex'
            }
          >
            <Icon
              icon={
                isError
                  ? AlertCircle
                  : state === 'success'
                    ? CheckCircle
                    : isWorking
                      ? Spinner
                      : Shield
              }
              size="lg"
            />
          </span>
        </span>
        <div className="grid gap-2">
          <CardTitle
            ref={headingRef}
            tabIndex={-1}
            role="heading"
            aria-level={1}
            className="text-3xl leading-9 font-normal tracking-[-0.01em] outline-none"
          >
            {isError
              ? 'This sign-in didn’t work'
              : state === 'success'
                ? 'You’re signed in'
                : state === 'discarding'
                  ? 'Keeping your account'
                  : state === 'switch'
                    ? 'Switch accounts?'
                    : state === 'ready'
                      ? 'Finish signing in'
                      : 'Checking your link'}
          </CardTitle>
          <CardDescription className="min-h-18 text-base leading-6 text-pretty sm:min-h-12">
            {isError ? (
              'The request may have expired, already been used, or opened in the wrong browser. Start again to try another sign-in method.'
            ) : state === 'success' ? (
              'Your session is ready. We’re taking you back to the site.'
            ) : state === 'discarding' ? (
              'We’re safely discarding the unused link session before returning you to the site.'
            ) : state === 'switch' ? (
              <>
                This browser is already signed in
                {switchDetails?.currentEmail ? (
                  <>
                    {' as '}
                    <span className="text-foreground break-words font-medium [overflow-wrap:anywhere]">
                      {switchDetails.currentEmail}
                    </span>
                  </>
                ) : null}
                . This link is for
                {switchDetails?.candidateEmail ? (
                  <>
                    {' '}
                    <span className="text-foreground break-words font-medium [overflow-wrap:anywhere]">
                      {switchDetails.candidateEmail}
                    </span>
                  </>
                ) : (
                  ' another account'
                )}
                . Choose whether to switch.
              </>
            ) : state === 'ready' ? (
              'Continue to securely use this one-time link. This extra step prevents email scanners from using it before you do.'
            ) : takingLonger ? (
              'This is taking longer than usual. Keep this page open while we finish signing you in.'
            ) : (
              'Please wait while we prepare secure sign-in.'
            )}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="grid min-h-13 gap-3 px-0" aria-live="polite">
        {state === 'ready' ? (
          <Button
            type="button"
            size="lg"
            className="h-13 w-full text-base font-medium"
            onClick={confirmSignIn}
          >
            Continue to {SITE_HOSTNAME}
          </Button>
        ) : null}

        {state === 'switch' ? (
          <>
            <Button
              type="button"
              size="lg"
              className="h-13 w-full text-base font-medium"
              onClick={() => void confirmAccountSwitch()}
            >
              Switch to this account
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="border-border bg-card h-13 w-full text-base font-medium shadow-none hover:bg-accent"
              onClick={() => void keepCurrentAccount()}
            >
              Keep current account
            </Button>
          </>
        ) : null}

        {state === 'verifying' || state === 'discarding' || state === 'success' ? (
          <Button type="button" size="lg" className="h-13 w-full text-base font-medium" disabled>
            {state === 'verifying'
              ? 'Signing you in…'
              : state === 'discarding'
                ? 'Keeping current account…'
                : 'Redirecting…'}
          </Button>
        ) : null}

        {state === 'success' && showSuccessFallback ? (
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-border bg-card h-13 w-full text-base font-medium shadow-none hover:bg-accent"
          >
            <Link href="/">Continue to {SITE_HOSTNAME}</Link>
          </Button>
        ) : null}

        {isError ? (
          <>
            <Button asChild size="lg" className="h-13 w-full text-base font-medium">
              <Link href="/login">Request a new link</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="h-11 w-full">
              <Link href="/">Return home</Link>
            </Button>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
