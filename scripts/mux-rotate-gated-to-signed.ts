#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Rotate Mux assets used in recruiter-gated case-study CONTENT to signed
 * playback, and revoke their public playback IDs.
 *
 * Why rotation (not just adding a signed ID): public playback IDs keep working
 * forever — anyone who already scraped one keeps access. Deleting the public
 * ID is the step that actually revokes exposure.
 *
 * Scope: only videos inside `content[]` of case studies with
 * visibility == "recruiter". Covers/teasers stay public by design.
 *
 * Usage (dry run, prints the plan without changing anything):
 *   pnpm dlx dotenv-cli -e apps/web/.env.local -- pnpm tsx scripts/mux-rotate-gated-to-signed.ts
 * Apply:
 *   ... scripts/mux-rotate-gated-to-signed.ts --execute
 *
 * Required env:
 *   MUX_TOKEN_ID / MUX_TOKEN_SECRET            (falls back to SANITY_STUDIO_MUX_TOKEN_*)
 *   NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET
 *   SANITY_API_READ_TOKEN                      (query)
 *   SANITY_API_WRITE_TOKEN                     (patch mux.videoAsset docs; only for --execute)
 *
 * ORDER MATTERS: deploy MUX_SIGNING_KEY_ID / MUX_SIGNING_PRIVATE_KEY to Vercel
 * (all envs) and verify a gated video plays BEFORE running with --execute —
 * otherwise gated videos break the moment public IDs are deleted.
 */

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID || process.env.SANITY_STUDIO_MUX_TOKEN_ID
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET || process.env.SANITY_STUDIO_MUX_TOKEN_SECRET
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET
const SANITY_READ_TOKEN = process.env.SANITY_API_READ_TOKEN
const SANITY_WRITE_TOKEN = process.env.SANITY_API_WRITE_TOKEN
const EXECUTE = process.argv.includes('--execute')
const SANITY_API_VERSION = 'v2025-01-01'

if (!MUX_TOKEN_ID || !MUX_TOKEN_SECRET || !SANITY_PROJECT_ID || !SANITY_DATASET) {
  console.error('Missing MUX_TOKEN_* or NEXT_PUBLIC_SANITY_* env vars.')
  process.exit(1)
}
if (EXECUTE && !SANITY_WRITE_TOKEN) {
  console.error('SANITY_API_WRITE_TOKEN is required with --execute (to patch asset docs).')
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

async function sanityMutate(mutations: unknown[]) {
  const res = await fetch(`${sanityBase}/data/mutate/${SANITY_DATASET}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SANITY_WRITE_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutations }),
  })
  if (!res.ok) throw new Error(`Sanity mutate failed: ${res.status} ${await res.text()}`)
}

/** Collect mux.videoAsset document refs from gated case-study content. */
function collectVideoAssetRefs(node: unknown, refs: Set<string>) {
  if (Array.isArray(node)) {
    node.forEach((child) => collectVideoAssetRefs(child, refs))
    return
  }
  if (!node || typeof node !== 'object') return
  const record = node as Record<string, unknown>
  const asset = record.asset as { _ref?: string } | undefined
  if (record._type === 'mux.video' && asset?._ref) refs.add(asset._ref)
  for (const child of Object.values(record)) collectVideoAssetRefs(child, refs)
}

type MuxPlaybackId = { id: string; policy: 'public' | 'signed' }

async function getMuxPlaybackIds(assetId: string): Promise<MuxPlaybackId[]> {
  const res = await fetch(`https://api.mux.com/video/v1/assets/${assetId}`, {
    headers: { Authorization: muxAuth },
  })
  if (!res.ok) throw new Error(`Mux get asset ${assetId} failed: ${res.status} ${await res.text()}`)
  const body = (await res.json()) as { data: { playback_ids?: MuxPlaybackId[] } }
  return body.data.playback_ids ?? []
}

async function createSignedPlaybackId(assetId: string): Promise<MuxPlaybackId> {
  const res = await fetch(`https://api.mux.com/video/v1/assets/${assetId}/playback-ids`, {
    method: 'POST',
    headers: { Authorization: muxAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ policy: 'signed' }),
  })
  if (!res.ok)
    throw new Error(
      `Mux create playback-id failed for ${assetId}: ${res.status} ${await res.text()}`,
    )
  return ((await res.json()) as { data: MuxPlaybackId }).data
}

async function deletePlaybackId(assetId: string, playbackId: string) {
  const res = await fetch(
    `https://api.mux.com/video/v1/assets/${assetId}/playback-ids/${playbackId}`,
    { method: 'DELETE', headers: { Authorization: muxAuth } },
  )
  if (!res.ok)
    throw new Error(
      `Mux delete playback-id failed for ${assetId}: ${res.status} ${await res.text()}`,
    )
}

async function main() {
  console.log(`Mode: ${EXECUTE ? 'EXECUTE' : 'dry run (pass --execute to apply)'}`)

  const studies = await sanityQuery<Array<{ _id: string; title?: string; content?: unknown }>>(
    `*[_type == "caseStudy" && visibility == "recruiter"]{ _id, title, content }`,
  )
  console.log(`Found ${studies.length} recruiter-gated case studies.`)

  const refs = new Set<string>()
  for (const study of studies) collectVideoAssetRefs(study.content, refs)
  if (refs.size === 0) {
    console.log('No gated content videos found. Nothing to do.')
    return
  }

  const assetDocs = await sanityQuery<
    Array<{ _id: string; assetId?: string; playbackId?: string }>
  >(`*[_id in $ids]{ _id, assetId, playbackId }`, { ids: [...refs] })
  console.log(`Resolved ${assetDocs.length} mux.videoAsset documents.`)

  let rotated = 0
  let skipped = 0
  let failed = 0

  for (const doc of assetDocs) {
    if (!doc.assetId) {
      console.warn(`! ${doc._id}: no assetId, skipping`)
      skipped += 1
      continue
    }
    try {
      const playbackIds = await getMuxPlaybackIds(doc.assetId)
      const publicIds = playbackIds.filter((p) => p.policy === 'public')
      const existingSigned = playbackIds.find((p) => p.policy === 'signed')

      if (publicIds.length === 0 && existingSigned) {
        console.log(`= ${doc.assetId}: already signed-only (${existingSigned.id})`)
        skipped += 1
        continue
      }

      console.log(
        `${EXECUTE ? '→' : 'would rotate'} ${doc.assetId}: public=[${publicIds
          .map((p) => p.id)
          .join(', ')}] signed=${existingSigned?.id ?? '(create new)'}`,
      )
      if (!EXECUTE) continue

      const signed = existingSigned ?? (await createSignedPlaybackId(doc.assetId))
      for (const publicId of publicIds) await deletePlaybackId(doc.assetId, publicId.id)

      // Keep the Sanity asset doc in sync so the app and studio use the new ID.
      await sanityMutate([
        {
          patch: {
            id: doc._id,
            set: {
              playbackId: signed.id,
              'data.playback_ids': [{ id: signed.id, policy: 'signed' }],
            },
          },
        },
      ])
      console.log(`✓ ${doc.assetId}: now signed-only as ${signed.id}`)
      rotated += 1
    } catch (err) {
      failed += 1
      console.error(`✗ ${doc.assetId ?? doc._id}:`, err)
    }
  }

  console.log(`Done. rotated=${rotated} skipped=${skipped} failed=${failed}`)
  if (EXECUTE && rotated > 0) {
    console.log('Reminder: gated pages must be redeployed/revalidated to pick up new playback IDs.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
