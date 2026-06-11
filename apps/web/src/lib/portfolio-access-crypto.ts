import crypto from 'node:crypto'

/**
 * Pure sign/verify primitives for portfolio access cookies.
 * Kept free of `server-only` and `next/headers` so the grant/verify cycle
 * can be unit-tested; the cookie/env plumbing lives in portfolio-access.ts.
 */

export const COOKIE_VERSION = 1

export type SignedPayloadBase = {
  v: typeof COOKIE_VERSION
  kind: string
  iat: number
  exp: number
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url')
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function hmac(encodedPayload: string, secret: string) {
  return crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url')
}

export function signAccessPayload(payload: SignedPayloadBase, secret: string): string | null {
  if (!secret) return null
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  return `${encodedPayload}.${hmac(encodedPayload, secret)}`
}

/** Constant-time string comparison for secret tokens (length leak is acceptable). */
export function safeTokenEqual(a: string | undefined | null, b: string | undefined | null) {
  if (!a || !b) return false
  const bufferA = Buffer.from(a)
  const bufferB = Buffer.from(b)
  return bufferA.length === bufferB.length && crypto.timingSafeEqual(bufferA, bufferB)
}

export function verifyAccessPayload<T extends SignedPayloadBase>(
  value: string | undefined,
  kind: T['kind'],
  secret: string,
): T | null {
  if (!secret || !value) return null

  const [encodedPayload, signature] = value.split('.')
  if (!encodedPayload || !signature) return null

  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(hmac(encodedPayload, secret))

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as T
    if (payload.v !== COOKIE_VERSION || payload.kind !== kind) return null
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
