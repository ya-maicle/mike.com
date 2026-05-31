import { NextRequest, NextResponse } from 'next/server'

import { sanityNoStoreFetch } from '@/sanity/client'
import {
  PORTFOLIO_ACCESS_PROFILE_BY_SLUG,
  type PortfolioAccessProfile,
} from '@/sanity/queries/portfolio-access-queries'
import { isProfileActive, setPortfolioGrantCookie } from '@/lib/portfolio-access'
import { logPortfolioAccessEvent } from '@/lib/portfolio-access-events'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')?.trim().toLowerCase()
  const redirectUrl = new URL('/', request.url)

  if (!slug) return NextResponse.redirect(redirectUrl)

  const profile = await sanityNoStoreFetch<PortfolioAccessProfile | null>(
    PORTFOLIO_ACCESS_PROFILE_BY_SLUG,
    { slug },
  )
  const response = NextResponse.redirect(redirectUrl)

  if (!isProfileActive(profile)) {
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
