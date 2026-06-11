import { groq } from 'next-sanity'

export const PORTFOLIO_ACCESS_PROFILE_BY_SLUG = groq`
  *[_type == "portfolioAccessProfile" && slug.current == $slug][0]{
    _id,
    companyName,
    "slug": slug.current,
    accessStatus,
    allowedEmailDomains,
    expiresAt
  }
`

export const PORTFOLIO_ACCESS_PROFILES_BY_DOMAIN = groq`
  *[_type == "portfolioAccessProfile" && $domain in allowedEmailDomains[]]{
    _id,
    companyName,
    "slug": slug.current,
    accessStatus,
    allowedEmailDomains,
    expiresAt
  }
`

export const PORTFOLIO_ACCESS_PROFILES_WITH_DOMAINS = groq`
  *[_type == "portfolioAccessProfile" && count(allowedEmailDomains) > 0]{
    _id,
    companyName,
    "slug": slug.current,
    accessStatus,
    allowedEmailDomains,
    expiresAt
  }
`

export const ACTIVE_PORTFOLIO_ACCESS_PROFILE_BY_SLUG = groq`
  *[
    _type == "portfolioAccessProfile" &&
    slug.current == $slug &&
    accessStatus == "enabled" &&
    (!defined(expiresAt) || dateTime(expiresAt) > dateTime(now()))
  ][0]{
    _id,
    companyName,
    "slug": slug.current,
    accessStatus,
    allowedEmailDomains,
    expiresAt,
    linkToken
  }
`

export type PortfolioAccessProfile = {
  _id: string
  companyName: string
  slug: string
  accessStatus?: 'enabled' | 'blocked' | 'disabled'
  allowedEmailDomains?: string[]
  expiresAt?: string
  linkToken?: string
}
