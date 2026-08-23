export const ANALYTICS_SCHEMA_VERSION = 1
export const PORTFOLIO_ACCESS_ANALYTICS_STORAGE_KEY = 'maicle.analytics.portfolio-access.v1'

export type AnalyticsEnvironment = 'preview' | 'production'
export type PageType =
  | 'home'
  | 'work_index'
  | 'case_study'
  | 'strengths_index'
  | 'strength_detail'
  | 'bio'
  | 'login'
  | 'legal'
  | 'other'

export type StudyVisibility = 'public' | 'recruiter'
export type StudyViewState = 'locked' | 'unlocked'
export type StudyAccessSource = 'none' | 'link' | 'login'
export type PortfolioAuthMethod = 'google' | 'magic_link'
export type PortfolioAccessEntryPoint = 'header' | 'work_card' | 'case_study_gate' | 'login_page'

export type CaseStudyEventProperties = {
  study_slug: string
  study_visibility: StudyVisibility
  view_state: StudyViewState
  access_source: StudyAccessSource
  company_slug?: string
}

export type AnalyticsEventMap = {
  $pageview: Record<string, never>
  case_study_viewed: CaseStudyEventProperties
  case_study_engaged: CaseStudyEventProperties & {
    engagement_basis: 'scroll_and_time' | 'video_25'
  }
  portfolio_access_started: {
    auth_method: PortfolioAuthMethod
    entry_point: PortfolioAccessEntryPoint
    requested_study_slug?: string
  }
  portfolio_access_completed: {
    outcome: 'granted' | 'denied' | 'blocked'
    auth_method: PortfolioAuthMethod
    entry_point: PortfolioAccessEntryPoint
    requested_study_slug?: string
    company_slug?: string
  }
  content_video_progressed: CaseStudyEventProperties & {
    content_id: string
    milestone: 'started' | '25' | '50' | 'completed'
  }
  contact_clicked: {
    channel: 'email'
    placement: 'strength_cta' | 'portable_text' | 'site'
    context_slug?: string
  }
}

export type AnalyticsEventName = keyof AnalyticsEventMap

export function pageTypeForPath(pathname: string): PageType {
  if (pathname === '/') return 'home'
  if (pathname === '/work') return 'work_index'
  if (/^\/work\/[^/]+\/?$/.test(pathname)) return 'case_study'
  if (pathname === '/strengths') return 'strengths_index'
  if (/^\/strengths\/[^/]+\/?$/.test(pathname)) return 'strength_detail'
  if (pathname === '/bio') return 'bio'
  if (pathname === '/login') return 'login'
  if (/^\/(privacy|cookie-policy|terms)\/?$/.test(pathname)) return 'legal'
  return 'other'
}

export function contextSlugForPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/(?:work|strengths)\/([^/?#]+)/)
  return match?.[1] ? decodeURIComponent(match[1]) : undefined
}

export function requestedStudySlugFromPath(path: string | null | undefined): string | undefined {
  if (!path) return undefined
  try {
    return contextSlugForPath(new URL(path, 'https://portfolio.invalid').pathname)
  } catch {
    return undefined
  }
}

export function meetsCaseStudyEngagementThreshold(
  visibleMilliseconds: number,
  scrollDepth: number,
) {
  return visibleMilliseconds >= 30_000 && scrollDepth >= 0.5
}
