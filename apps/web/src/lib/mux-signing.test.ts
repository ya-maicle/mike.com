import crypto from 'node:crypto'
import { afterEach, describe, expect, it } from 'vitest'

import {
  attachMuxTokens,
  createMuxPlaybackTokens,
  normalizeMuxPrivateKey,
  signMuxToken,
} from '@/lib/mux-signing'

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString()
const config = { keyId: 'test-key-id', privateKey: privateKeyPem }

function decodeSegment(segment: string) {
  return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'))
}

afterEach(() => {
  delete process.env.MUX_SIGNING_KEY_ID
  delete process.env.MUX_SIGNING_PRIVATE_KEY
})

describe('signMuxToken', () => {
  it('produces a verifiable RS256 JWT with the expected claims', () => {
    const token = signMuxToken('playback-123', 'v', config)
    const [header, payload, signature] = token.split('.')

    expect(decodeSegment(header)).toEqual({ alg: 'RS256', typ: 'JWT', kid: 'test-key-id' })

    const claims = decodeSegment(payload)
    expect(claims.sub).toBe('playback-123')
    expect(claims.aud).toBe('v')
    expect(claims.exp).toBeGreaterThan(Math.floor(Date.now() / 1000))

    const verified = crypto.verify(
      'RSA-SHA256',
      Buffer.from(`${header}.${payload}`, 'utf8'),
      publicKey,
      Buffer.from(signature, 'base64url'),
    )
    expect(verified).toBe(true)
  })

  it('accepts a base64-encoded private key', () => {
    const base64Key = Buffer.from(privateKeyPem, 'utf8').toString('base64')
    expect(normalizeMuxPrivateKey(base64Key)).toBe(privateKeyPem.trim())
    expect(() =>
      signMuxToken('playback-123', 'v', { ...config, privateKey: base64Key }),
    ).not.toThrow()
  })

  it('embeds render params as claims on thumbnail tokens', () => {
    const tokens = createMuxPlaybackTokens('playback-123', config)
    const thumbClaims = decodeSegment(tokens.thumbnail.split('.')[1])
    expect(thumbClaims.aud).toBe('t')
    expect(thumbClaims.fit_mode).toBe('preserve')

    expect(decodeSegment(tokens.playback.split('.')[1]).aud).toBe('v')
    expect(decodeSegment(tokens.storyboard.split('.')[1]).aud).toBe('s')
  })
})

describe('attachMuxTokens', () => {
  it('is a no-op when signing keys are not configured', () => {
    const data = { video: { asset: { playbackId: 'abc' } } }
    expect(attachMuxTokens(data).video.asset).not.toHaveProperty('tokens')
  })

  it('attaches tokens to every nested signed playbackId when configured', () => {
    process.env.MUX_SIGNING_KEY_ID = config.keyId
    process.env.MUX_SIGNING_PRIVATE_KEY = privateKeyPem

    const data = {
      content: [
        {
          _type: 'videoBlock',
          video: { asset: { playbackId: 'one', playbackPolicy: 'signed' } },
        },
        {
          _type: 'carouselBlock',
          items: [
            {
              kind: 'video',
              video: { asset: { playbackId: 'two', playbackPolicy: 'signed' } },
            },
          ],
        },
        { _type: 'block', children: [{ text: 'hello' }] },
      ],
    }

    const result = attachMuxTokens(data) as typeof data & {
      content: Array<{ video?: { asset: { playbackId: string; tokens?: unknown } } }>
    }

    const first = result.content[0].video!.asset as { tokens?: { playback?: string } }
    expect(first.tokens?.playback).toBeTruthy()
    expect(decodeSegment(first.tokens!.playback!.split('.')[1]).sub).toBe('one')

    const items = (
      result.content[1] as { items?: Array<{ video: { asset: { tokens?: unknown } } }> }
    ).items
    expect(items?.[0].video.asset.tokens).toBeTruthy()
  })

  it('does not attach tokens to public or unspecified playback IDs', () => {
    process.env.MUX_SIGNING_KEY_ID = config.keyId
    process.env.MUX_SIGNING_PRIVATE_KEY = privateKeyPem

    const data = {
      publicVideo: { asset: { playbackId: 'public-id', playbackPolicy: 'public' } },
      legacyVideo: { asset: { playbackId: 'unspecified-id' } },
    }

    const result = attachMuxTokens(data)

    expect(result.publicVideo.asset).not.toHaveProperty('tokens')
    expect(result.legacyVideo.asset).not.toHaveProperty('tokens')
  })
})
