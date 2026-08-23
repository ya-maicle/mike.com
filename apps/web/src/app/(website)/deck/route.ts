import { NextResponse } from 'next/server'
import { sanityNoStoreFetch } from '@/sanity/client'
import { DECK_QUERY, type DeckResult } from '@/sanity/queries/deck-queries'

export const dynamic = 'force-dynamic'

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex, nofollow',
}

export async function GET() {
  const deck = await sanityNoStoreFetch<DeckResult>(DECK_QUERY)

  if (!deck?.url) {
    return new NextResponse('Deck not found', { status: 404, headers: noStoreHeaders })
  }

  return NextResponse.redirect(deck.url, { status: 302, headers: noStoreHeaders })
}
