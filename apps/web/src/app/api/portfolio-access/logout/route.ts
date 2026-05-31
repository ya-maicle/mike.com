import { NextResponse } from 'next/server'

import { clearPortfolioLoginCookies } from '@/lib/portfolio-access'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  clearPortfolioLoginCookies(response)
  return response
}
