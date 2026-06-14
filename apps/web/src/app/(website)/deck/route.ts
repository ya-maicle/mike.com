import { NextResponse } from 'next/server'
import { sanityFetch } from '@/sanity/client'
import { DECK_QUERY, type DeckResult } from '@/sanity/queries/deck-queries'

export const revalidate = 60

export async function GET() {
  const deck = await sanityFetch<DeckResult>(DECK_QUERY, {}, { tag: 'deck', revalidate: 60 })

  if (!deck?.url) {
    return new NextResponse('Deck not found', { status: 404 })
  }

  return NextResponse.redirect(deck.url, { status: 302 })
}
