'use client'

import { hasAnalyticsConsent } from '@/lib/cookie-preferences'
import { captureAnalyticsEventBeforeNavigation, isDoNotTrackEnabled } from '@/lib/analytics/client'
import {
  PORTFOLIO_ACCESS_ANALYTICS_STORAGE_KEY,
  requestedStudySlugFromPath,
  type PortfolioAccessEntryPoint,
  type PortfolioAuthMethod,
} from '@/lib/analytics/events'

const ACCESS_CONTEXT_TTL_MS = 24 * 60 * 60 * 1000

export type PortfolioAccessAnalyticsContext = {
  version: 1
  createdAt: number
  entryPoint: PortfolioAccessEntryPoint
  authMethod?: PortfolioAuthMethod
  requestedStudySlug?: string
}

function parseContext(value: string | null): PortfolioAccessAnalyticsContext | null {
  if (!value) return null
  try {
    const context = JSON.parse(value) as Partial<PortfolioAccessAnalyticsContext>
    if (context.version !== 1 || typeof context.createdAt !== 'number') return null
    if (Date.now() - context.createdAt > ACCESS_CONTEXT_TTL_MS) return null
    if (
      !['header', 'work_card', 'case_study_gate', 'login_page'].includes(context.entryPoint ?? '')
    ) {
      return null
    }
    return context as PortfolioAccessAnalyticsContext
  } catch {
    return null
  }
}

export function rememberPortfolioAccessEntryPoint(
  entryPoint: PortfolioAccessEntryPoint,
  returnPath?: string,
) {
  if (!hasAnalyticsConsent() || isDoNotTrackEnabled()) return
  try {
    sessionStorage.setItem(
      PORTFOLIO_ACCESS_ANALYTICS_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        createdAt: Date.now(),
        entryPoint,
        requestedStudySlug: requestedStudySlugFromPath(returnPath),
      } satisfies PortfolioAccessAnalyticsContext),
    )
  } catch {
    // Attribution is optional; the authentication flow must continue.
  }
}

export async function capturePortfolioAccessStarted(
  authMethod: PortfolioAuthMethod,
  returnPath?: string,
) {
  if (!hasAnalyticsConsent() || isDoNotTrackEnabled()) return

  let remembered: PortfolioAccessAnalyticsContext | null = null
  try {
    remembered = parseContext(sessionStorage.getItem(PORTFOLIO_ACCESS_ANALYTICS_STORAGE_KEY))
  } catch {}

  const context: PortfolioAccessAnalyticsContext = {
    version: 1,
    createdAt: Date.now(),
    entryPoint: remembered?.entryPoint ?? 'login_page',
    authMethod,
    requestedStudySlug: remembered?.requestedStudySlug ?? requestedStudySlugFromPath(returnPath),
  }

  try {
    sessionStorage.setItem(PORTFOLIO_ACCESS_ANALYTICS_STORAGE_KEY, JSON.stringify(context))
  } catch {}

  await captureAnalyticsEventBeforeNavigation('portfolio_access_started', {
    auth_method: authMethod,
    entry_point: context.entryPoint,
    requested_study_slug: context.requestedStudySlug,
  })
}

export function consumePortfolioAccessContext() {
  let context: PortfolioAccessAnalyticsContext | null = null
  try {
    context = parseContext(sessionStorage.getItem(PORTFOLIO_ACCESS_ANALYTICS_STORAGE_KEY))
    sessionStorage.removeItem(PORTFOLIO_ACCESS_ANALYTICS_STORAGE_KEY)
  } catch {}
  return context
}
