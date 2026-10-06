import 'server-only'
import { createHash } from 'node:crypto'
import { z } from 'zod'
import { accessRequestClient } from './portfolio-requests'
import { resolveIdentityAccess } from './portfolio-access'
import { canReadStudy } from './study-access'

const settingsSchema = z.object({
  enabled: z.literal(true),
  adminEmail: z.string().email(),
  senderEmail: z.string().email(),
  siteUrl: z
    .string()
    .url()
    .refine((value) => new URL(value).protocol === 'https:'),
})

type Notice = { state: 'sent' | 'failed' | 'disabled'; key?: string; providerId?: string }
type NoticeRequest = {
  _id: string
  email: string
  userId: string
  company: string
  role: string
  status: string
  requestedAt: string
  expiresAt?: string
  allowedCaseStudies?: { _ref: string }[]
  study: { _id: string; title: string; slug: string; visibility?: string }
  adminNotification?: Notice
  visitorNotification?: Notice
}

export async function notifyAccessRequest(id: string, kind: 'admin' | 'visitor') {
  const client = accessRequestClient(true)
  const record = await client.fetch<NoticeRequest | null>(
    '*[_id == $id && _type == "portfolioAccessRequest"][0]{..., study->{_id,title,"slug":slug.current,visibility}}',
    { id },
    { cache: 'no-store' },
  )
  if (!record?.study) throw new Error('Request or case study not found.')
  if (kind === 'visitor' && record.status !== 'approved') return 'skipped'
  const field = kind === 'admin' ? 'adminNotification' : 'visitorNotification'
  const key = createHash('sha256')
    .update(
      JSON.stringify([
        record._id,
        kind,
        record.requestedAt,
        ...(kind === 'visitor' ? [record.allowedCaseStudies, record.expiresAt] : []),
      ]),
    )
    .digest('hex')
  if (record[field]?.state === 'sent' && record[field]?.key === key) return 'sent'
  const rawSettings = await client.fetch(
    '*[_id == "portfolioAccessSettings.config"][0]',
    {},
    { cache: 'no-store' },
  )
  const parsed = settingsSchema.safeParse(rawSettings)
  if (!parsed.success || !process.env.RESEND_API_KEY) {
    await client
      .patch(id)
      .set({ [field]: { state: 'disabled', key } })
      .commit()
    return 'disabled'
  }
  if (kind === 'visitor') {
    const access = await resolveIdentityAccess({ id: record.userId, email: record.email })
    if (!canReadStudy(record.study, access)) return 'skipped'
  }
  const settings = parsed.data
  const site = new URL(settings.siteUrl).origin
  const link =
    kind === 'admin'
      ? `${site}/studio/intent/edit/id=${encodeURIComponent(id)};type=portfolioAccessRequest`
      : `${site}/work/${encodeURIComponent(record.study.slug)}`
  const text =
    kind === 'admin'
      ? `A verified visitor requested access to ${record.study.title}.\n\nEmail: ${record.email}\nCompany: ${record.company}\nRole: ${record.role}\n\nReview the request privately in Sanity:\n${link}`
      : `Your access to ${record.study.title} has been approved.\n\nSign in with ${record.email} to read the case study:\n${link}${record.expiresAt ? `\n\nAccess expires: ${new Date(record.expiresAt).toISOString()}` : ''}`
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(10_000),
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': `portfolio-${key}`,
      },
      body: JSON.stringify({
        from: settings.senderEmail,
        to: [kind === 'admin' ? settings.adminEmail : record.email],
        subject:
          kind === 'admin' ? 'New portfolio access request' : 'Your case-study access is ready',
        text,
      }),
    })
    if (!response.ok) throw new Error('Email provider did not accept the notification.')
    const result = (await response.json()) as { id: string }
    await client
      .patch(id)
      .set({ [field]: { state: 'sent', key, providerId: result.id } })
      .commit()
    return 'sent'
  } catch {
    await client
      .patch(id)
      .set({ [field]: { state: 'failed', key } })
      .commit()
    return 'failed'
  }
}
