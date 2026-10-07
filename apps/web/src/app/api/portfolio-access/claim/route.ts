import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { clearPortfolioLoginCookies, resolveIdentityAccess } from '@/lib/portfolio-access'
import { verifyPortfolioIdentity, setPortfolioIdentity } from '@/lib/portfolio-identity'
import { sanityNoStoreFetch } from '@/sanity/client'
import { canReadStudy } from '@/lib/study-access'
import { logPortfolioAccessEvent } from '@/lib/portfolio-access-events'
import { getEmailDomain } from '@/lib/portfolio-access-model'

const claimBodySchema = z.object({
  accessToken: z.string().min(1).max(4096),
  path: z.string().max(2048).nullish(),
})

export async function POST(request: NextRequest) {
  const denied = NextResponse.json(
    { status: 'denied' },
    { headers: { 'Cache-Control': 'no-store' } },
  )
  clearPortfolioLoginCookies(denied)
  const parsed = claimBodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return denied
  const identity = await verifyPortfolioIdentity(parsed.data.accessToken)
  if (!identity) return denied
  try {
    const access = await resolveIdentityAccess(identity)
    const slug = parsed.data.path?.match(/^\/work\/([^/?#]+)\/?(?:[?#]|$)/)?.[1]
    const study = slug
      ? await sanityNoStoreFetch<{ _id: string; visibility?: string } | null>(
          '*[_type == "caseStudy" && slug.current == $slug][0]{_id, visibility}',
          { slug },
        )
      : null
    const status =
      access.source === 'blocked'
        ? 'blocked'
        : (slug ? study && canReadStudy(study, access) : access.hasMemberAccess)
          ? 'granted'
          : 'denied'
    const response = NextResponse.json(
      { status, companySlug: access.companySlug },
      {
        headers: { 'Cache-Control': 'no-store' },
      },
    )
    clearPortfolioLoginCookies(response)
    setPortfolioIdentity(response, parsed.data.accessToken)
    await logPortfolioAccessEvent({
      eventType:
        status === 'blocked'
          ? 'login_blocked'
          : status === 'granted'
            ? 'login_granted'
            : 'login_denied',
      companySlug: access.companySlug,
      grantType: 'login',
      path: parsed.data.path,
      userId: identity.id,
      emailDomain: getEmailDomain(identity.email),
    })
    return response
  } catch {
    return NextResponse.json({ status: 'denied' }, { status: 503, headers: denied.headers })
  }
}
