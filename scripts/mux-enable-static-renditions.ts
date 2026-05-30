#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Backfill: enable static MP4 renditions on every existing Mux asset.
 *
 * Usage:
 *   MUX_TOKEN_ID=... MUX_TOKEN_SECRET=... pnpm tsx scripts/mux-enable-static-renditions.ts
 *   add --dry-run to list assets without modifying.
 *
 * After running, allow ~minutes for Mux to encode the static_renditions.
 */

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET
const DRY_RUN = process.argv.includes('--dry-run')

if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET) {
  console.error('MUX_TOKEN_ID and MUX_TOKEN_SECRET must be set.')
  process.exit(1)
}

const authHeader = `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`

type MuxAsset = {
  id: string
  status: string
  static_renditions?: { status?: string; files?: unknown[] }
}

async function listAssets(): Promise<MuxAsset[]> {
  const all: MuxAsset[] = []
  let page = 1
  const limit = 100
  while (true) {
    const url = `https://api.mux.com/video/v1/assets?limit=${limit}&page=${page}`
    const res = await fetch(url, { headers: { Authorization: authHeader } })
    if (!res.ok) throw new Error(`Mux list failed: ${res.status} ${await res.text()}`)
    const body = (await res.json()) as { data: MuxAsset[] }
    all.push(...body.data)
    if (body.data.length < limit) break
    page += 1
  }
  return all
}

async function enableStaticRenditions(assetId: string) {
  const res = await fetch(`https://api.mux.com/video/v1/assets/${assetId}/mp4-support`, {
    method: 'PUT',
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mp4_support: 'standard' }),
  })
  if (!res.ok)
    throw new Error(`Mux update failed for ${assetId}: ${res.status} ${await res.text()}`)
}

async function main() {
  console.log('Fetching all Mux assets…')
  const assets = await listAssets()
  console.log(`Found ${assets.length} total assets.`)

  const needsUpdate = assets.filter((a) => {
    const status = a.static_renditions?.status
    return status !== 'ready' && status !== 'preparing'
  })
  console.log(`${needsUpdate.length} assets need static_renditions enabled.`)

  if (DRY_RUN) {
    for (const a of needsUpdate) console.log(`would update: ${a.id} (status=${a.status})`)
    console.log('Dry run complete.')
    return
  }

  let success = 0
  let failed = 0
  for (const asset of needsUpdate) {
    try {
      await enableStaticRenditions(asset.id)
      success += 1
      console.log(`✓ ${asset.id}`)
    } catch (err) {
      failed += 1
      console.error(`✗ ${asset.id}`, err)
    }
  }
  console.log(`Done. Updated ${success}, failed ${failed}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
