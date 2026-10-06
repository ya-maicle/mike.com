import { notifyAccessRequest } from '@/lib/portfolio-notifications'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyPortfolioIdentity, setPortfolioIdentity } from '@/lib/portfolio-identity'
import { resolveIdentityAccess } from '@/lib/portfolio-access'
import { canReadStudy } from '@/lib/study-access'
import {
  accessRequestSchema,
  requestStatus,
  type AccessRequest,
} from '@/lib/portfolio-request-model'
import { accessRequestClient, accessRequestId, requestProjection } from '@/lib/portfolio-requests'
import { sanityNoStoreFetch } from '@/sanity/client'

const studySlugSchema = z
  .string()
  .min(1)
  .max(96)
  .regex(/^[a-z0-9-]+$/)
const json = (body: object, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'private, no-store' },
  })

async function context(request: NextRequest, slug: string) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  const identity = await verifyPortfolioIdentity(token)
  if (!identity) return { error: json({ error: 'Please sign in again to continue.' }, 401) }
  const access = await resolveIdentityAccess(identity)
  if (access.source === 'blocked') return { error: json({ status: 'blocked' }) }
  const study = await sanityNoStoreFetch<{ _id: string; visibility?: string } | null>(
    '*[_type == "caseStudy" && slug.current == $slug][0]{_id, visibility}',
    { slug },
  )
  if (!study) return { error: json({ error: 'Case study not found.' }, 404) }
  if (canReadStudy(study, access)) {
    const response = json({ status: 'available' })
    setPortfolioIdentity(response, token!)
    return { error: response }
  }
  if (study.visibility !== 'recruiter')
    return { error: json({ error: 'Access is unavailable.' }, 403) }
  return { identity, study, id: accessRequestId(identity.id, study._id) }
}

export async function GET(request: NextRequest) {
  const parsed = studySlugSchema.safeParse(request.nextUrl.searchParams.get('study'))
  if (!parsed.success) return json({ error: 'Choose a case study.' }, 400)
  try {
    const ctx = await context(request, parsed.data)
    if (ctx.error) return ctx.error
    const existing = await accessRequestClient().fetch<AccessRequest | null>(
      `*[_id == $id && email == $email][0]${requestProjection}`,
      { id: ctx.id, email: ctx.identity.email },
      { cache: 'no-store' },
    )
    return json({ status: requestStatus(existing) })
  } catch {
    return json({ error: 'We could not check your request. Please try again.' }, 503)
  }
}

export async function POST(request: NextRequest) {
  if (Number(request.headers.get('content-length') ?? 0) > 8192)
    return json({ error: 'Request too large.' }, 413)
  const parsed = accessRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success)
    return json(
      { error: 'Please complete all fields. Use at least 10 characters for your reason.' },
      400,
    )
  try {
    const ctx = await context(request, parsed.data.studySlug)
    if (ctx.error) return ctx.error
    const client = accessRequestClient(true)
    const existing = await client.fetch<(AccessRequest & { _rev: string }) | null>(
      `*[_id == $id][0]{...${requestProjection}, _rev}`,
      { id: ctx.id },
      { cache: 'no-store' },
    )
    const fields = {
      userId: ctx.identity.id,
      email: ctx.identity.email,
      company: parsed.data.company,
      role: parsed.data.role,
      reason: parsed.data.reason,
      study: { _type: 'reference', _ref: ctx.study._id },
      allowedCaseStudies: [{ _type: 'reference', _key: 'requested', _ref: ctx.study._id }],
      status: 'pending',
      requestedAt: new Date().toISOString(),
    }
    // Deterministic IDs prevent duplicate submissions and preserve reviewer decisions.
    if (
      existing &&
      (requestStatus(existing) === 'expired' || existing.email !== ctx.identity.email)
    ) {
      await client
        .patch(ctx.id)
        .ifRevisionId(existing._rev)
        .set(fields)
        .unset(['expiresAt'])
        .commit()
    } else if (!existing) {
      await client.createIfNotExists({ _id: ctx.id, _type: 'portfolioAccessRequest', ...fields })
    }
    // A notification failure must not erase or misreport a saved request.
    try {
      await notifyAccessRequest(ctx.id, 'admin')
    } catch {
      /* visible in the Sanity review queue */
    }
    const saved = await client.fetch<AccessRequest>(
      `*[_id == $id][0]${requestProjection}`,
      { id: ctx.id },
      { cache: 'no-store' },
    )
    return json({ status: requestStatus(saved) })
  } catch {
    return json({ error: 'We could not save your request. Please try again.' }, 503)
  }
}
