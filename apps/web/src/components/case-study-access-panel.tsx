'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import * as Icons from '@/components/ui/icons'
import { useAuth } from '@/components/providers/auth-provider'
import { useLoginModal } from '@/components/providers/login-modal-provider'
import { PortfolioAccessRequestForm } from '@/components/portfolio-access-request-form'

type Props = { studySlug: string; visibility?: string; blocked?: boolean }

export function CaseStudyAccessPanel({ studySlug, visibility, blocked = false }: Props) {
  const { session, loading } = useAuth()
  const { openLogin } = useLoginModal()
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const token = session?.access_token
  const href = `/work/${studySlug}`
  const members = visibility === 'members'
  const checkStatus = useCallback(async () => {
    if (!token) return
    setChecking(true)
    setError('')
    try {
      const response = await fetch(
        `/api/portfolio-access/request?study=${encodeURIComponent(studySlug)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        },
      )
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Please try again.')
      setStatus(result.status)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setChecking(false)
    }
  }, [token, studySlug])

  useEffect(() => {
    setStatus('loading')
    setError('')
    if (token) void checkStatus()
  }, [token, checkStatus])

  const unavailable = blocked || status === 'blocked' || status === 'declined'
  const pending = status === 'pending'
  const available = status === 'available' || status === 'approved'
  const title = unavailable
    ? 'This case study isn’t available to this account'
    : available
      ? 'Your access is ready'
      : pending
        ? 'Your request is awaiting review'
        : members
          ? 'Sign in to read this case study'
          : 'Request access to this case study'
  const description = unavailable
    ? 'You can still explore the public case studies below.'
    : available
      ? 'You can now continue to the full case study.'
      : pending
        ? 'Your request has been saved. You can check its status here while you explore the public work.'
        : members
          ? 'A verified account gives you access to selected case studies. Some work requires separate approval.'
          : status === 'expired'
            ? 'Your previous access has ended. You can submit a new request for review.'
            : token
              ? 'You’re signed in. Tell me a little about your interest in this work so I can review your request.'
              : 'This work is shared with approved hiring teams and trusted reviewers. Sign in to request access or use an existing approval.'

  return (
    <div className="mx-auto flex w-full max-w-[480px] flex-col items-center gap-6 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Icon icon={Icons.Lock} size="md" />
      </div>
      <div className="space-y-3" aria-live="polite">
        <h2 className="m-0 text-3xl font-normal">{title}</h2>
        <p className="m-0 text-base text-muted-foreground">{description}</p>
      </div>
      {!unavailable && (loading || (token && status === 'loading' && !error)) ? (
        <p role="status">Checking your access…</p>
      ) : null}
      {!loading && !token && !unavailable ? (
        <div className="flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={() => openLogin({ returnTo: href, entryPoint: 'case_study_gate' })}
          >
            {members ? 'Sign in to read' : 'Request access'}
          </Button>
          {!members ? (
            <Button
              variant="link"
              onClick={() => openLogin({ returnTo: href, entryPoint: 'case_study_gate' })}
            >
              Already approved? Sign in
            </Button>
          ) : null}
        </div>
      ) : null}
      {token && !unavailable && available ? (
        <Button size="lg" onClick={() => window.location.replace(href)}>
          Read case study
        </Button>
      ) : null}
      {token && !unavailable && (status === 'none' || status === 'expired') && !members ? (
        requesting ? (
          <PortfolioAccessRequestForm
            studySlug={studySlug}
            email={session?.user.email}
            token={token}
            onStatus={setStatus}
          />
        ) : (
          <Button size="lg" onClick={() => setRequesting(true)}>
            Request access
          </Button>
        )
      ) : null}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {token && !unavailable && (pending || error) ? (
        <Button variant="outline" onClick={checkStatus} disabled={checking}>
          {checking ? 'Checking…' : 'Check request status'}
        </Button>
      ) : null}
      <Button variant="link" asChild>
        <Link href="/work?view=public">Explore public case studies</Link>
      </Button>
    </div>
  )
}
