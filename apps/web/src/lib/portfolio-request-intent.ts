import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import { z } from 'zod'
import { accessRequestSchema, type AccessRequestDetails } from './portfolio-request-model'

export const REQUEST_INTENT_COOKIE = 'portfolio_request_browser'
export const REQUEST_INTENT_TTL = 30 * 60
export const requestIntentInputSchema = accessRequestSchema
  .extend({
    method: z.enum(['google', 'magic_link']),
    email: z.string().trim().toLowerCase().email().max(320).optional(),
  })
  .refine((value) => value.method !== 'magic_link' || !!value.email, 'Enter your email address.')

const intentSchema = z
  .object({
    version: z.literal(1),
    details: accessRequestSchema,
    expiresAt: z.number().int(),
    email: z.string().email().optional(),
    browserProof: z.string().optional(),
  })
  .strict()

export function browserProof(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

/** Encrypted, short-lived context; no unverified request or personal details in URLs/logs. */
export function createRequestIntent(
  details: AccessRequestDetails,
  binding: { email: string } | { browserProof: string },
  secret: string,
  now = Date.now(),
) {
  if (!secret) throw new Error('Access requests are temporarily unavailable.')
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', createHash('sha256').update(secret).digest(), iv)
  const payload = intentSchema.parse({
    version: 1,
    details,
    ...binding,
    expiresAt: Math.floor(now / 1000) + REQUEST_INTENT_TTL,
  })
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString('base64url')).join('.')
}

export function readRequestIntent(
  token: string,
  identity: { email: string },
  browser: string | undefined,
  secret: string,
  now = Date.now(),
): AccessRequestDetails | null {
  if (!secret || token.length > 8000) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [iv, tag, encrypted] = parts.map((part) => Buffer.from(part, 'base64url'))
    const decipher = createDecipheriv(
      'aes-256-gcm',
      createHash('sha256').update(secret).digest(),
      iv,
    )
    decipher.setAuthTag(tag)
    const decoded = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
    const parsed = intentSchema.parse(JSON.parse(decoded))
    const current = Math.floor(now / 1000)
    if (parsed.expiresAt <= current || parsed.expiresAt > current + REQUEST_INTENT_TTL) return null
    if (parsed.email) {
      if (parsed.email !== identity.email) return null
    } else if (!browser || parsed.browserProof !== browserProof(browser)) return null
    return parsed.details
  } catch {
    return null
  }
}
