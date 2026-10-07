import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { PortfolioRequestState } from '@/lib/portfolio-request-model'

const titles = {
  none: 'Request portfolio access',
  pending: 'Your request is awaiting review',
  approved: 'Your portfolio access is approved',
  declined: 'Private access isn’t available at this time',
  blocked: 'Private access isn’t available to this account',
  expired: 'Your portfolio access has expired',
  revoked: 'Your private portfolio access has ended',
}

export function PortfolioAccessStatus({
  state,
  checking,
  onRefresh,
}: {
  state: PortfolioRequestState
  checking?: boolean
  onRefresh?: () => void
}) {
  const approved = state.status === 'approved'
  const pending = state.status === 'pending'
  return (
    <Card>
      <CardHeader className="gap-3" aria-live="polite" aria-atomic="true">
        <Badge variant={approved ? 'success' : 'secondary'}>
          {approved ? 'Approved' : pending ? 'Awaiting review' : 'Portfolio access'}
        </Badge>
        <CardTitle role="heading" aria-level={1}>
          {titles[state.status]}
        </CardTitle>
        <CardDescription className="break-words text-base">
          {approved
            ? 'You can now explore the case studies shared with your account.'
            : pending
              ? `Your request is saved. I’ll email ${state.email} when I’ve reviewed it. You don’t need to request again for another project.`
              : state.status === 'expired'
                ? 'You can request a renewal. Your previous access stays closed until it is approved.'
                : 'You can continue exploring the public work.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="break-words text-sm text-muted-foreground">Account: {state.email}</p>
        {approved && state.expiresAt ? (
          <p className="text-sm">
            Access until{' '}
            {new Date(state.expiresAt).toLocaleDateString('en-GB', {
              timeZone: 'UTC',
              dateStyle: 'long',
            })}
            .
          </p>
        ) : null}
        {state.studies.length ? (
          <div className="space-y-2">
            <p className="text-sm font-medium">Available to you</p>
            <ul className="space-y-2">
              {state.studies.map((study) => (
                <li key={study.slug}>
                  <Button
                    variant="link"
                    asChild
                    className="h-auto justify-start whitespace-normal p-0 text-left"
                  >
                    <Link href={`/work/${encodeURIComponent(study.slug)}`}>{study.title}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={approved ? '/work' : '/work?view=public'}>
              {approved ? 'View portfolio' : 'Explore public case studies'}
            </Link>
          </Button>
          {onRefresh ? (
            <Button variant="outline" onClick={onRefresh} disabled={checking}>
              {checking ? 'Checking…' : 'Refresh status'}
            </Button>
          ) : null}
        </div>
        {pending ? (
          <p className="text-sm text-muted-foreground">
            This page updates automatically when your access changes.
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
