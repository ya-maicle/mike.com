import { NextRequest, NextResponse, after } from 'next/server'
import { z } from 'zod'
import { verifyPortfolioIdentity, setPortfolioIdentity } from '@/lib/portfolio-identity'
import { accessRequestSchema } from '@/lib/portfolio-request-model'
import { accessRequestClient, accessRequestId } from '@/lib/portfolio-requests'
import { portfolioRequestContext } from '@/lib/portfolio-request-context'
import { readRequestIntent, REQUEST_INTENT_COOKIE } from '@/lib/portfolio-request-intent'
import { notifyAccessRequest } from '@/lib/portfolio-notifications'

const json = (body: object, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })

async function identityFor(request: NextRequest) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  return { token, identity: await verifyPortfolioIdentity(token) }
}

export async function GET(request: NextRequest) {
  const { token, identity } = await identityFor(request)
  if (!identity) return json({ error: 'Please sign in again to check your access.' }, 401)
  try {
    const { state } = await portfolioRequestContext(identity)
    const response = json(state)
    setPortfolioIdentity(response, token!)
    return response
  } catch {
    return json({ error: 'We could not check your access. Please try again.' }, 503)
  }
}

export async function POST(request: NextRequest) {
  if (Number(request.headers.get('content-length') ?? 0) > 12288)
    return json({ error: 'Request too large.' }, 413)
  const { token, identity } = await identityFor(request)
  if (!identity) return json({ error: 'Please sign in again to send your request.' }, 401)
  const body = await request.json().catch(() => null)
  const intent = z
    .object({ intent: z.string().max(8000) })
    .strict()
    .safeParse(body)
  const details = intent.success
    ? readRequestIntent(
        intent.data.intent,
        identity,
        request.cookies.get(REQUEST_INTENT_COOKIE)?.value,
        process.env.PORTFOLIO_ACCESS_SECRET ?? '',
      )
    : body
  const parsed = accessRequestSchema.safeParse(details)
  if (!parsed.success)
    return json(
      {
        error: intent.success
          ? 'This request has expired or belongs to another account. Please start a new portfolio request.'
          : 'Please enter your company or affiliation. Role and note are optional.',
      },
      400,
    )
  try {
    const context = await portfolioRequestContext(identity)
    if (!['none', 'expired'].includes(context.state.status)) return json(context.state)
    const client = accessRequestClient(true)
    const id = context.current?._id ?? accessRequestId(`${identity.id}:${identity.email}`)
    const fields = {
      ...parsed.data,
      userId: identity.id,
      email: identity.email,
      ...(identity.name ? { name: identity.name } : {}),
      scope: 'portfolio',
      status: 'pending',
      requestedAt: new Date().toISOString(),
      adminNotification: { state: 'pending' },
      allowedCaseStudies: context.standard.map((_ref, index) => ({
        _type: 'reference',
        _key: `study-${index}`,
        _ref,
      })),
    }
    if (context.current) {
      const existing = await client.fetch<{ _rev: string; status: string; expiresAt?: string }>(
        '*[_id == $id][0]{_rev,status,expiresAt}',
        { id },
      )
      if (
        existing.status !== 'approved' ||
        !existing.expiresAt ||
        Date.parse(existing.expiresAt) > Date.now()
      )
        return json((await portfolioRequestContext(identity)).state)
      await client
        .patch(id)
        .ifRevisionId(existing._rev)
        .set(fields)
        .unset(['expiresAt', 'study', 'visitorNotification'])
        .commit()
    } else {
      await client.createIfNotExists({ _id: id, _type: 'portfolioAccessRequest', ...fields })
    }
    // Persist first; a failed notification never loses the request.
    after(async () => {
      try {
        await notifyAccessRequest(id, 'admin')
      } catch {
        /* Still in the review queue. */
      }
    })
    const response = json((await portfolioRequestContext(identity)).state)
    setPortfolioIdentity(response, token!)
    return response
  } catch {
    return json({ error: 'We could not save your request. Please try again.' }, 503)
  }
}
