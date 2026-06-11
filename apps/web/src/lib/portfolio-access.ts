import 'server-only'

import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'

import { sanityNoStoreFetch } from '@/sanity/client'
import {
  ACTIVE_PORTFOLIO_ACCESS_PROFILE_BY_SLUG,
  type PortfolioAccessProfile,
} from '@/sanity/queries/portfolio-access-queries'
import { getEmailDomain, isProfileActive, normalizeEmailDomain } from '@/lib/portfolio-access-model'
import {
  COOKIE_VERSION,
  signAccessPayload,
  verifyAccessPayload,
} from '@/lib/portfolio-access-crypto'

export const PORTFOLIO_LINK_ACCESS_COOKIE = 'portfolio_link_access'
export const PORTFOLIO_LOGIN_ACCESS_COOKIE = 'portfolio_login_access'
export const PORTFOLIO_BLOCKED_IDENTITY_COOKIE = 'portfolio_blocked_identity'

const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 30

type GrantPayload = {
  v: typeof COOKIE_VERSION
  kind: 'link' | 'login'
  companySlug: string
  iat: number
  exp: number
}

type BlockedPayload = {
  v: typeof COOKIE_VERSION
  kind: 'blocked'
  domain: string
  iat: number
  exp: number
}

export type PortfolioAccessState =
  | {
      hasRecruiterAccess: true
      source: 'link' | 'login'
      companySlug: string
    }
  | {
      hasRecruiterAccess: false
      source?: 'blocked' | 'none'
      blockedDomain?: string
    }

export { getEmailDomain, isProfileActive, normalizeEmailDomain }

function getSecret() {
  // Reason: missing secret must fail closed — sign/verify both return null.
  return process.env.PORTFOLIO_ACCESS_SECRET?.trim() || ''
}

function signPayload(payload: GrantPayload | BlockedPayload) {
  return signAccessPayload(payload, getSecret())
}

function verifyPayload<T extends GrantPayload | BlockedPayload>(
  value: string | undefined,
  kind: T['kind'],
) {
  return verifyAccessPayload<T>(value, kind, getSecret())
}

function maxAgeForProfile(profile?: PortfolioAccessProfile | null) {
  if (!profile?.expiresAt) return COOKIE_TTL_SECONDS
  const secondsUntilExpiry = Math.floor((new Date(profile.expiresAt).getTime() - Date.now()) / 1000)
  return Math.max(0, Math.min(COOKIE_TTL_SECONDS, secondsUntilExpiry))
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}

function setSignedCookie(
  response: NextResponse,
  name: string,
  payload: GrantPayload | BlockedPayload,
  maxAge: number,
) {
  const value = signPayload(payload)
  if (!value || maxAge <= 0) return false
  response.cookies.set(name, value, cookieOptions(maxAge))
  return true
}

export function setPortfolioGrantCookie(
  response: NextResponse,
  kind: 'link' | 'login',
  profile: PortfolioAccessProfile,
) {
  const now = Math.floor(Date.now() / 1000)
  const maxAge = maxAgeForProfile(profile)
  const cookieName = kind === 'link' ? PORTFOLIO_LINK_ACCESS_COOKIE : PORTFOLIO_LOGIN_ACCESS_COOKIE

  return setSignedCookie(
    response,
    cookieName,
    {
      v: COOKIE_VERSION,
      kind,
      companySlug: profile.slug,
      iat: now,
      exp: now + maxAge,
    },
    maxAge,
  )
}

export function setPortfolioBlockedCookie(response: NextResponse, domain: string) {
  const now = Math.floor(Date.now() / 1000)
  return setSignedCookie(
    response,
    PORTFOLIO_BLOCKED_IDENTITY_COOKIE,
    {
      v: COOKIE_VERSION,
      kind: 'blocked',
      domain,
      iat: now,
      exp: now + COOKIE_TTL_SECONDS,
    },
    COOKIE_TTL_SECONDS,
  )
}

export function clearPortfolioLoginCookies(response: NextResponse) {
  response.cookies.set(PORTFOLIO_LOGIN_ACCESS_COOKIE, '', cookieOptions(0))
  response.cookies.set(PORTFOLIO_BLOCKED_IDENTITY_COOKIE, '', cookieOptions(0))
}

async function isGrantStillActive(companySlug: string) {
  const profile = await sanityNoStoreFetch<PortfolioAccessProfile | null>(
    ACTIVE_PORTFOLIO_ACCESS_PROFILE_BY_SLUG,
    { slug: companySlug },
  )
  return isProfileActive(profile)
}

export async function getPortfolioAccessState(): Promise<PortfolioAccessState> {
  const cookieStore = await cookies()
  const blocked = verifyPayload<BlockedPayload>(
    cookieStore.get(PORTFOLIO_BLOCKED_IDENTITY_COOKIE)?.value,
    'blocked',
  )

  if (blocked) {
    return {
      hasRecruiterAccess: false,
      source: 'blocked',
      blockedDomain: blocked.domain,
    }
  }

  const loginGrant = verifyPayload<GrantPayload>(
    cookieStore.get(PORTFOLIO_LOGIN_ACCESS_COOKIE)?.value,
    'login',
  )
  if (loginGrant && (await isGrantStillActive(loginGrant.companySlug))) {
    return {
      hasRecruiterAccess: true,
      source: 'login',
      companySlug: loginGrant.companySlug,
    }
  }

  const linkGrant = verifyPayload<GrantPayload>(
    cookieStore.get(PORTFOLIO_LINK_ACCESS_COOKIE)?.value,
    'link',
  )
  if (linkGrant && (await isGrantStillActive(linkGrant.companySlug))) {
    return {
      hasRecruiterAccess: true,
      source: 'link',
      companySlug: linkGrant.companySlug,
    }
  }

  return { hasRecruiterAccess: false, source: 'none' }
}
