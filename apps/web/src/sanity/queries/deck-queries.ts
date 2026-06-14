import { groq } from 'next-sanity'

export const DECK_QUERY = groq`*[_type == "deck"][0]{ "url": pdf.asset->url }`

export type DeckResult = { url: string | null } | null
