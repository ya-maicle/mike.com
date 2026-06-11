import { describe, expect, it } from 'vitest'

import {
  COOKIE_VERSION,
  safeTokenEqual,
  signAccessPayload,
  verifyAccessPayload,
  type SignedPayloadBase,
} from '@/lib/portfolio-access-crypto'

const SECRET = 'test-secret'

type GrantPayload = SignedPayloadBase & { kind: 'link' | 'login'; companySlug: string }

function makePayload(overrides: Partial<GrantPayload> = {}): GrantPayload {
  const now = Math.floor(Date.now() / 1000)
  return {
    v: COOKIE_VERSION,
    kind: 'link',
    companySlug: 'acme',
    iat: now,
    exp: now + 60,
    ...overrides,
  }
}

describe('portfolio access sign/verify cycle', () => {
  it('roundtrips a signed payload', () => {
    const signed = signAccessPayload(makePayload(), SECRET)
    expect(signed).toBeTruthy()

    const verified = verifyAccessPayload<GrantPayload>(signed!, 'link', SECRET)
    expect(verified?.companySlug).toBe('acme')
  })

  it('rejects a tampered signature', () => {
    const signed = signAccessPayload(makePayload(), SECRET)!
    const [payload, signature] = signed.split('.')
    const flipped = signature[0] === 'A' ? 'B' : 'A'
    const tampered = `${payload}.${flipped}${signature.slice(1)}`

    expect(verifyAccessPayload<GrantPayload>(tampered, 'link', SECRET)).toBeNull()
  })

  it('rejects a tampered payload', () => {
    const signed = signAccessPayload(makePayload(), SECRET)!
    const [, signature] = signed.split('.')
    const forgedPayload = Buffer.from(
      JSON.stringify(makePayload({ companySlug: 'other-company' })),
      'utf8',
    ).toString('base64url')

    expect(
      verifyAccessPayload<GrantPayload>(`${forgedPayload}.${signature}`, 'link', SECRET),
    ).toBeNull()
  })

  it('rejects an expired payload', () => {
    const now = Math.floor(Date.now() / 1000)
    const signed = signAccessPayload(makePayload({ iat: now - 120, exp: now - 60 }), SECRET)!

    expect(verifyAccessPayload<GrantPayload>(signed, 'link', SECRET)).toBeNull()
  })

  it('rejects a payload of the wrong kind', () => {
    const signed = signAccessPayload(makePayload({ kind: 'login' }), SECRET)!

    expect(verifyAccessPayload<GrantPayload>(signed, 'link', SECRET)).toBeNull()
  })

  it('rejects a payload with the wrong version', () => {
    const payload = { ...makePayload(), v: 2 } as unknown as GrantPayload
    const signed = signAccessPayload(payload, SECRET)!

    expect(verifyAccessPayload<GrantPayload>(signed, 'link', SECRET)).toBeNull()
  })

  it('fails closed when the secret is missing', () => {
    // Reason: a misconfigured deploy (no PORTFOLIO_ACCESS_SECRET) must deny access, not grant it.
    expect(signAccessPayload(makePayload(), '')).toBeNull()

    const signed = signAccessPayload(makePayload(), SECRET)!
    expect(verifyAccessPayload<GrantPayload>(signed, 'link', '')).toBeNull()
  })

  it('rejects a token signed with a different secret', () => {
    const signed = signAccessPayload(makePayload(), 'other-secret')!
    expect(verifyAccessPayload<GrantPayload>(signed, 'link', SECRET)).toBeNull()
  })

  it('compares link tokens safely', () => {
    expect(safeTokenEqual('abc123def456', 'abc123def456')).toBe(true)
    expect(safeTokenEqual('abc123def456', 'abc123def457')).toBe(false)
    expect(safeTokenEqual('abc123def456', 'abc123')).toBe(false)
    expect(safeTokenEqual('', 'abc123def456')).toBe(false)
    expect(safeTokenEqual('abc123def456', undefined)).toBe(false)
    expect(safeTokenEqual(null, null)).toBe(false)
  })

  it('rejects malformed values', () => {
    expect(verifyAccessPayload<GrantPayload>(undefined, 'link', SECRET)).toBeNull()
    expect(verifyAccessPayload<GrantPayload>('', 'link', SECRET)).toBeNull()
    expect(verifyAccessPayload<GrantPayload>('not-a-token', 'link', SECRET)).toBeNull()
    expect(verifyAccessPayload<GrantPayload>('a.b.c', 'link', SECRET)).toBeNull()
  })
})
