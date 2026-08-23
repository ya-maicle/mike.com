'use client'

import type { CaptureResult, PostHog } from 'posthog-js'
import { hasAnalyticsConsent } from '@/lib/cookie-preferences'
import {
  ANALYTICS_SCHEMA_VERSION,
  PORTFOLIO_ACCESS_ANALYTICS_STORAGE_KEY,
  pageTypeForPath,
  type AnalyticsEnvironment,
  type AnalyticsEventMap,
  type AnalyticsEventName,
} from '@/lib/analytics/events'
import { sanitizePostHogEvent } from '@/lib/analytics/privacy'

const POSTHOG_HOST = 'https://eu.i.posthog.com'
const POSTHOG_UI_HOST = 'https://eu.posthog.com'
const POSTHOG_STORAGE_KEY = /^ph_.*_posthog(?:_.*)?$/
const POSTHOG_CONSENT_STORAGE_KEY = /^__ph_opt_in_out_/
const MAX_QUEUED_EVENTS = 50

type QueuedEvent = {
  event: AnalyticsEventName
  properties: AnalyticsEventMap[AnalyticsEventName]
}

let instance: PostHog | null = null
let initializePromise: Promise<boolean> | null = null
let pendingIdentity: { id: string; properties: Record<string, string> } | null = null
let identifiedId: string | null = null
const queuedEvents: QueuedEvent[] = []

function analyticsEnvironment(): AnalyticsEnvironment {
  return process.env.NEXT_PUBLIC_POSTHOG_ENV === 'production' ? 'production' : 'preview'
}

function analyticsConfigured() {
  const enabled = ['1', 'true'].includes(
    (process.env.NEXT_PUBLIC_POSTHOG_ENABLED ?? '').trim().toLowerCase(),
  )
  const configuredHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() || POSTHOG_HOST
  return (
    enabled &&
    configuredHost === POSTHOG_HOST &&
    Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim())
  )
}

export function isDoNotTrackEnabled() {
  if (typeof navigator === 'undefined') return false
  return (
    navigator.doNotTrack === '1' ||
    (navigator as Navigator & { msDoNotTrack?: string }).msDoNotTrack === '1' ||
    (typeof window !== 'undefined' &&
      (window as Window & { doNotTrack?: string }).doNotTrack === '1')
  )
}

function canCapture() {
  return analyticsConfigured() && hasAnalyticsConsent() && !isDoNotTrackEnabled()
}

function commonProperties() {
  const pathname = window.location.pathname
  return {
    schema_version: ANALYTICS_SCHEMA_VERSION,
    app_environment: analyticsEnvironment(),
    page_type: pageTypeForPath(pathname),
    pathname,
  }
}

function sendQueuedEvent(queued: QueuedEvent) {
  instance?.capture(queued.event, { ...commonProperties(), ...queued.properties })
}

export function captureAnalyticsEvent<Name extends AnalyticsEventName>(
  event: Name,
  properties: AnalyticsEventMap[Name],
) {
  if (typeof window === 'undefined' || !canCapture()) return

  if (instance?.is_capturing()) {
    instance.capture(event, { ...commonProperties(), ...properties })
    return
  }

  if (queuedEvents.length >= MAX_QUEUED_EVENTS) queuedEvents.shift()
  queuedEvents.push({ event, properties } as QueuedEvent)
}

export async function captureAnalyticsEventBeforeNavigation<Name extends AnalyticsEventName>(
  event: Name,
  properties: AnalyticsEventMap[Name],
) {
  if (typeof window === 'undefined' || !canCapture()) return

  const ready = instance?.is_capturing() || (await initializePostHogAnalytics())
  if (!ready || !instance?.is_capturing()) return

  instance.capture(
    event,
    { ...commonProperties(), ...properties },
    {
      send_instantly: true,
      transport: 'sendBeacon',
    },
  )
}

export async function initializePostHogAnalytics() {
  if (instance?.is_capturing()) return true
  if (!canCapture()) return false
  if (initializePromise) return initializePromise

  initializePromise = import('posthog-js')
    .then(({ default: posthog }) => {
      if (!canCapture()) return false

      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!.trim(), {
        api_host: POSTHOG_HOST,
        ui_host: POSTHOG_UI_HOST,
        defaults: '2026-05-30',
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        person_profiles: 'identified_only',
        disable_session_recording: true,
        advanced_disable_flags: true,
        opt_out_capturing_by_default: true,
        opt_out_persistence_by_default: true,
        persistence: 'localStorage+cookie',
        respect_dnt: true,
        before_send: (event) => {
          if (!event || !hasAnalyticsConsent() || isDoNotTrackEnabled()) return null
          return sanitizePostHogEvent(event) as CaptureResult
        },
      })
      posthog.opt_in_capturing({ captureEventName: false })
      instance = posthog

      if (pendingIdentity) {
        posthog.identify(pendingIdentity.id, pendingIdentity.properties)
        identifiedId = pendingIdentity.id
        pendingIdentity = null
      }

      queuedEvents.splice(0).forEach(sendQueuedEvent)
      return true
    })
    .catch((error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[Analytics] PostHog initialization failed:', error)
      }
      return false
    })
    .finally(() => {
      initializePromise = null
    })

  return initializePromise
}

export function identifyAnalyticsUser(id: string, properties: Record<string, string>) {
  if (!id || typeof window === 'undefined' || !canCapture()) return
  if (!instance?.is_capturing()) {
    pendingIdentity = { id, properties }
    return
  }
  instance.identify(id, properties)
  identifiedId = id
}

export function resetAnalyticsIdentity() {
  pendingIdentity = null
  identifiedId = null
  if (!instance) return

  instance.reset()
  if (canCapture()) {
    instance.opt_in_capturing({ captureEventName: false })
  }
}

export function clearPostHogPersistence() {
  queuedEvents.splice(0)
  pendingIdentity = null
  identifiedId = null

  try {
    instance?.opt_out_capturing()
    instance?.reset(true)
  } catch {
    // Manual cleanup below remains the fail-closed fallback.
  }
  instance = null

  if (typeof window === 'undefined') return

  for (const storage of [window.localStorage, window.sessionStorage]) {
    try {
      const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
        (key): key is string => Boolean(key),
      )
      keys
        .filter((key) => POSTHOG_STORAGE_KEY.test(key) || POSTHOG_CONSENT_STORAGE_KEY.test(key))
        .forEach((key) => storage.removeItem(key))
      storage.removeItem(PORTFOLIO_ACCESS_ANALYTICS_STORAGE_KEY)
    } catch {
      // Inaccessible optional storage is already a disabled state.
    }
  }

  try {
    const hostname = window.location.hostname
    document.cookie.split(';').forEach((entry) => {
      const name = decodeURIComponent(entry.split('=', 1)[0]?.trim() ?? '')
      if (!POSTHOG_STORAGE_KEY.test(name) && !POSTHOG_CONSENT_STORAGE_KEY.test(name)) return
      const encoded = encodeURIComponent(name)
      document.cookie = `${encoded}=; Max-Age=0; Path=/; SameSite=Lax`
      document.cookie = `${encoded}=; Max-Age=0; Path=/; Domain=${hostname}; SameSite=Lax`
      document.cookie = `${encoded}=; Max-Age=0; Path=/; Domain=.${hostname}; SameSite=Lax`
    })
  } catch {
    // Inaccessible optional cookies are already a disabled state.
  }
}

export function hasIdentifiedAnalyticsUser() {
  return identifiedId !== null
}
