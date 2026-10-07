import { randomBytes } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import {
  browserProof,
  createRequestIntent,
  requestIntentInputSchema,
  REQUEST_INTENT_COOKIE,
  REQUEST_INTENT_TTL,
} from '@/lib/portfolio-request-intent'

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin')
  if (origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { error: 'Please start your request on this website.' },
      { status: 403 },
    )
  }
  if (Number(request.headers.get('content-length') ?? 0) > 8192) {
    return NextResponse.json({ error: 'Request too large.' }, { status: 413 })
  }
  const parsed = requestIntentInputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          'Please enter your company or affiliation and a valid email when using email sign-in.',
      },
      { status: 400 },
    )
  }
  try {
    const { method, email, ...details } = parsed.data
    const browser =
      request.cookies.get(REQUEST_INTENT_COOKIE)?.value || randomBytes(32).toString('base64url')
    const intent = createRequestIntent(
      details,
      method === 'magic_link' ? { email: email! } : { browserProof: browserProof(browser) },
      process.env.PORTFOLIO_ACCESS_SECRET ?? '',
    )
    const response = NextResponse.json(
      { returnPath: `/access#request=${intent}` },
      {
        headers: { 'Cache-Control': 'private, no-store' },
      },
    )
    response.cookies.set(REQUEST_INTENT_COOKIE, browser, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/api/portfolio-access',
      maxAge: REQUEST_INTENT_TTL,
    })
    return response
  } catch {
    return NextResponse.json(
      { error: 'We could not prepare your request. Please try again.' },
      { status: 503 },
    )
  }
}
