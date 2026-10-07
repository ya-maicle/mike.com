import { z } from 'zod'
import { createHash } from 'node:crypto'
import { accessRequestClient } from '@/lib/portfolio-requests'
import { notifyAccessRequest } from '@/lib/portfolio-notifications'

const schema = z
  .object({
    id: z.string().regex(/^portfolioAccessRequest\.[a-f0-9]{64}$/),
    kind: z.enum(['admin', 'visitor']),
    proof: z.string().uuid(),
  })
  .strict()

export async function POST(request: Request) {
  const body = schema.safeParse(await request.json().catch(() => null))
  if (!body.success) return Response.json({ error: 'Invalid request.' }, { status: 400 })
  try {
    const client = accessRequestClient(true)
    const record = await client.fetch<{
      _rev: string
      notificationProof?: { digest: string; kind: string; expiresAt: string }
    } | null>(
      '*[_id == $id && _type == "portfolioAccessRequest"][0]{_rev,notificationProof}',
      { id: body.data.id },
      { cache: 'no-store' },
    )
    const proof = record?.notificationProof
    const digest = createHash('sha256').update(body.data.proof).digest('hex')
    if (
      !record ||
      !proof ||
      proof.digest !== digest ||
      proof.kind !== body.data.kind ||
      !(Date.parse(proof.expiresAt) > Date.now()) ||
      Date.parse(proof.expiresAt) > Date.now() + 60_000
    ) {
      return Response.json(
        { error: 'This notification request expired or is invalid. Retry from Sanity Studio.' },
        { status: 403 },
      )
    }
    // Only authenticated Sanity writers can place proof in this private document.
    // A revision guard atomically consumes it, preventing replay and concurrent use.
    await client.patch(body.data.id).ifRevisionId(record._rev).unset(['notificationProof']).commit()
    const status = await notifyAccessRequest(body.data.id, body.data.kind)
    return Response.json({ status }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return Response.json(
      {
        error:
          'The decision is saved, but the notification could not be sent. Retry from this request.',
      },
      { status: 503 },
    )
  }
}
