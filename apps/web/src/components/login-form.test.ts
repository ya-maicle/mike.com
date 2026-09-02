// @vitest-environment jsdom

import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { LoginForm } from './login-form'
import { MAGIC_LINK_REQUEST_STORAGE_KEY, MAGIC_LINK_SENT_PATH } from '@/lib/magic-link'
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

const mocks = vi.hoisted(() => ({
  captureStarted: vi.fn().mockResolvedValue(undefined),
  push: vi.fn(),
  signInWithOAuth: vi.fn(),
  signInWithOtp: vi.fn(),
  stopAutoRefresh: vi.fn(),
}))

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

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
}))

vi.mock('@/lib/analytics/portfolio-access', () => ({
  capturePortfolioAccessStarted: mocks.captureStarted,
}))

vi.mock('@/lib/supabase', () => ({
  default: () => ({
    auth: {
      signInWithOAuth: mocks.signInWithOAuth,
    },
  }),
  createSupabaseMagicLinkClient: () => ({
    auth: {
      signInWithOtp: mocks.signInWithOtp,
      stopAutoRefresh: mocks.stopAutoRefresh,
    },
  }),
}))

describe('LoginForm magic-link flow', () => {
  let container: HTMLDivElement
  let root: Root
  let consoleError: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    mocks.captureStarted.mockClear()
    mocks.push.mockReset()
    mocks.signInWithOAuth.mockReset()
    mocks.signInWithOtp.mockReset()
    mocks.stopAutoRefresh.mockReset().mockResolvedValue(undefined)
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
    window.history.replaceState({}, '', '/login')
    consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    consoleError.mockRestore()
    container.remove()
  })

  async function renderForm(onMagicLinkSent = vi.fn()) {
    await act(async () => {
      root.render(
        React.createElement(LoginForm, {
          presentation: 'page',
          onMagicLinkSent,
        }),
      )
    })
    return onMagicLinkSent
  }

  async function enterEmailAndSubmit(email: string) {
    const input = container.querySelector<HTMLInputElement>('input[type="email"]')!
    const form = container.querySelector<HTMLFormElement>('form')!
    const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set

    await act(async () => {
      valueSetter?.call(input, email)
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
      await Promise.resolve()
    })
  }

  it('stores a short-lived request and opens the check-email page after a successful send', async () => {
    mocks.signInWithOtp.mockResolvedValue({ error: null })
    localStorage.setItem('auth-return-url', '/work/private?tab=overview')
    const onMagicLinkSent = await renderForm()

    await enterEmailAndSubmit('  person@example.com  ')

    expect(mocks.signInWithOtp).toHaveBeenCalledOnce()
    const signInRequest = mocks.signInWithOtp.mock.calls[0]?.[0] as {
      email: string
      options: { emailRedirectTo: string; shouldCreateUser: boolean }
    }
    const callbackUrl = new URL(signInRequest.options.emailRedirectTo)

    expect(signInRequest).toMatchObject({
      email: 'person@example.com',
      options: {
        shouldCreateUser: true,
      },
    })
    expect(callbackUrl.origin).toBe(window.location.origin)
    expect(callbackUrl.pathname).toBe('/auth/confirm')
    expect(callbackUrl.search).toBe('')
    expect(new URLSearchParams(callbackUrl.hash.slice(1)).get('auth_return_to')).toBe(
      '/work/private?tab=overview',
    )
    expect(mocks.stopAutoRefresh).toHaveBeenCalledOnce()
    expect(
      JSON.parse(sessionStorage.getItem(MAGIC_LINK_REQUEST_STORAGE_KEY) ?? '{}'),
    ).toMatchObject({
      email: 'person@example.com',
      returnPath: '/work/private?tab=overview',
    })
    expect(mocks.captureStarted).toHaveBeenCalledWith('magic_link', '/work/private?tab=overview')
    expect(onMagicLinkSent).toHaveBeenCalledOnce()
    expect(mocks.push).toHaveBeenCalledWith(MAGIC_LINK_SENT_PATH)
  })

  it('shows a friendly rate-limit error without leaving the form', async () => {
    mocks.signInWithOtp.mockResolvedValue({
      error: {
        message: 'For security purposes, you can only request this after 60 seconds.',
        status: 429,
      },
    })
    await renderForm()

    await enterEmailAndSubmit('person@example.com')

    expect(container.textContent).toContain(
      'Please wait a minute before requesting another sign-in link.',
    )
    expect(mocks.push).not.toHaveBeenCalled()
    expect(sessionStorage.getItem(MAGIC_LINK_REQUEST_STORAGE_KEY)).toBeNull()
    expect(mocks.stopAutoRefresh).toHaveBeenCalledOnce()
  })

  it('announces email-send progress while the request is pending', async () => {
    let resolveSend!: (value: { error: null }) => void
    mocks.signInWithOtp.mockReturnValue(
      new Promise((resolve) => {
        resolveSend = resolve
      }),
    )
    await renderForm()

    await enterEmailAndSubmit('person@example.com')

    expect(container.querySelector('form')?.getAttribute('aria-busy')).toBe('true')
    const status = container.querySelector('[role="status"]')
    expect(status?.textContent).toContain('Sending your sign-in link')
    expect(container.querySelector('form')?.contains(status ?? null)).toBe(false)

    await act(async () => {
      resolveSend({ error: null })
      await Promise.resolve()
    })
  })
})
