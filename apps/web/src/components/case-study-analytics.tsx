'use client'

import * as React from 'react'
import { useCookiePreferences } from '@/components/providers/cookie-preferences-provider'
import { captureAnalyticsEvent } from '@/lib/analytics/client'
import type {
  CaseStudyEventProperties,
  StudyAccessSource,
  StudyViewState,
  StudyVisibility,
} from '@/lib/analytics/events'
import { meetsCaseStudyEngagementThreshold } from '@/lib/analytics/events'

type VideoMilestone = 'started' | '25' | '50' | 'completed'

type CaseStudyAnalyticsContextValue = {
  trackVideoProgress: (contentId: string, milestone: VideoMilestone) => void
}

const CaseStudyAnalyticsContext = React.createContext<CaseStudyAnalyticsContextValue | null>(null)

type CaseStudyAnalyticsProps = {
  children: React.ReactNode
  studySlug: string
  studyVisibility: StudyVisibility
  viewState: StudyViewState
  accessSource: StudyAccessSource
  companySlug?: string
}

export function CaseStudyAnalytics({
  children,
  studySlug,
  studyVisibility,
  viewState,
  accessSource,
  companySlug,
}: CaseStudyAnalyticsProps) {
  const { analyticsEnabled } = useCookiePreferences()
  const viewedRef = React.useRef(false)
  const engagedRef = React.useRef(false)

  const eventProperties = React.useMemo<CaseStudyEventProperties>(
    () => ({
      study_slug: studySlug,
      study_visibility: studyVisibility,
      view_state: viewState,
      access_source: accessSource,
      ...(companySlug ? { company_slug: companySlug } : {}),
    }),
    [accessSource, companySlug, studySlug, studyVisibility, viewState],
  )

  React.useEffect(() => {
    viewedRef.current = false
    engagedRef.current = false
  }, [studySlug, viewState])

  React.useEffect(() => {
    if (!analyticsEnabled || viewedRef.current) return
    viewedRef.current = true
    captureAnalyticsEvent('case_study_viewed', eventProperties)
  }, [analyticsEnabled, eventProperties])

  const markEngaged = React.useCallback(
    (basis: 'scroll_and_time' | 'video_25') => {
      if (!analyticsEnabled || viewState !== 'unlocked' || engagedRef.current) return
      engagedRef.current = true
      captureAnalyticsEvent('case_study_engaged', {
        ...eventProperties,
        engagement_basis: basis,
      })
    },
    [analyticsEnabled, eventProperties, viewState],
  )

  React.useEffect(() => {
    if (!analyticsEnabled || viewState !== 'unlocked') return

    let visibleMilliseconds = 0
    let lastTick = performance.now()
    let reachedHalfway = false

    const checkEngagement = () => {
      if (document.visibilityState === 'visible') {
        const now = performance.now()
        visibleMilliseconds += now - lastTick
        lastTick = now
      }
      if (meetsCaseStudyEngagementThreshold(visibleMilliseconds, reachedHalfway ? 0.5 : 0)) {
        markEngaged('scroll_and_time')
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
  }, [analyticsEnabled, markEngaged, viewState])

  const trackVideoProgress = React.useCallback(
    (contentId: string, milestone: VideoMilestone) => {
      if (!analyticsEnabled || viewState !== 'unlocked') return
      captureAnalyticsEvent('content_video_progressed', {
        ...eventProperties,
        content_id: contentId,
        milestone,
      })
      if (milestone === '25') markEngaged('video_25')
    },
    [analyticsEnabled, eventProperties, markEngaged, viewState],
  )

  const contextValue = React.useMemo(() => ({ trackVideoProgress }), [trackVideoProgress])

  return (
    <CaseStudyAnalyticsContext.Provider value={contextValue}>
      {children}
    </CaseStudyAnalyticsContext.Provider>
  )
}

export function useCaseStudyAnalytics() {
  return React.useContext(CaseStudyAnalyticsContext)
}
