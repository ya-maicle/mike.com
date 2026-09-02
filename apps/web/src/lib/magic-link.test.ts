import { describe, expect, it } from 'vitest'

import {
  MAGIC_LINK_CONFIRM_PATH,
  MAGIC_LINK_REQUEST_TTL_MS,
  MAGIC_LINK_RESEND_DELAY_MS,
  buildMagicLinkEmailRedirectUrl,
  createPendingMagicLinkRequest,
  getCleanMagicLinkUrl,
  parseMagicLinkEntry,
  parsePendingMagicLinkRequest,
  secondsUntilMagicLinkResend,
} from '@/lib/magic-link'

const NOW = Date.UTC(2026, 8, 2, 12)

describe('magic-link redirect helpers', () => {
  it('builds an exact confirmation URL with the return path in the fragment', () => {
    const redirectUrl = new URL(
      buildMagicLinkEmailRedirectUrl(
        'https://preview.example.com/somewhere',
        '/work/example#result',
      ),
    )

    expect(redirectUrl.origin).toBe('https://preview.example.com')
    expect(redirectUrl.pathname).toBe(MAGIC_LINK_CONFIRM_PATH)
    expect(redirectUrl.search).toBe('')
    expect(new URLSearchParams(redirectUrl.hash.slice(1)).get('auth_return_to')).toBe(
      '/work/example#result',
    )
  })

  it('falls back to the home page for an unsafe return path', () => {
    const redirectUrl = new URL(
      buildMagicLinkEmailRedirectUrl('https://example.com', 'https://attacker.example/path'),
    )

    expect(new URLSearchParams(redirectUrl.hash.slice(1)).get('auth_return_to')).toBe('/')
  })

  it('parses a direct token-hash link and its cross-browser return path', () => {
    const entry = parseMagicLinkEntry(
      'https://example.com/auth/confirm#auth_return_to=%2Fwork%2Fexample%3Ftab%3Dresult&token_hash=one-time-secret&type=email',
    )

    expect(entry).toEqual({
      status: 'ready',
      credential: { kind: 'token_hash', tokenHash: 'one-time-secret' },
      returnPath: '/work/example?tab=result',
    })
  })

  it('does not trust an unsafe return path from a link', () => {
    const entry = parseMagicLinkEntry(
      'https://example.com/auth/confirm#auth_return_to=https%3A%2F%2Fattacker.example&token_hash=secret&type=email',
    )

    expect(entry).toMatchObject({ status: 'ready', returnPath: null })
  })

  it('parses the old-template implicit handoff during a deploy-first rollout', () => {
    const entry = parseMagicLinkEntry(
      'https://example.com/auth/confirm#auth_return_to=%2Fwork%2Fexample#access_token=legacy-access&refresh_token=legacy-refresh&type=bearer',
    )

    expect(entry).toEqual({
      status: 'exchange',
      credential: {
        kind: 'legacy_tokens',
        accessToken: 'legacy-access',
        refreshToken: 'legacy-refresh',
      },
      returnPath: '/work/example',
    })
  })

  it.each([
    'https://example.com/auth/confirm',
    'https://example.com/auth/confirm#token_hash=&type=email',
    'https://example.com/auth/confirm#token_hash=secret&type=magiclink',
    `https://example.com/auth/confirm#token_hash=${'x'.repeat(16_385)}&type=email`,
    `https://example.com/auth/confirm?code=${'x'.repeat(2_049)}`,
  ])('rejects invalid confirmation input', (requestUrl) => {
    expect(parseMagicLinkEntry(requestUrl)).toEqual({ status: 'error', returnPath: null })
  })

  it('removes all credentials, callback errors, and return state from the visible URL', () => {
    const cleanUrl = getCleanMagicLinkUrl(
      'https://example.com/auth/confirm?code=secret&error_code=bad&auth_return_to=%2Fwork#access_token=secret&refresh_token=secret',
    )

    expect(cleanUrl.toString()).toBe('https://example.com/auth/confirm')
  })
})

describe('pending magic-link requests', () => {
  it('creates a normalized request with a one-minute retry delay', () => {
    expect(createPendingMagicLinkRequest('  Person@Example.com ', '/work/example', NOW)).toEqual({
      email: 'Person@Example.com',
      returnPath: '/work/example',
      requestedAt: NOW,
      retryAt: NOW + MAGIC_LINK_RESEND_DELAY_MS,
    })
  })

  it('parses a request throughout its 30-minute lifetime', () => {
    const pending = createPendingMagicLinkRequest('person@example.com', '/work/example', NOW)
    const serialized = JSON.stringify(pending)

    expect(parsePendingMagicLinkRequest(serialized, NOW)).toEqual(pending)
    expect(parsePendingMagicLinkRequest(serialized, NOW + MAGIC_LINK_REQUEST_TTL_MS - 1)).toEqual(
      pending,
    )
    expect(parsePendingMagicLinkRequest(serialized, NOW + MAGIC_LINK_REQUEST_TTL_MS)).toBeNull()
  })

  it.each([
    null,
    '',
    '{not-json',
    JSON.stringify({ email: 'not-an-email', returnPath: '/', requestedAt: NOW, retryAt: NOW }),
    JSON.stringify({
      email: 'person@example.com',
      returnPath: 'https://attacker.example',
      requestedAt: NOW,
      retryAt: NOW + MAGIC_LINK_RESEND_DELAY_MS,
    }),
    JSON.stringify({
      email: 'person@example.com',
      returnPath: '/',
      requestedAt: NOW,
      retryAt: NOW - 1,
    }),
  ])('rejects missing or corrupt storage', (stored) => {
    expect(parsePendingMagicLinkRequest(stored, NOW)).toBeNull()
  })

  it('rejects a request timestamp from the future', () => {
    const pending = createPendingMagicLinkRequest('person@example.com', '/', NOW + 1)
    expect(parsePendingMagicLinkRequest(JSON.stringify(pending), NOW)).toBeNull()
  })

  it('calculates a rounded-up resend countdown', () => {
    expect(secondsUntilMagicLinkResend(NOW + 60_000, NOW)).toBe(60)
    expect(secondsUntilMagicLinkResend(NOW + 1_001, NOW)).toBe(2)
    expect(secondsUntilMagicLinkResend(NOW - 1, NOW)).toBe(0)
    expect(secondsUntilMagicLinkResend(Number.NaN, NOW)).toBe(0)
  })
})
