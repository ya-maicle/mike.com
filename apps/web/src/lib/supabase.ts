'use client'

import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined
let transientClientSequence = 0

function getSupabaseConfiguration() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Set them in .env.local.',
    )
  }
  return { url, anonKey }
}

function getPersistentAuthStorageKey(url: string) {
  return `sb-${new URL(url).hostname.split('.')[0]}-auth-token`
}

function createTransientStorage(initialValues: Record<string, string> = {}) {
  const values = new Map(Object.entries(initialValues))

  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  }
}

function createInstanceId() {
  transientClientSequence += 1
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${transientClientSequence}`
}

export function getSupabaseClient(): SupabaseClient {
  if (!client) {
    const { url, anonKey } = getSupabaseConfiguration()
    client = createClient(url, anonKey, {
      auth: {
        storageKey: getPersistentAuthStorageKey(url),
        flowType: 'pkce',
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  }
  return client
}

/**
 * Magic-link sends and token-hash verification do not need PKCE. Keeping them
 * on an isolated, non-persistent client avoids leaving a browser-bound verifier
 * behind when the email is opened on another device.
 */
export function createSupabaseMagicLinkClient(): SupabaseClient {
  const { url, anonKey } = getSupabaseConfiguration()
  const instanceId = createInstanceId()

  return createClient(url, anonKey, {
    auth: {
      storageKey: `magic-link-transient:${instanceId}`,
      flowType: 'implicit',
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  })
}

/**
 * Exchanges an OAuth PKCE code without allowing the returned candidate session
 * to touch the persistent client's storage or BroadcastChannel. The candidate
 * is persisted only after the provider has checked for an account conflict.
 */
export async function exchangeSupabaseOAuthCode(authCode: string): Promise<Session> {
  const { url, anonKey } = getSupabaseConfiguration()
  const persistentVerifierKey = `${getPersistentAuthStorageKey(url)}-code-verifier`
  let codeVerifier: string | null = null

  try {
    codeVerifier = localStorage.getItem(persistentVerifierKey)
  } catch {
    // A PKCE redirect cannot survive navigation when its verifier is unavailable.
  }

  if (!codeVerifier) throw new Error('The OAuth code verifier is missing or expired.')

  const storageKey = `oauth-code-exchange:${createInstanceId()}`
  const exchangeClient = createClient(url, anonKey, {
    auth: {
      storageKey,
      storage: createTransientStorage({ [`${storageKey}-code-verifier`]: codeVerifier }),
      flowType: 'pkce',
      autoRefreshToken: false,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })

  try {
    const { data, error } = await exchangeClient.auth.exchangeCodeForSession(authCode)
    if (error || !data.session) throw error ?? new Error('No session returned from the callback.')
    return data.session
  } finally {
    try {
      localStorage.removeItem(persistentVerifierKey)
    } catch {
      // The verifier is already unusable after an exchange attempt.
    }
    try {
      await exchangeClient.auth.stopAutoRefresh()
    } catch {
      // Cleanup must not obscure the exchange result.
    }
  }
}

export default getSupabaseClient
