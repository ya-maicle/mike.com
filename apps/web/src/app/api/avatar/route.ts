import { NextRequest } from 'next/server'

const ALLOWED_HOSTS = new Set<string>([
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
  'secure.gravatar.com',
  'pbs.twimg.com',
  'platform-lookaside.fbsbx.com',
])

export async function GET(req: NextRequest) {
  try {
    const src = req.nextUrl.searchParams.get('src') || ''
    if (!src) return new Response('Missing src', { status: 400 })
    let url: URL
    try {
      url = new URL(src)
    } catch {
      return new Response('Invalid URL', { status: 400 })
    }
    if (!ALLOWED_HOSTS.has(url.hostname)) {
      return new Response('Host not allowed', { status: 400 })
    }

    const upstream = await fetch(url.toString(), {
      method: 'GET',
      // Do not forward referrer; keep simple headers
      headers: { Accept: 'image/*,*/*;q=0.5', 'User-Agent': 'Mozilla/5.0' },
      // Enable Next caching for 1 hour
      next: { revalidate: 3600 },
    })

    if (!upstream.ok) {
      // Surface the upstream status so client can fallback
      return new Response(null, { status: upstream.status })
    }
    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    // Stream body to client
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (e) {
    return new Response('Avatar proxy error', { status: 500 })
  }
}
