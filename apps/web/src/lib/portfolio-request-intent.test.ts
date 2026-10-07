import { describe, expect, it } from 'vitest'
import {
  browserProof,
  createRequestIntent,
  readRequestIntent,
  requestIntentInputSchema,
  REQUEST_INTENT_TTL,
} from './portfolio-request-intent'
import { buildMagicLinkEmailRedirectUrl, parseMagicLinkEntry } from './magic-link'

const details = { company: 'Example Studio', role: '', reason: '' }
const identity = { email: 'visitor@example.test' }
const secret = 'local-test-secret-not-for-deployment'
const now = Date.UTC(2026, 9, 7)

describe('portfolio request continuation', () => {
  it('requires only affiliation and an email for the email branch', () => {
    expect(requestIntentInputSchema.parse({ company: ' Independent ', method: 'google' })).toEqual({
      company: 'Independent',
      role: '',
      reason: '',
      method: 'google',
    })
    expect(
      requestIntentInputSchema.safeParse({ company: 'Example', method: 'magic_link' }).success,
    ).toBe(false)
    expect(
      requestIntentInputSchema.safeParse({
        company: 'Example',
        method: 'google',
        status: 'approved',
      }).success,
    ).toBe(false)
  })
  it('binds Google details to the browser that explicitly started the request', () => {
    const token = createRequestIntent(
      details,
      { browserProof: browserProof('browser-secret') },
      secret,
      now,
    )
    expect(readRequestIntent(token, identity, 'browser-secret', secret, now)).toEqual(details)
    expect(readRequestIntent(token, identity, undefined, secret, now)).toBeNull()
    expect(readRequestIntent(token, identity, 'different-browser', secret, now)).toBeNull()
    expect(token).not.toContain('Example')
  })
  it('supports email verification on another device, bound to the verified address', () => {
    const token = createRequestIntent(details, identity, secret, now)
    expect(readRequestIntent(token, identity, undefined, secret, now)).toEqual(details)
    expect(
      readRequestIntent(token, { email: 'someone-else@example.test' }, undefined, secret, now),
    ).toBeNull()
  })
  it('rejects tampering, expiration and a missing or changed server secret', () => {
    const token = createRequestIntent(details, identity, secret, now)
    const [iv, tag, body] = token.split('.')
    const changed = `${iv}.${tag}.${body[0] === 'A' ? 'B' : 'A'}${body.slice(1)}`
    expect(readRequestIntent(changed, identity, undefined, secret, now)).toBeNull()
    expect(
      readRequestIntent(token, identity, undefined, secret, now + REQUEST_INTENT_TTL * 1000),
    ).toBeNull()
    expect(readRequestIntent(token, identity, undefined, 'another-secret', now)).toBeNull()
    expect(readRequestIntent(token, identity, undefined, '', now)).toBeNull()
    expect(() => createRequestIntent(details, identity, '', now)).toThrow()
  })
  it('preserves optional Unicode details through the safe email confirmation fragment', () => {
    const value = { company: '設'.repeat(120), role: '計'.repeat(120), reason: '好'.repeat(1000) }
    const token = createRequestIntent(value, identity, secret, now)
    const path = `/access#request=${token}`
    const redirect = new URL(buildMagicLinkEmailRedirectUrl('https://example.test', path))
    const fragment = new URLSearchParams(redirect.hash.slice(1))
    fragment.set('token_hash', 'one-time-email-verification')
    fragment.set('type', 'email')
    redirect.hash = fragment.toString()
    const entry = parseMagicLinkEntry(redirect.toString())
    expect(entry.returnPath).toBe(path)
    expect(redirect.search).toBe('')
    expect(readRequestIntent(token, identity, undefined, secret, now)).toEqual(value)
  })
})
