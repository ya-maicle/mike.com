import type { PortfolioAccessProfile } from '@/sanity/queries/portfolio-access-queries'

export function normalizeEmailDomain(value?: string | null) {
  return value?.trim().toLowerCase().replace(/^@/, '') ?? ''
}

export function getEmailDomain(email?: string | null) {
  const trimmed = email?.trim().toLowerCase()
  const domain = trimmed?.split('@')[1]
  return normalizeEmailDomain(domain)
}

export function isProfileActive(profile?: PortfolioAccessProfile | null) {
  if (!profile) return false
  if (profile.accessStatus !== 'enabled') return false
  if (!profile.expiresAt) return true
  return new Date(profile.expiresAt).getTime() > Date.now()
}

export function profileMatchesDomain(profile: PortfolioAccessProfile, domain: string) {
  return (
    !!domain &&
    profile.allowedEmailDomains?.some(
      (allowedDomain) => normalizeEmailDomain(allowedDomain) === domain,
    ) === true
  )
}

export function profileStudyAccess(profiles: PortfolioAccessProfile[]) {
  const active = profiles.filter(isProfileActive)
  return {
    hasRecruiterAccess: active.some(
      (profile) => !profile.accessScope || profile.accessScope === 'all',
    ),
    allowedStudyIds: [
      ...new Set(
        active.flatMap((profile) =>
          profile.accessScope === 'selected' ? (profile.allowedStudyIds ?? []) : [],
        ),
      ),
    ],
  }
}
