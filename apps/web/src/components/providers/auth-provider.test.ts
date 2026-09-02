// @vitest-environment jsdom

import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { AuthProvider, useAuth } from './auth-provider'
import { MAGIC_LINK_REQUEST_STORAGE_KEY } from '@/lib/magic-link'
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

const mocks = vi.hoisted(() => ({
  captureAnalyticsEvent: vi.fn(),
  consumePortfolioAccessContext: vi.fn(),
  createSupabaseMagicLinkClient: vi.fn(),
  exchangeSupabaseOAuthCode: vi.fn(),
  getSession: vi.fn(),
  getSupabaseClient: vi.fn(),
  mainSetSession: vi.fn(),
  mainSignOut: vi.fn(),
  onAuthStateChange: vi.fn(),
  transientSetSession: vi.fn(),
  transientSignOut: vi.fn(),
  transientStopAutoRefresh: vi.fn(),
  transientVerifyOtp: vi.fn(),
  unsubscribe: vi.fn(),
  upsertProfileFromUser: vi.fn(),
}))

vi.mock('@/lib/supabase', () => ({
  default: mocks.getSupabaseClient,
  createSupabaseMagicLinkClient: mocks.createSupabaseMagicLinkClient,
  exchangeSupabaseOAuthCode: mocks.exchangeSupabaseOAuthCode,
}))

vi.mock('@/lib/profile', () => ({
  upsertProfileFromUser: mocks.upsertProfileFromUser,
}))

vi.mock('@/lib/analytics/client', () => ({
  captureAnalyticsEvent: mocks.captureAnalyticsEvent,
  resetAnalyticsIdentity: vi.fn(),
}))

vi.mock('@/lib/analytics/portfolio-access', () => ({
  consumePortfolioAccessContext: mocks.consumePortfolioAccessContext,
}))

vi.mock('@/lib/analytics/events', () => ({
  requestedStudySlugFromPath: () => undefined,
}))

vi.mock('@/lib/portfolio-access-client', () => ({
  isCaseStudyPath: () => false,
  withAccessDenied: (path: string) => path,
}))

vi.mock('@/lib/auth-routes', () => ({
  isSensitiveAuthPath: (path: string) => path.startsWith('/auth/'),
}))

type AuthValue = ReturnType<typeof useAuth>
type AuthStateHandler = (event: AuthChangeEvent, session: Session | null) => void | Promise<void>

let latestAuth: AuthValue | null = null
let authStateHandler: AuthStateHandler | null = null

function AuthProbe() {
  latestAuth = useAuth()
  return null
}

function auth() {
  if (!latestAuth) throw new Error('AuthProvider has not rendered yet.')
  return latestAuth
}

function createMemoryStorage(): Storage {
  const values = new Map<string, string>()

  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => void values.delete(key),
    setItem: (key, value) => void values.set(key, value),
  }
}

