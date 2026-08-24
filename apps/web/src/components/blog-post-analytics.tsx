'use client'

import * as React from 'react'

import { useCookiePreferences } from '@/components/providers/cookie-preferences-provider'
import { captureAnalyticsEvent } from '@/lib/analytics/client'
import { meetsBlogPostEngagementThreshold } from '@/lib/analytics/events'

export function BlogPostAnalytics({ postSlug }: { postSlug: string }) {
  const { analyticsEnabled } = useCookiePreferences()
  const viewedSlugRef = React.useRef<string | null>(null)
  const engagedSlugRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    if (!analyticsEnabled || viewedSlugRef.current === postSlug) return
    viewedSlugRef.current = postSlug
    captureAnalyticsEvent('blog_post_viewed', { post_slug: postSlug })
  }, [analyticsEnabled, postSlug])

  React.useEffect(() => {
    if (!analyticsEnabled || engagedSlugRef.current === postSlug) return

    let visibleMilliseconds = 0
    let lastTick = performance.now()
    let reachedHalfway = false

    const checkEngagement = () => {
      if (document.visibilityState === 'visible') {
        const now = performance.now()
        visibleMilliseconds += now - lastTick
        lastTick = now
      }

      if (
        engagedSlugRef.current !== postSlug &&
        meetsBlogPostEngagementThreshold(visibleMilliseconds, reachedHalfway ? 0.5 : 0)
      ) {
        engagedSlugRef.current = postSlug
        captureAnalyticsEvent('blog_post_engaged', {
          post_slug: postSlug,
          engagement_basis: 'scroll_and_time',
        })
      }
    }

    const checkScroll = () => {
      const documentHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      )
      reachedHalfway = (window.scrollY + window.innerHeight) / Math.max(documentHeight, 1) >= 0.5
      checkEngagement()
    }

    const handleVisibilityChange = () => {
      lastTick = performance.now()
    }

    checkScroll()
    const interval = window.setInterval(checkEngagement, 1_000)
    window.addEventListener('scroll', checkScroll, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('scroll', checkScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [analyticsEnabled, postSlug])

  return null
}
