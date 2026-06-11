import crypto from 'node:crypto'

/**
 * Mux signed-playback token helpers.
 *
 * Pure signing primitives (testable) plus an env-backed factory used by
 * server components. When MUX_SIGNING_KEY_ID / MUX_SIGNING_PRIVATE_KEY are
 * not configured everything returns undefined and playback falls back to
 * public-policy behavior, so this is safe to ship before keys exist.
 */

export type MuxPlaybackTokens = {
  playback: string
  thumbnail: string
  storyboard: string
}

export type MuxSigningConfig = {
  keyId: string
  privateKey: string
  expiresInSeconds?: number
}

const DEFAULT_TTL_SECONDS = 60 * 60 * 12

type MuxAudience = 'v' | 't' | 's'

function base64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url')
}

/** Mux dashboard provides the private key base64-encoded; accept raw PEM too. */
export function normalizeMuxPrivateKey(key: string) {
  const trimmed = key.trim()
  if (trimmed.startsWith('-----')) return trimmed
  return Buffer.from(trimmed, 'base64').toString('utf8').trim()
}

export function signMuxToken(
  playbackId: string,
  audience: MuxAudience,
  config: MuxSigningConfig,
  extraClaims: Record<string, string> = {},
): string {
  const exp = Math.floor(Date.now() / 1000) + (config.expiresInSeconds ?? DEFAULT_TTL_SECONDS)
  const header = base64UrlJson({ alg: 'RS256', typ: 'JWT', kid: config.keyId })
  const payload = base64UrlJson({ sub: playbackId, aud: audience, exp, ...extraClaims })
  const signingInput = `${header}.${payload}`
  const signature = crypto
    .sign(
      'RSA-SHA256',
      Buffer.from(signingInput, 'utf8'),
      normalizeMuxPrivateKey(config.privateKey),
    )
    .toString('base64url')
  return `${signingInput}.${signature}`
}

export function createMuxPlaybackTokens(
  playbackId: string,
  config: MuxSigningConfig,
): MuxPlaybackTokens {
  return {
    playback: signMuxToken(playbackId, 'v', config),
    // Reason: signed image URLs reject loose query params — render params must
    // live inside the token claims instead.
    thumbnail: signMuxToken(playbackId, 't', config, { fit_mode: 'preserve' }),
    storyboard: signMuxToken(playbackId, 's', config),
  }
}

export function getMuxSigningConfigFromEnv(): MuxSigningConfig | null {
  const keyId = process.env.MUX_SIGNING_KEY_ID?.trim()
  const privateKey = process.env.MUX_SIGNING_PRIVATE_KEY?.trim()
  if (!keyId || !privateKey) return null
  return { keyId, privateKey }
}

/**
 * Deep-walks fetched Sanity data and attaches playback tokens next to every
 * `playbackId` so client components can read `asset.tokens` without each
 * parent threading props. No-op when signing keys are not configured.
 */
export function attachMuxTokens<T>(value: T): T {
  const config = getMuxSigningConfigFromEnv()
  if (!config) return value

  const tokenCache = new Map<string, MuxPlaybackTokens>()
  const tokensFor = (playbackId: string) => {
    let tokens = tokenCache.get(playbackId)
    if (!tokens) {
      tokens = createMuxPlaybackTokens(playbackId, config)
      tokenCache.set(playbackId, tokens)
    }
    return tokens
  }

  const walk = (node: unknown): void => {
    if (Array.isArray(node)) {
      node.forEach(walk)
      return
    }
    if (!node || typeof node !== 'object') return

    const record = node as Record<string, unknown>
    if (typeof record.playbackId === 'string' && record.playbackId) {
      record.tokens = tokensFor(record.playbackId)
    }
    for (const child of Object.values(record)) walk(child)
  }

  walk(value)
  return value
}