function createSession(userId: string, email: string, tokenSuffix = userId): Session {
  return {
    access_token: `access-${tokenSuffix}`,
    refresh_token: `refresh-${tokenSuffix}`,
    expires_in: 3_600,
    token_type: 'bearer',
    user: {
      id: userId,
      aud: 'authenticated',
      email,
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {},
      created_at: '2026-09-02T00:00:00.000Z',
    },
  } as Session
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

describe('AuthProvider magic-link completion', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.clearAllMocks()
    latestAuth = null
    authStateHandler = null

    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
    window.history.replaceState({}, '', '/auth/confirm')

    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null })
    mocks.exchangeSupabaseOAuthCode.mockRejectedValue(new Error('Unexpected OAuth code exchange.'))
    mocks.mainSetSession.mockResolvedValue({ data: { session: null }, error: null })
    mocks.mainSignOut.mockResolvedValue({ error: null })
    mocks.transientSetSession.mockResolvedValue({ data: { session: null }, error: null })
    mocks.transientSignOut.mockResolvedValue({ error: null })
    mocks.transientStopAutoRefresh.mockResolvedValue(undefined)
    mocks.transientVerifyOtp.mockResolvedValue({ data: { session: null }, error: null })
    mocks.upsertProfileFromUser.mockResolvedValue(undefined)
    mocks.consumePortfolioAccessContext.mockReturnValue(null)

    mocks.onAuthStateChange.mockImplementation((handler: AuthStateHandler) => {
      authStateHandler = handler
      return { data: { subscription: { unsubscribe: mocks.unsubscribe } } }
    })
    mocks.getSupabaseClient.mockReturnValue({
      auth: {
        getSession: mocks.getSession,
        onAuthStateChange: mocks.onAuthStateChange,
        setSession: mocks.mainSetSession,
        signOut: mocks.mainSignOut,
      },
    })
    mocks.createSupabaseMagicLinkClient.mockReturnValue({
      auth: {
        setSession: mocks.transientSetSession,
        signOut: mocks.transientSignOut,
        stopAutoRefresh: mocks.transientStopAutoRefresh,
        verifyOtp: mocks.transientVerifyOtp,
      },
    })

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({}),
      }),
    )

    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    container.remove()
  })

  async function renderProvider() {
    await act(async () => {
      root.render(React.createElement(AuthProvider, null, React.createElement(AuthProbe)))
      await Promise.resolve()
    })
  }

  it('hydrates an ambient session on /auth/confirm without invoking post-login work', async () => {
    const existingSession = createSession('existing-user', 'existing@example.com')
    mocks.getSession.mockResolvedValue({ data: { session: existingSession }, error: null })

    await renderProvider()
    await act(async () => {
      await authStateHandler?.('INITIAL_SESSION', existingSession)
    })

    expect(auth().session).toBe(existingSession)
    expect(auth().user).toBe(existingSession.user)
    expect(mocks.upsertProfileFromUser).not.toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
    expect(mocks.captureAnalyticsEvent).not.toHaveBeenCalled()
  })

  it('adopts and processes the exact returned verification session once', async () => {
    const candidateSession = createSession('candidate-user', 'candidate@example.com')
    mocks.transientVerifyOtp.mockResolvedValue({
      data: { session: candidateSession },
      error: null,
    })
    mocks.mainSetSession.mockResolvedValue({ data: { session: candidateSession }, error: null })
    sessionStorage.setItem(MAGIC_LINK_REQUEST_STORAGE_KEY, 'pending')

    await renderProvider()

    let result: Awaited<ReturnType<AuthValue['completeMagicLink']>> | undefined
    await act(async () => {
      result = await auth().completeMagicLink({ kind: 'token_hash', tokenHash: 'one-time-token' })
      await Promise.resolve()
    })

    expect(result).toEqual({ status: 'complete' })
    expect(mocks.transientVerifyOtp).toHaveBeenCalledOnce()
    expect(mocks.transientVerifyOtp).toHaveBeenCalledWith({
      token_hash: 'one-time-token',
      type: 'email',
    })
    expect(mocks.mainSetSession).toHaveBeenCalledOnce()
    expect(mocks.mainSetSession).toHaveBeenCalledWith({
      access_token: candidateSession.access_token,
      refresh_token: candidateSession.refresh_token,
    })
    expect(auth().session).toBe(candidateSession)
    expect(auth().user).toBe(candidateSession.user)
    expect(mocks.upsertProfileFromUser).toHaveBeenCalledOnce()
    expect(mocks.upsertProfileFromUser).toHaveBeenCalledWith(candidateSession.user)
    expect(sessionStorage.getItem(MAGIC_LINK_REQUEST_STORAGE_KEY)).toBeNull()
  })

  it('deduplicates concurrent completion calls', async () => {
    const candidateSession = createSession('candidate-user', 'candidate@example.com')
    const verification = deferred<{
      data: { session: Session }
      error: null
    }>()
    mocks.transientVerifyOtp.mockReturnValue(verification.promise)
    mocks.mainSetSession.mockResolvedValue({ data: { session: candidateSession }, error: null })

    await renderProvider()

    let first!: ReturnType<AuthValue['completeMagicLink']>
    let second!: ReturnType<AuthValue['completeMagicLink']>
    await act(async () => {
      first = auth().completeMagicLink({ kind: 'token_hash', tokenHash: 'one-time-token' })
      second = auth().completeMagicLink({ kind: 'token_hash', tokenHash: 'one-time-token' })
      await Promise.resolve()
    })

    expect(second).toBe(first)
    expect(mocks.transientVerifyOtp).toHaveBeenCalledOnce()

    await act(async () => {
      verification.resolve({ data: { session: candidateSession }, error: null })
      await first
      await Promise.resolve()
    })

    expect(mocks.mainSetSession).toHaveBeenCalledOnce()
    expect(mocks.upsertProfileFromUser).toHaveBeenCalledOnce()
  })

  it('compares against a session that changes while verification is pending', async () => {
    const newerSession = createSession('newer-user', 'newer@example.com')
    const candidateSession = createSession('candidate-user', 'candidate@example.com')
    const verification = deferred<{
      data: { session: Session }
      error: null
    }>()
    mocks.transientVerifyOtp.mockReturnValue(verification.promise)

    await renderProvider()

    let completion!: ReturnType<AuthValue['completeMagicLink']>
    await act(async () => {
      completion = auth().completeMagicLink({
        kind: 'token_hash',
        tokenHash: 'one-time-token',
      })
      await Promise.resolve()
    })

    mocks.getSession.mockResolvedValue({ data: { session: newerSession }, error: null })

    let result: Awaited<ReturnType<AuthValue['completeMagicLink']>> | undefined
    await act(async () => {
      verification.resolve({ data: { session: candidateSession }, error: null })
      result = await completion
    })

    expect(result).toEqual({
      status: 'switch_required',
      currentEmail: 'newer@example.com',
      candidateEmail: 'candidate@example.com',
    })
    expect(mocks.mainSetSession).not.toHaveBeenCalled()
    expect(mocks.upsertProfileFromUser).not.toHaveBeenCalled()
  })

  it('requires explicit confirmation before switching away from a different ambient user', async () => {
    const existingSession = createSession('existing-user', 'existing@example.com')
    const candidateSession = createSession('candidate-user', 'candidate@example.com')
    mocks.getSession.mockResolvedValue({ data: { session: existingSession }, error: null })
    mocks.transientVerifyOtp.mockResolvedValue({
      data: { session: candidateSession },
      error: null,
    })
    mocks.mainSetSession.mockResolvedValue({ data: { session: candidateSession }, error: null })

    await renderProvider()

    let completionResult: Awaited<ReturnType<AuthValue['completeMagicLink']>> | undefined
    await act(async () => {
      completionResult = await auth().completeMagicLink({
        kind: 'token_hash',
        tokenHash: 'other-account-token',
      })
    })

    expect(completionResult).toEqual({
      status: 'switch_required',
      currentEmail: 'existing@example.com',
      candidateEmail: 'candidate@example.com',
    })
    expect(auth().session).toBe(existingSession)
    expect(auth().user).toBe(existingSession.user)
    expect(mocks.mainSetSession).not.toHaveBeenCalled()
    expect(mocks.upsertProfileFromUser).not.toHaveBeenCalled()

    let switchResult: Awaited<ReturnType<AuthValue['confirmMagicLinkSwitch']>> | undefined
    await act(async () => {
      switchResult = await auth().confirmMagicLinkSwitch()
      await Promise.resolve()
    })

    expect(switchResult).toEqual({ status: 'complete' })
    expect(mocks.mainSetSession).toHaveBeenCalledOnce()
    expect(mocks.mainSetSession).toHaveBeenCalledWith({
      access_token: candidateSession.access_token,
      refresh_token: candidateSession.refresh_token,
    })
    expect(auth().session).toBe(candidateSession)
    expect(auth().user).toBe(candidateSession.user)
    expect(mocks.upsertProfileFromUser).toHaveBeenCalledOnce()
    expect(mocks.upsertProfileFromUser).toHaveBeenCalledWith(candidateSession.user)
  })

  it('isolates an OAuth code candidate until the current account is checked', async () => {
    const existingSession = createSession('existing-user', 'existing@example.com')
    const candidateSession = createSession('candidate-user', 'candidate@example.com')
    const navigationError = vi.spyOn(console, 'error').mockImplementation(() => {})
    window.history.replaceState({}, '', '/?code=oauth-code')
    mocks.getSession.mockResolvedValue({ data: { session: existingSession }, error: null })
    mocks.exchangeSupabaseOAuthCode.mockResolvedValue(candidateSession)

    await renderProvider()
    await act(async () => {
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
    })

    expect(mocks.exchangeSupabaseOAuthCode).toHaveBeenCalledWith('oauth-code')
    expect(mocks.mainSetSession).not.toHaveBeenCalled()
    expect(mocks.transientSetSession).toHaveBeenCalledWith({
      access_token: candidateSession.access_token,
      refresh_token: candidateSession.refresh_token,
    })
    expect(mocks.transientSignOut).toHaveBeenCalledWith({ scope: 'local' })
    expect(auth().session).toBe(existingSession)
    navigationError.mockRestore()
  })

  it('discards an isolated OAuth candidate if the provider unmounts during exchange', async () => {
    const candidateSession = createSession('candidate-user', 'candidate@example.com')
    const exchange = deferred<Session>()
    window.history.replaceState({}, '', '/?code=oauth-code')
    mocks.exchangeSupabaseOAuthCode.mockReturnValue(exchange.promise)

    await renderProvider()
    await act(async () => root.unmount())
    await act(async () => {
      exchange.resolve(candidateSession)
      await exchange.promise
      await Promise.resolve()
    })

    expect(mocks.mainSetSession).not.toHaveBeenCalled()
    expect(mocks.transientSetSession).toHaveBeenCalledWith({
      access_token: candidateSession.access_token,
      refresh_token: candidateSession.refresh_token,
    })
    expect(mocks.transientSignOut).toHaveBeenCalledWith({ scope: 'local' })
  })
})
