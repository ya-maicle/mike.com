'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/login-form'
import { PortfolioRequestFields } from './portfolio-request-fields'
import { useAuth } from './providers/auth-provider'
import { usePortfolioRequest } from './providers/portfolio-request-provider'
import { accessRequestSchema, type AccessRequestDetails } from '@/lib/portfolio-request-model'
import { captureAnalyticsEvent } from '@/lib/analytics/client'

const DRAFT_KEY = 'portfolio-request-details:v1'
const emptyDetails: AccessRequestDetails = { company: '', role: '', reason: '' }

export function PortfolioAccessRequestForm({ onSignIn }: { onSignIn: () => void }) {
  const { session } = useAuth()
  const { submit } = usePortfolioRequest()
  const [details, setDetails] = useState(emptyDetails)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? 'null')
      const parsed = accessRequestSchema.safeParse(saved?.details)
      if (parsed.success && saved.expiresAt > Date.now()) setDetails(parsed.data)
    } catch {
      /* Optional browser draft. */
    }
  }, [])

  function change(value: AccessRequestDetails) {
    setDetails(value)
    setError('')
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ details: value, expiresAt: Date.now() + 30 * 60_000 }),
      )
    } catch {
      /* Authentication also carries the request. */
    }
  }

  function validated() {
    const parsed = accessRequestSchema.safeParse(details)
    if (!parsed.success)
      throw new Error('Please enter your company or affiliation. Role and note are optional.')
    return parsed.data
  }

  async function prepare(method: 'google' | 'magic_link', email?: string) {
    const response = await fetch('/api/portfolio-access/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...validated(),
        method,
        ...(method === 'magic_link' ? { email } : {}),
      }),
    })
    const result = await response.json()
    if (!response.ok)
      throw new Error(result.error || 'We could not prepare your request. Please try again.')
    return result.returnPath as string
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      const result = await submit(validated())
      try {
        sessionStorage.removeItem(DRAFT_KEY)
      } catch {
        /* Optional browser draft. */
      }
      if (result.status === 'pending')
        captureAnalyticsEvent('portfolio_access_requested', { scope: 'portfolio' })
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Please try again.')
    } finally {
      setPending(false)
    }
  }

  const fields = <PortfolioRequestFields value={details} onChange={change} disabled={pending} />
  if (!session)
    return (
      <div className="space-y-4">
        <LoginForm requestAccess beforeSignIn={prepare} requestFields={fields} />
        <p className="text-sm text-muted-foreground">
          Your account and affiliation are shared privately with Mike to review your request. Access
          is subject to approval.
        </p>
        <Button variant="link" className="w-full" onClick={onSignIn}>
          Already requested or approved? Sign in
        </Button>
      </div>
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={1}>
          Request portfolio access
        </CardTitle>
        <CardDescription>
          One request for the private portfolio. I’ll email you when I’ve reviewed it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={send} className="space-y-5" aria-busy={pending}>
          <p className="break-words text-sm text-muted-foreground">
            Requesting as {session.user.email}.
          </p>
          {fields}
          <p className="text-sm text-muted-foreground">
            These details are shared privately with Mike to review your request. Access is subject
            to approval.
          </p>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? 'Sending request…' : 'Send portfolio request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
