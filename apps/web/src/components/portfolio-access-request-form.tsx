'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { captureAnalyticsEvent } from '@/lib/analytics/client'

type Props = {
  studySlug: string
  email?: string
  token: string
  onStatus: (status: string) => void
}

export function PortfolioAccessRequestForm({ studySlug, email, token, onStatus }: Props) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/portfolio-access/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          studySlug,
          company: form.get('company'),
          role: form.get('role'),
          reason: form.get('reason'),
        }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'We could not save your request.')
      onStatus(result.status)
      if (result.status === 'pending')
        captureAnalyticsEvent('portfolio_access_requested', { study_slug: studySlug })
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setPending(false)
    }
  }
  return (
    <form onSubmit={submit} className="w-full space-y-5 text-left" aria-busy={pending}>
      <p className="text-sm text-muted-foreground">
        Requesting access as <span className="break-all text-foreground">{email}</span>.
      </p>
      <div className="space-y-2">
        <Label htmlFor="access-company">Company or organisation</Label>
        <Input
          id="access-company"
          name="company"
          autoComplete="organization"
          required
          minLength={2}
          maxLength={120}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="access-role">Your role</Label>
        <Input
          id="access-role"
          name="role"
          autoComplete="organization-title"
          required
          minLength={2}
          maxLength={120}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="access-reason">What would you like to explore?</Label>
        <Textarea
          id="access-reason"
          name="reason"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          placeholder="A little context about your interest in this work."
        />
      </div>
      <p className="text-sm text-muted-foreground">
        These details are shared privately with Mike to review your request. Access is subject to
        approval.
      </p>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        {pending ? 'Sending request…' : 'Send access request'}
      </Button>
    </form>
  )
}
