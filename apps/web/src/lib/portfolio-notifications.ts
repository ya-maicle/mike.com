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

type Notice = {
  state: 'sent' | 'failed' | 'disabled'
  key?: string
  providerId?: string
  errorCode?: string
  providerStatus?: number
}

// Store only known error codes, never provider messages (which can echo private data).
const providerErrorSchema = z.object({
  name: z.enum([
    'validation_error',
    'missing_api_key',
    'invalid_api_key',
    'invalid_api_Key',
    'authentication_error',
    'restricted_api_key',
    'suspended_api_key',
    'invalid_permission',
    'invalid_from_address',
    'invalid_access',
    'rate_limit_exceeded',
    'daily_quota_exceeded',
    'monthly_quota_exceeded',
    'invalid_idempotency_key',
    'invalid_idempotent_request',
    'concurrent_idempotent_requests',
    'application_error',
    'internal_server_error',
    'service_unavailable',
    'missing_required_field',
    'invalid_parameter',
  ]),
})
type NoticeRequest = {
  _id: string
  email: string
  userId: string
  company: string
  role: string
  reason?: string
  name?: string
  decisionVersion?: string
  status: string
  requestedAt: string
  expiresAt?: string
  allowedCaseStudies?: { _ref: string }[]
  study?: { _id: string; title: string; slug: string; visibility?: string }
  approvedStudies?: { _id: string; title: string; slug: string; visibility?: string }[]
  adminNotification?: Notice
  visitorNotification?: Notice
}

function emailOrigin(configuredUrl: string) {
  const branch = process.env.VERCEL_BRANCH_URL
  // Vercel supplies this hostname, so preview links stay with the code that sent them.
  if (process.env.VERCEL_ENV === 'preview' && branch) {
    try {
      const preview = new URL(`https://${branch}`)
      if (preview.host === branch && !preview.username && !preview.password) return preview.origin
    } catch {
      // Local development and other hosts use the editable Sanity URL.
    }
  }
  return new URL(configuredUrl).origin
}

export async function notifyAccessRequest(id: string, kind: 'admin' | 'visitor') {
  const client = accessRequestClient(true)
  const record = await client.fetch<NoticeRequest | null>(
    '*[_id == $id && _type == "portfolioAccessRequest"][0]{..., study->{_id,title,"slug":slug.current,visibility}, "approvedStudies": allowedCaseStudies[]->{_id,title,"slug":slug.current,visibility}}',
    { id },
    { cache: 'no-store' },
  )
  if (!record) throw new Error('Request not found.')
  if (kind === 'visitor' && !['approved', 'declined', 'revoked'].includes(record.status))
    return 'skipped'
  if (kind === 'admin' && record.status !== 'pending') return 'skipped'
  const field = kind === 'admin' ? 'adminNotification' : 'visitorNotification'
  const key = createHash('sha256')
    .update(
      JSON.stringify([
        record._id,
        kind,
        record.requestedAt,
        ...(kind === 'visitor'
          ? [record.status, record.decisionVersion, record.allowedCaseStudies, record.expiresAt]
          : []),
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
      .set({
        [field]: {
          state: 'disabled',
          key,
          errorCode: !parsed.success ? 'invalid_settings' : 'missing_api_key',
        },
      })
      .commit()
    return 'disabled'
  }
  if (kind === 'visitor' && record.status === 'approved') {
    const access = await resolveIdentityAccess({ id: record.userId, email: record.email })
    const studies = record.approvedStudies ?? (record.study ? [record.study] : [])
    if (
      access.source === 'blocked' ||
      !studies.some((study) => study?.visibility === 'recruiter' && canReadStudy(study, access))
    )
      return 'skipped'
  }
  const settings = parsed.data
  const site = emailOrigin(settings.siteUrl)
  const link =
    kind === 'admin'
      ? `${site}/studio/intent/edit/id=${encodeURIComponent(id)};type=portfolioAccessRequest`
      : `${site}/access?signin=1`
  const approved = record.status === 'approved'
  const text =
    kind === 'admin'
      ? `A verified visitor requested portfolio access.\n\n${record.name ? `Name: ${record.name}\n` : ''}Email: ${record.email}\nCompany or affiliation: ${record.company}${record.role ? `\nRole: ${record.role}` : ''}${record.reason ? `\n\nNote: ${record.reason}` : ''}\n\nCompany, role and note are supplied by the visitor.\n\nReview the request privately in Sanity:\n${link}`
      : approved
        ? `Your portfolio access is approved.\n\nView your portfolio access and available case studies:\n${link}\n\nIf asked to sign in, use ${record.email}. You do not need to request access again.${record.expiresAt ? `\n\nAccess expires: ${new Date(record.expiresAt).toISOString()}` : ''}`
        : `Thank you for your interest in my work. ${record.status === 'revoked' ? 'Your portfolio access has changed. Check your access page for the work currently available to you.' : 'Your portfolio request wasn’t approved at this time.'}\n\nYou can still explore the public case studies:\n${site}/work?view=public\n\nView your access status:\n${link}`
  let errorCode = 'network_error'
  let providerStatus: number | undefined
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
          kind === 'admin'
            ? 'New portfolio access request'
            : approved
              ? 'Your portfolio access is ready'
              : 'An update on your portfolio access',
        text,
      }),
    })
    providerStatus = response.status
    if (!response.ok) {
      const failure = providerErrorSchema.safeParse(await response.json().catch(() => null))
      errorCode = failure.success ? failure.data.name : 'provider_error'
      throw new Error('Email provider did not accept the notification.')
    }
    errorCode = 'invalid_provider_response'
    const result = z.object({ id: z.string().min(1) }).parse(await response.json())
    errorCode = 'receipt_save_failed'
    await client
      .patch(id)
      .set({ [field]: { state: 'sent', key, providerId: result.id } })
      .commit()
    return 'sent'
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') errorCode = 'provider_timeout'
    await client
      .patch(id)
      .set({
        [field]: { state: 'failed', key, errorCode, ...(providerStatus ? { providerStatus } : {}) },
      })
      .commit()
    return 'failed'
  }
}
