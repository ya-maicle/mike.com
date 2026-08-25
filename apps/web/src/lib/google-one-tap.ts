export const GOOGLE_ONE_TAP_LOGIN_PENDING_KEY = 'google-one-tap-login-pending'

const NONCE_BYTE_LENGTH = 32

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function createGoogleNonce(cryptoProvider: Pick<Crypto, 'getRandomValues'> = crypto) {
  return bytesToHex(cryptoProvider.getRandomValues(new Uint8Array(NONCE_BYTE_LENGTH)))
}

export async function hashGoogleNonce(
  nonce: string,
  cryptoProvider: Pick<Crypto, 'subtle'> = crypto,
) {
  const digest = await cryptoProvider.subtle.digest('SHA-256', new TextEncoder().encode(nonce))
  return bytesToHex(new Uint8Array(digest))
}
