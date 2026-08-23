'use client'

import * as React from 'react'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/components/providers/auth-provider'
import { useCookiePreferences } from '@/components/providers/cookie-preferences-provider'
import { hasAnalyticsConsent } from '@/lib/cookie-preferences'
import {
  captureAnalyticsEvent,
  hasIdentifiedAnalyticsUser,
  identifyAnalyticsUser,
  initializePostHogAnalytics,
  resetAnalyticsIdentity,
} from '@/lib/analytics/client'
import { contextSlugForPath } from '@/lib/analytics/events'

function authProviderForUser(provider: unknown) {
  return provider === 'google' ? 'google' : 'magic_link'
}

function PostHogLifecycle({ analyticsEnabled }: { analyticsEnabled: boolean }) {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    if (!analyticsEnabled) {
      setReady(false)
      return
    }

    let mounted = true
    initializePostHogAnalytics().then((initialized) => {
      if (mounted) setReady(initialized)
    })
    return () => {
      mounted = false
    }
  }, [analyticsEnabled])

  React.useEffect(() => {
    if (!ready || !pathname) return
    captureAnalyticsEvent('$pageview', {})
  }, [pathname, ready])

  React.useEffect(() => {
    if (!ready || loading) return
    if (user) {
      identifyAnalyticsUser(user.id, {
        audience_type: 'authenticated_viewer',
        auth_provider: authProviderForUser(user.app_metadata?.provider),
      })
    } else if (hasIdentifiedAnalyticsUser()) {
      resetAnalyticsIdentity()
    }
  }, [loading, ready, user])

  React.useEffect(() => {
    if (!ready) return

    const handleClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest<HTMLAnchorElement>('a[href]')
      if (!anchor?.getAttribute('href')?.toLowerCase().startsWith('mailto:')) return

      const placement = anchor.dataset.analyticsContactPlacement
      captureAnalyticsEvent('contact_clicked', {
        channel: 'email',
        placement:
          placement === 'strength_cta' || placement === 'portable_text' ? placement : 'site',
        context_slug: contextSlugForPath(window.location.pathname),
      })
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [ready])

  return null
}

export function ConsentAwareAnalytics() {
  const { analyticsEnabled } = useCookiePreferences()

  return (
    <>
      <React.Suspense fallback={null}>
        <PostHogLifecycle analyticsEnabled={analyticsEnabled} />
      </React.Suspense>
      <Analytics beforeSend={(event) => (hasAnalyticsConsent() ? event : null)} />
      <SpeedInsights beforeSend={(event) => (hasAnalyticsConsent() ? event : null)} />
    </>
  )
}
