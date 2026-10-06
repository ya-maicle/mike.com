import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'

export const PORTFOLIO_IDENTITY_COOKIE = 'portfolio_identity'
export const identityCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

export async function verifyPortfolioIdentity(token?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!token || !url || !key) return null
  try {
    const client = createClient(url, key, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data, error } = await client.auth.getUser(token)
    const user = data.user
    if (error || !user?.email || !user.email_confirmed_at || user.is_anonymous) return null
    return { id: user.id, email: user.email.trim().toLowerCase() }
  } catch {
    return null
  }
}

export async function getPortfolioIdentity() {
  return verifyPortfolioIdentity((await cookies()).get(PORTFOLIO_IDENTITY_COOKIE)?.value)
}

export function setPortfolioIdentity(response: NextResponse, token: string) {
  // getUser verifies the token on every protected read; expiry/revocation fails closed.
  response.cookies.set(PORTFOLIO_IDENTITY_COOKIE, token, {
    ...identityCookieOptions,
    maxAge: 60 * 60,
  })
}
