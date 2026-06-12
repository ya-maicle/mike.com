#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * READ-ONLY audit of every Mux asset referenced from Sanity: stored
 * resolution, encoding tier, and which documents use it.
 *
 * Why: `muxInput({ max_resolution_tier: '2160p', encoding_tier: 'smart' })`
 * only affects NEW uploads. Assets ingested before those settings are stored
 * at 1080p (or lower) forever — no player `maxResolution` prop can recover
 * detail that was never encoded. Those assets must be re-uploaded from a
 * high-resolution master (see MEDIA-QUALITY.md).
 *
 * Usage:
 *   pnpm dlx dotenv-cli -e apps/web/.env.local -- pnpm tsx scripts/mux-audit-quality.ts
 *
 * Required env:
 *   MUX_TOKEN_ID / MUX_TOKEN_SECRET            (falls back to SANITY_STUDIO_MUX_TOKEN_*)
 *   NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_READ_TOKEN                      (query)
 */

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID || process.env.SANITY_STUDIO_MUX_TOKEN_ID
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET || process.env.SANITY_STUDIO_MUX_TOKEN_SECRET
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET
const SANITY_READ_TOKEN = process.env.SANITY_API_READ_TOKEN
const SANITY_API_VERSION = 'v2025-01-01'

// Standard from MEDIA-QUALITY.md: full-bleed surfaces need >=1440p stored.
const MIN_STORED_TIER = 1440

if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET || !SANITY_PROJECT_ID || !SANITY_DATASET) {
  console.error('Missing MUX_TOKEN_* or NEXT_PUBLIC_SANITY_* env vars.')
  process.exit(1)
}

const muxAuth = `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`
const sanityBase = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}`

async function sanityQuery<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  const url = new URL(`${sanityBase}/data/query/${SANITY_DATASET}`)
  url.searchParams.set('query', query)
  url.searchParams.set('perspective', 'published')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(`$${key}`, JSON.stringify(value))
  }
  const res = await fetch(url, {
    headers: SANITY_READ_TOKEN ? { Authorization: `Bearer ${SANITY_READ_TOKEN}` } : {},
  })
  if (!res.ok) throw new Error(`Sanity query failed: ${res.status} ${await res.text()}`)
  return ((await res.json()) as { result: T }).result
}

type MuxAsset = {
  id: string
  status?: string
  resolution_tier?: string
  max_resolution_tier?: string
  max_stored_resolution?: string
  encoding_tier?: string
  video_quality?: string
  aspect_ratio?: string
  duration?: number
  max_stored_frame_rate?: number
}

async function getMuxAsset(assetId: string): Promise<MuxAsset> {
  const res = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
    headers: { Authorization: muxAuth },
  })
  if (!res.ok) throw new Error(`Mux get asset ${assetId} failed: ${res.status} ${await res.text()}`)
  return ((await res.json()) as { data: MuxAsset }).data
}

function tierToNumber(tier: string | undefined): number | null {
  if (!tier) return null
  const match = /^(\d+)p$/.exec(tier)
  return match ? Number(match[1]) : null
}

async function main() {
  const assetDocs = await sanityQuery<
    Array<{ _id: string; assetId?: string; playbackId?: string; filename?: string }>
  >(`*[_type == "mux.videoAsset"]{ _id, assetId, playbackId, filename }`)
  console.log(`Found ${assetDocs.length} mux.videoAsset documents in Sanity.\n`)

  const belowStandard: string[] = []
  let failed = 0

  for (const doc of assetDocs) {
    const referencedBy = await sanityQuery<Array<{ _type: string; title?: string }>>(
      `*[references($id)]{ _type, title }`,
      { id: doc._id },
    )
    const usage =
      referencedBy.map((d) => d.title || d._type).join(', ') || '(unreferenced — orphan?)'

    if (!doc.assetId) {
      console.warn(`! ${doc._id}: no assetId (used by: ${usage})`)
      failed += 1
      continue
    }

    try {
      const asset = await getMuxAsset(doc.assetId)
      const stored = asset.resolution_tier || asset.max_stored_resolution || '?'
      const quality = asset.video_quality || asset.encoding_tier || '?'
      const storedNum = tierToNumber(asset.resolution_tier)
      const flag = storedNum !== null && storedNum < MIN_STORED_TIER ? '  ⚠️ BELOW STANDARD' : ''
      if (flag) belowStandard.push(`${doc.filename || doc.assetId} (stored ${stored}) — ${usage}`)

      console.log(
        [
          `${flag ? '⚠️' : '✓'} ${doc.filename || doc.assetId}`,
          `   stored=${stored} maxTier=${asset.max_resolution_tier ?? '?'} quality=${quality}`,
          `   aspect=${asset.aspect_ratio ?? '?'} duration=${asset.duration?.toFixed(0) ?? '?'}s fps=${asset.max_stored_frame_rate ?? '?'}`,
          `   used by: ${usage}`,
        ].join('\n'),
      )
    } catch (err) {
      failed += 1
      console.error(`✗ ${doc.assetId}:`, err)
    }
  }

  console.log(`\n— Summary —`)
  console.log(
    `Assets below the ${MIN_STORED_TIER}p stored-resolution standard: ${belowStandard.length}`,
  )
  for (const line of belowStandard) console.log(`  • ${line}`)
  if (belowStandard.length > 0) {
    console.log(
      `\nThese need re-uploading from a >=1440p (ideally 2160p) master via the Studio,\n` +
        `which now pins max_resolution_tier=2160p + encoding_tier=smart. Player-side\n` +
        `maxResolution settings cannot recover detail that was never encoded.`,
    )
  }
  if (failed > 0) console.log(`Lookups failed: ${failed}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
