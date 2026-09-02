'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { capturePortfolioAccessStarted } from '@/lib/analytics/portfolio-access'
import {
  MAGIC_LINK_REQUEST_STORAGE_KEY,
  MAGIC_LINK_RESEND_DELAY_MS,
  MAGIC_LINK_REQUEST_TTL_MS,
  buildMagicLinkEmailRedirectUrl,
  createPendingMagicLinkRequest,
  parsePendingMagicLinkRequest,
  secondsUntilMagicLinkResend,
  type PendingMagicLinkRequest,
} from '@/lib/magic-link'
import { createSupabaseMagicLinkClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Icon } from '@/components/ui/icon'
import { Mail, Spinner } from '@/components/ui/icons'

const RESEND_TICK_MS = 1_000
const INITIAL_RESEND_SECONDS = Math.ceil(MAGIC_LINK_RESEND_DELAY_MS / RESEND_TICK_MS)
const MAGIC_LINK_EXPIRY_MINUTES = MAGIC_LINK_REQUEST_TTL_MS / 60_000

function readPendingRequest() {
  try {
    const storedRequest = sessionStorage.getItem(MAGIC_LINK_REQUEST_STORAGE_KEY)
    const request = parsePendingMagicLinkRequest(storedRequest)

    if (!request && storedRequest) {
      sessionStorage.removeItem(MAGIC_LINK_REQUEST_STORAGE_KEY)
    }

    return request
  } catch {
    return null
  }
}

function savePendingRequest(request: PendingMagicLinkRequest) {
  try {
    sessionStorage.setItem(MAGIC_LINK_REQUEST_STORAGE_KEY, JSON.stringify(request))
  } catch {
    // Storage is a convenience for this confirmation screen; resending still succeeded.
  }
}

function clearPendingRequest() {
  try {
    sessionStorage.removeItem(MAGIC_LINK_REQUEST_STORAGE_KEY)
  } catch {
    // Navigation back to sign-in must still work when browser storage is unavailable.
  }
}

