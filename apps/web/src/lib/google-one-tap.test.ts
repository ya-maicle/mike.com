import { describe, expect, it } from 'vitest'

import { createGoogleNonce, hashGoogleNonce } from '@/lib/google-one-tap'

describe('Google One Tap nonce helpers', () => {
  it('creates a cryptographically random 256-bit nonce', () => {
    const first = createGoogleNonce()
    const second = createGoogleNonce()

    expect(first).toMatch(/^[a-f0-9]{64}$/)
    expect(second).toMatch(/^[a-f0-9]{64}$/)
    expect(first).not.toBe(second)
  })

  it('hashes the nonce with SHA-256 for Google', async () => {
    await expect(hashGoogleNonce('one-tap-nonce')).resolves.toBe(
      '4aa7270f21a7c3b231a70358f6e875cf88f23bc65af4c530d2ad0ddfe7f97bd7',
    )
  })
})
