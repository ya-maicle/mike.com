'use client'

import Link from 'next/link'
import { useAuth } from './providers/auth-provider'
import { usePortfolioRequest } from './providers/portfolio-request-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function PortfolioAccessSummary() {
  const { loading, session } = useAuth()
  const { state, error } = usePortfolioRequest()
  const status = state?.status
  const description =
    status === 'pending'
      ? 'Your portfolio request is awaiting review. I’ll email you when it’s reviewed.'
      : status === 'approved'
        ? 'Your portfolio access is approved. See the case studies shared with your account.'
        : status === 'expired'
          ? 'Your portfolio access has expired. You can request a renewal.'
          : status && ['blocked', 'declined', 'revoked'].includes(status)
            ? 'Private access isn’t available to this account. You can still explore the public work.'
            : 'Some work is private. Send one portfolio request with Google or email; I’ll email you when it’s reviewed.'
  if (loading || (session && !state && !error)) return null
  return (
    <Card className="mb-8">
      <CardContent className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="m-0 max-w-prose text-sm text-muted-foreground" aria-live="polite">
          {error
            ? 'Your access status is temporarily unavailable. Check your portfolio access to try again.'
            : description}
        </p>
        <Button asChild variant="secondary" className="shrink-0">
          <Link href="/access">
            {(status && status !== 'none') || error
              ? 'View portfolio access'
              : 'Request portfolio access'}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
