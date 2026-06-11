import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { sanityNoStoreFetch } from '@/sanity/client'
import {
  PORTFOLIO_ACCESS_PROFILES_WITH_DOMAINS,
  type PortfolioAccessProfile,
} from '@/sanity/queries/portfolio-access-queries'
import {
  clearPortfolioLoginCookies,
  getEmailDomain,
  isProfileActive,
  normalizeEmailDomain,
  setPortfolioBlockedCookie,
  setPortfolioGrantCookie,
} from '@/lib/portfolio-access'
import { logPortfolioAccessEvent } from '@/lib/portfolio-access-events'

const claimBodySchema = z.object({
  accessToken: z.string().min(1).max(4096),
  path: z.string().max(2048).nullish(),
})

function getSupabaseAuthClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return null

  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

function profileMatchesDomain(profile: PortfolioAccessProfile, domain: string) {
  return profile.allowedEmailDomains?.some(
    (allowedDomain) => normalizeEmailDomain(allowedDomain) === domain,
  )
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ status: 'denied' })
  const supabase = getSupabaseAuthClient()

  if (!supabase) {
    clearPortfolioLoginCookies(response)
    return response
  }

  const parsed = claimBodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    clearPortfolioLoginCookies(response)
    return response
  }
  const body = parsed.data

  const { data, error } = await supabase.auth.getUser(body.accessToken)
  if (error || !data.user) {
    clearPortfolioLoginCookies(response)
    return response
  }

  const user = data.user
  const emailDomain = getEmailDomain(user.email)
  if (!emailDomain) {
    clearPortfolioLoginCookies(response)
    return response
  }

  const profiles = await sanityNoStoreFetch<PortfolioAccessProfile[]>(
    PORTFOLIO_ACCESS_PROFILES_WITH_DOMAINS,
  )
  const matchingProfiles = profiles.filter((profile) => profileMatchesDomain(profile, emailDomain))
  const blockedProfile = matchingProfiles.find((profile) => profile.accessStatus === 'blocked')

  if (blockedProfile) {
    clearPortfolioLoginCookies(response)
    setPortfolioBlockedCookie(response, emailDomain)
    await logPortfolioAccessEvent({
      eventType: 'login_blocked',
      companySlug: blockedProfile.slug,
      grantType: 'login',
      path: body.path ?? null,
      userId: user.id,
      emailDomain,
    })
    return NextResponse.json(
      { status: 'blocked', companySlug: blockedProfile.slug },
      { headers: response.headers },
    )
  }

  const activeProfile = matchingProfiles.find(isProfileActive)
  if (!activeProfile) {
    clearPortfolioLoginCookies(response)
    await logPortfolioAccessEvent({
      eventType: 'login_denied',
      grantType: 'login',
      path: body.path ?? null,
      userId: user.id,
      emailDomain,
    })
    return response
  }

  clearPortfolioLoginCookies(response)
  setPortfolioGrantCookie(response, 'login', activeProfile)
  await logPortfolioAccessEvent({
    eventType: 'login_granted',
    companySlug: activeProfile.slug,
    grantType: 'login',
    path: body.path ?? null,
    userId: user.id,
    emailDomain,
  })

  return NextResponse.json(
    { status: 'granted', companySlug: activeProfile.slug },
    { headers: response.headers },
  )
}