export function MagicLinkSent() {
  const router = useRouter()
  const headingRef = React.useRef<HTMLDivElement>(null)
  const [request, setRequest] = React.useState<PendingMagicLinkRequest | null>(null)
  const [storageReady, setStorageReady] = React.useState(false)
  const [secondsRemaining, setSecondsRemaining] = React.useState(INITIAL_RESEND_SECONDS)
  const [pending, setPending] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null)

  React.useEffect(() => {
    const storedRequest = readPendingRequest()
    setRequest(storedRequest)
    setSecondsRemaining(storedRequest ? secondsUntilMagicLinkResend(storedRequest.retryAt) : 0)
    setStorageReady(true)
    headingRef.current?.focus()
  }, [])

  const retryAt = request?.retryAt

  React.useEffect(() => {
    if (!retryAt || secondsRemaining <= 0) return

    const timeout = window.setTimeout(() => {
      setSecondsRemaining(secondsUntilMagicLinkResend(retryAt))
    }, RESEND_TICK_MS)

    return () => window.clearTimeout(timeout)
  }, [retryAt, secondsRemaining])

  const email = request?.email.trim() ?? ''
  const canResend = storageReady && Boolean(request) && secondsRemaining <= 0 && !pending

  async function handleResend() {
    if (!request || !canResend) return

    setPending(true)
    setErrorMessage(null)
    setStatusMessage(null)

    try {
      const emailRedirectTo = buildMagicLinkEmailRedirectUrl(
        window.location.origin,
        request.returnPath,
      )
      const magicLinkClient = createSupabaseMagicLinkClient()
      let sendError: unknown = null

      try {
        const { error } = await magicLinkClient.auth.signInWithOtp({
          email: request.email,
          options: {
            emailRedirectTo,
            shouldCreateUser: true,
          },
        })
        sendError = error
      } finally {
        try {
          await magicLinkClient.auth.stopAutoRefresh()
        } catch {
          // Cleanup must not make a successfully sent email look like a failure.
        }
      }

      if (sendError) throw sendError

      const nextRequest = createPendingMagicLinkRequest(request.email, request.returnPath)
      savePendingRequest(nextRequest)
      setRequest(nextRequest)
      setSecondsRemaining(secondsUntilMagicLinkResend(nextRequest.retryAt))
      setStatusMessage('We sent a new sign-in link to your email.')

      await capturePortfolioAccessStarted('magic_link', request.returnPath).catch(() => {})
    } catch {
      setErrorMessage('We couldn’t resend the email. Please try again in a moment.')
    } finally {
      setPending(false)
    }
  }

  function handleUseAnotherMethod() {
    clearPendingRequest()
    router.replace('/login')
  }

  return (
    <Card
      className="w-full gap-5 border-0 bg-transparent py-0 shadow-none"
      aria-busy={!storageReady}
    >
      <CardHeader className="items-center gap-4 px-0 text-center">
        <div
          className="bg-secondary text-secondary-foreground flex size-12 items-center justify-center justify-self-center rounded-full"
          aria-hidden="true"
        >
          <Icon icon={Mail} size="md" />
        </div>
        <div className="space-y-3">
          <CardTitle
            ref={headingRef}
            role="heading"
            aria-level={1}
            tabIndex={-1}
            className="text-3xl leading-9 font-normal tracking-[-0.01em] outline-none"
          >
            Check your email
          </CardTitle>
          <CardDescription
            role={storageReady ? 'status' : undefined}
            aria-live={storageReady ? 'polite' : undefined}
            aria-atomic={storageReady ? 'true' : undefined}
            className="min-h-18 text-base leading-6 text-pretty sm:min-h-12"
          >
            {!storageReady ? (
              <span aria-hidden="true">&nbsp;</span>
            ) : email ? (
              <>
                We sent a sign-in link to{' '}
                <span className="text-foreground break-words font-medium [overflow-wrap:anywhere]">
                  {email}
                </span>
                .
              </>
            ) : (
              'We sent a sign-in link to your email address.'
            )}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 px-0">
        <div className="text-muted-foreground space-y-3 text-center text-sm leading-5 text-pretty">
          <p className="mb-0">
            Open the email link to continue. It works once and expires in{' '}
            {MAGIC_LINK_EXPIRY_MINUTES} minutes.
          </p>
          <p className="mb-0">Can’t find it? Check your spam or junk folder.</p>
        </div>

        <div className="grid gap-3">
          {!storageReady ? (
            <Button
              type="button"
              size="lg"
              className="h-13 w-full text-base font-medium"
              disabled
              aria-hidden="true"
              tabIndex={-1}
            >
              Preparing…
            </Button>
          ) : request ? (
            <Button
              type="button"
              size="lg"
              className="h-13 w-full text-base font-medium"
              onClick={handleResend}
              disabled={!canResend}
            >
              {pending ? (
                <>
                  <span className="flex animate-spin motion-reduce:animate-none">
                    <Icon icon={Spinner} size="sm" />
                  </span>
                  Sending…
                </>
              ) : secondsRemaining > 0 ? (
                `Resend in ${secondsRemaining}s`
              ) : (
                'Resend email'
              )}
            </Button>
          ) : null}

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="border-border bg-card h-13 w-full text-base font-medium shadow-none hover:bg-accent"
            onClick={handleUseAnotherMethod}
            disabled={!storageReady || pending}
          >
            Use another sign-in method
          </Button>
        </div>

        {statusMessage ? (
          <p
            role="status"
            aria-live="polite"
            className="text-muted-foreground mb-0 text-center text-sm"
          >
            {statusMessage}
          </p>
        ) : null}

        {errorMessage ? (
          <p
            role="alert"
            aria-live="assertive"
            className="text-destructive mb-0 text-center text-sm"
          >
            {errorMessage}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
