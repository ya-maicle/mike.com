import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { sanityNoStoreFetch } from '@/sanity/client'
import {
  ACTIVE_PORTFOLIO_ACCESS_PROFILE_BY_SLUG,
  type PortfolioAccessProfile,
} from '@/sanity/queries/portfolio-access-queries'
import { isProfileActive, setPortfolioGrantCookie } from '@/lib/portfolio-access'
import { safeTokenEqual } from '@/lib/portfolio-access-crypto'
import { logPortfolioAccessEvent } from '@/lib/portfolio-access-events'

const querySchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(64)
    .regex(/^[a-z0-9-]+$/),
  k: z
    .string()
    .trim()
    .min(12)
    .max(128)
    .regex(/^[A-Za-z0-9_-]+$/),
})

export async function GET(request: NextRequest) {
  const redirectUrl = new URL('/', request.url)
  const response = NextResponse.redirect(redirectUrl)

  const parsed = querySchema.safeParse({
    slug: request.nextUrl.searchParams.get('slug') ?? undefined,
    k: request.nextUrl.searchParams.get('k') ?? undefined,
  })
  if (!parsed.success) return response

  const { slug, k } = parsed.data
  const profile = await sanityNoStoreFetch<PortfolioAccessProfile | null>(
    ACTIVE_PORTFOLIO_ACCESS_PROFILE_BY_SLUG,
    { slug },
  )

  // Reason: a profile without a linkToken is unclaimable by link — fail closed,
  // and compare in constant time so tokens can't be brute-forced byte by byte.
  if (!isProfileActive(profile) || !safeTokenEqual(k, profile!.linkToken)) {
    return response
  }

  const didSetCookie = setPortfolioGrantCookie(response, 'link', profile!)
  if (didSetCookie) {
    await logPortfolioAccessEvent({
      eventType: 'link_opened',
      companySlug: profile!.slug,
      grantType: 'link',
      path: `/${slug}`,
    })
  }

  return response
}
