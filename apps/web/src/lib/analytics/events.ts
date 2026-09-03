export const ANALYTICS_SCHEMA_VERSION = 2
export const PORTFOLIO_ACCESS_ANALYTICS_STORAGE_KEY = 'maicle.analytics.portfolio-access.v1'

export type AnalyticsEnvironment = 'preview' | 'production'
export type PageType =
  | 'home'
  | 'work_index'
  | 'case_study'
  | 'strengths_index'
  | 'strength_detail'
  | 'blog_index'
  | 'blog_post'
  | 'bio'
  | 'login'
  | 'legal'
  | 'other'

export type StudyVisibility = 'public' | 'recruiter'
export type StudyViewState = 'locked' | 'unlocked'
export type StudyAccessSource = 'none' | 'link' | 'login'
export type PortfolioAuthMethod = 'google' | 'magic_link'
export type PortfolioAccessEntryPoint = 'header' | 'work_card' | 'case_study_gate' | 'login_page'
export type BlogCardPlacement = 'featured' | 'rail' | 'archive'

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
  case_study_audio_started: {
    study_slug: string
  }
  case_study_audio_progressed: {
    study_slug: string
    milestone: '25' | '50' | 'completed'
  }
  case_study_audio_speed_changed: {
    study_slug: string
    playback_rate: 0.5 | 1 | 1.5 | 2
  }
  case_study_shared: {
    study_slug: string
    method: 'copy' | 'linkedin' | 'x'
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
  blog_card_clicked: {
    post_slug: string
    card_placement: BlogCardPlacement
    card_position: number
  }
  blog_post_viewed: {
    post_slug: string
  }
  blog_post_engaged: {
    post_slug: string
    engagement_basis: 'scroll_and_time'
  }
  blog_audio_started: {
    post_slug: string
  }
  blog_audio_progressed: {
    post_slug: string
    milestone: '25' | '50' | 'completed'
  }
  blog_audio_speed_changed: {
    post_slug: string
    playback_rate: 0.5 | 1 | 1.5 | 2
  }
  blog_article_shared: {
    post_slug: string
    method: 'copy' | 'linkedin' | 'x'
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
  if (/^\/blog\/?$/.test(pathname)) return 'blog_index'
  if (/^\/blog\/[^/]+\/?$/.test(pathname)) return 'blog_post'
  if (pathname === '/bio') return 'bio'
  if (pathname === '/login' || pathname.startsWith('/login/')) return 'login'
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

export function meetsBlogPostEngagementThreshold(visibleMilliseconds: number, scrollDepth: number) {
  return visibleMilliseconds >= 30_000 && scrollDepth >= 0.5
}
