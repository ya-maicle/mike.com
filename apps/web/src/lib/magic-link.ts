import { z } from 'zod'

import { isValidReturnPath } from '@/lib/url-validation'

export const MAGIC_LINK_CONFIRM_PATH = '/auth/confirm'
export const MAGIC_LINK_SENT_PATH = '/login/check-email'
export const MAGIC_LINK_REQUEST_STORAGE_KEY = 'magic-link-request:v1'
export const MAGIC_LINK_RESEND_DELAY_MS = 60_000
export const MAGIC_LINK_REQUEST_TTL_MS = 30 * 60_000

const DEFAULT_RETURN_PATH = '/'
const MAX_EMAIL_LENGTH = 320
const MAX_RETURN_PATH_LENGTH = 2_048
const MAX_SECRET_LENGTH = 16_384

const pendingMagicLinkRequestSchema = z
  .object({
    email: z.string().trim().email().max(MAX_EMAIL_LENGTH),
    returnPath: z.string().max(MAX_RETURN_PATH_LENGTH),
    requestedAt: z.number().int().nonnegative().finite(),
    retryAt: z.number().int().nonnegative().finite(),
  })
  .strict()
  .refine(({ requestedAt, retryAt }) => retryAt >= requestedAt, {
    message: 'The retry time cannot precede the request time.',
  })
  .refine(({ requestedAt, retryAt }) => retryAt <= requestedAt + MAGIC_LINK_REQUEST_TTL_MS, {
    message: 'The retry time must fall within the request lifetime.',
  })

const tokenHashFragmentSchema = z.object({
  token_hash: z.string().trim().min(1).max(MAX_SECRET_LENGTH),
  type: z.literal('email'),
})

const legacySessionFragmentSchema = z.object({
  access_token: z.string().trim().min(1).max(MAX_SECRET_LENGTH),
  refresh_token: z.string().trim().min(1).max(MAX_SECRET_LENGTH),
})

export type PendingMagicLinkRequest = z.infer<typeof pendingMagicLinkRequestSchema>
export type MagicLinkCredential =
  | { kind: 'token_hash'; tokenHash: string }
  | { kind: 'legacy_tokens'; accessToken: string; refreshToken: string }

export type MagicLinkEntry =
  | {
      status: 'ready'
      credential: Extract<MagicLinkCredential, { kind: 'token_hash' }>
      returnPath: string | null
    }
  | {
      status: 'exchange'
      credential: Exclude<MagicLinkCredential, { kind: 'token_hash' }>
      returnPath: string | null
    }
  | { status: 'error'; returnPath: null }

function safeReturnPath(returnPath: string | null | undefined) {
  return returnPath && returnPath.length <= MAX_RETURN_PATH_LENGTH && isValidReturnPath(returnPath)
    ? returnPath
    : DEFAULT_RETURN_PATH
}

/** Builds the allowlisted first-party confirmation URL used by hosted email templates. */
export function buildMagicLinkEmailRedirectUrl(origin: string, returnPath: string) {
  const parsedOrigin = new URL(origin)
  if (parsedOrigin.protocol !== 'http:' && parsedOrigin.protocol !== 'https:') {
    throw new TypeError('Magic-link redirects require an HTTP(S) origin.')
  }

  const confirmUrl = new URL(MAGIC_LINK_CONFIRM_PATH, parsedOrigin.origin)
  const fragment = new URLSearchParams({ auth_return_to: safeReturnPath(returnPath) })
  confirmUrl.hash = fragment.toString()
  return confirmUrl.toString()
}

export function createPendingMagicLinkRequest(
  email: string,
  returnPath: string,
  now = Date.now(),
): PendingMagicLinkRequest {
  const requestedAt = Math.trunc(now)

  return pendingMagicLinkRequestSchema.parse({
    email: email.trim(),
    returnPath: safeReturnPath(returnPath),
    requestedAt,
    retryAt: requestedAt + MAGIC_LINK_RESEND_DELAY_MS,
  })
}

export function parsePendingMagicLinkRequest(
  value: string | null,
  now = Date.now(),
): PendingMagicLinkRequest | null {
  if (!value) return null

  try {
    const parsed = pendingMagicLinkRequestSchema.safeParse(JSON.parse(value))
    if (!parsed.success) return null
    if (!isValidReturnPath(parsed.data.returnPath)) return null
    if (now < parsed.data.requestedAt) return null
    if (now >= parsed.data.requestedAt + MAGIC_LINK_REQUEST_TTL_MS) return null
    return parsed.data
  } catch {
    return null
  }
}

export function secondsUntilMagicLinkResend(retryAt: number, now = Date.now()) {
  if (!Number.isFinite(retryAt) || !Number.isFinite(now)) return 0
  return Math.max(0, Math.ceil((retryAt - now) / 1_000))
}

/** Parses credentials client-side so bearer secrets can remain in the URL fragment. */
export function parseMagicLinkEntry(requestUrl: string | URL): MagicLinkEntry {
  const url = new URL(requestUrl)
  const fragment = new URLSearchParams()

  // During the deploy-first template rollout, Supabase's old implicit template
  // can append a second fragment. Merge both segments so those short-lived links
  // still reach the explicit confirmation screen instead of failing silently.
  for (const segment of url.hash.slice(1).split('#')) {
    for (const [key, value] of new URLSearchParams(segment)) fragment.set(key, value)
  }
  const returnPathCandidate =
    fragment.get('auth_return_to') ?? url.searchParams.get('auth_return_to')
  const returnPath = isValidReturnPath(returnPathCandidate) ? returnPathCandidate : null
  const hasCallbackError =
    url.searchParams.has('error') ||
    url.searchParams.has('error_description') ||
    fragment.has('error') ||
    fragment.has('error_description')

  if (hasCallbackError) return { status: 'error', returnPath: null }

  const tokenHash = tokenHashFragmentSchema.safeParse({
    token_hash: fragment.get('token_hash'),
    type: fragment.get('type'),
  })
  if (tokenHash.success) {
    return {
      status: 'ready',
      credential: { kind: 'token_hash', tokenHash: tokenHash.data.token_hash },
      returnPath,
    }
  }

  const legacySession = legacySessionFragmentSchema.safeParse({
    access_token: fragment.get('access_token'),
    refresh_token: fragment.get('refresh_token'),
  })
  if (legacySession.success) {
    return {
      status: 'exchange',
      credential: {
        kind: 'legacy_tokens',
        accessToken: legacySession.data.access_token,
        refreshToken: legacySession.data.refresh_token,
      },
      returnPath,
    }
  }

  return { status: 'error', returnPath: null }
}

/** Removes all callback credentials and errors from the visible browser URL. */
export function getCleanMagicLinkUrl(requestUrl: string | URL) {
  const url = new URL(requestUrl)
  url.hash = ''
  url.searchParams.delete('code')
  url.searchParams.delete('error')
  url.searchParams.delete('error_description')
  url.searchParams.delete('error_code')
  url.searchParams.delete('auth_return_to')
  return url
}
