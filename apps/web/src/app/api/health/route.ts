import { NextResponse } from 'next/server'
import 'server-only'

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'web',
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}
