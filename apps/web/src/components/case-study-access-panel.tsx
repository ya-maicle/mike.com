'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import { Lock } from '@/components/ui/icons'
import { useAuth } from '@/components/providers/auth-provider'
import { useLoginModal } from '@/components/providers/login-modal-provider'
import { usePortfolioRequest } from '@/components/providers/portfolio-request-provider'

type Props = { studySlug: string; visibility?: string; blocked?: boolean }

export function CaseStudyAccessPanel({ studySlug, visibility, blocked = false }: Props) {
  const { session, loading } = useAuth()
  const { openLogin } = useLoginModal()
  const { state, error, checking, refresh } = usePortfolioRequest()
  const members = visibility === 'members'
  const unavailable = blocked || ['blocked', 'declined', 'revoked'].includes(state?.status ?? '')
  const pending = state?.status === 'pending'
  const approved = state?.status === 'approved'
  const available = state?.studies.some((study) => study.slug === studySlug)
  const waiting = loading || (session && !state && !error)
  const title = unavailable
    ? 'This case study isn’t available to this account'
    : pending
      ? 'Your portfolio request is awaiting review'
      : approved
        ? available
          ? 'Your access is ready'
          : 'This case study is shared separately'
        : members
          ? 'Sign in to read this case study'
          : 'Explore more of the portfolio'
  const description = unavailable
    ? 'You can still explore the public case studies.'
    : pending
      ? `I’ll email ${state.email} when I’ve reviewed it. Your existing request covers the portfolio; no extra request is needed.`
      : approved
        ? available
          ? 'Continue to the full case study.'
          : 'Your portfolio access is active. Visit your access page to see the work shared with you.'
        : members
          ? 'A verified account gives you access to selected case studies. Private work requires approval.'
          : 'Send one request for the private portfolio. Add your affiliation and continue with Google or email; I’ll email you when it’s reviewed.'

  return (
    <div
      id="request-access"
      className="mx-auto flex w-full max-w-lg scroll-mt-24 flex-col items-center gap-6 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
        <Icon icon={Lock} size="md" />
      </div>
      <div className="space-y-3" aria-live="polite">
        <h2 className="m-0 text-3xl font-normal">{title}</h2>
        <p className="m-0 break-words text-base text-muted-foreground">{description}</p>
      </div>
      {waiting ? (
        <p role="status">Checking your access…</p>
      ) : error ? (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
          <Button variant="outline" disabled={checking} onClick={() => void refresh()}>
            Try again
          </Button>
        </div>
      ) : !unavailable ? (
        <div className="flex flex-col items-center gap-3">
          {members && !session ? (
            <Button
              size="lg"
              onClick={() =>
                openLogin({ returnTo: `/work/${studySlug}`, entryPoint: 'case_study_gate' })
              }
            >
              Sign in to read
            </Button>
          ) : available ? (
            <Button size="lg" onClick={() => window.location.reload()}>
              Read case study
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href="/access">
                {pending || approved ? 'View portfolio access' : 'Request portfolio access'}
              </Link>
            </Button>
          )}
          {!session && !members ? (
            <Button variant="link" asChild>
              <Link href="/access?signin=1">Already requested or approved? Sign in</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
      <Button variant="link" asChild>
        <Link href="/work?view=public">Explore public case studies</Link>
      </Button>
    </div>
  )
}
