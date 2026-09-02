// @vitest-environment jsdom

import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MagicLinkSent } from './magic-link-sent'
import { MAGIC_LINK_REQUEST_STORAGE_KEY, createPendingMagicLinkRequest } from '@/lib/magic-link'
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

const mocks = vi.hoisted(() => ({
  capturePortfolioAccessStarted: vi.fn(),
  replace: vi.fn(),
  signInWithOtp: vi.fn(),
  stopAutoRefresh: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}))

vi.mock('@/lib/analytics/portfolio-access', () => ({
  capturePortfolioAccessStarted: mocks.capturePortfolioAccessStarted,
}))

vi.mock('@/lib/supabase', () => ({
  createSupabaseMagicLinkClient: () => ({
    auth: {
      signInWithOtp: mocks.signInWithOtp,
      stopAutoRefresh: mocks.stopAutoRefresh,
    },
  }),
}))

const NOW = Date.UTC(2026, 8, 2, 12)
const EMAIL = 'recruiter@example.com'
const RETURN_PATH = '/work/private-case-study'

describe('MagicLinkSent', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    sessionStorage.clear()
    mocks.capturePortfolioAccessStarted.mockReset().mockResolvedValue(undefined)
    mocks.replace.mockReset()
    mocks.signInWithOtp.mockReset().mockResolvedValue({ error: null })
    mocks.stopAutoRefresh.mockReset().mockResolvedValue(undefined)
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    sessionStorage.clear()
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  async function renderSentScreen() {
    await act(async () => {
      root.render(React.createElement(MagicLinkSent))
    })
  }

  function storeRequest(requestedAt = NOW) {
    sessionStorage.setItem(
      MAGIC_LINK_REQUEST_STORAGE_KEY,
      JSON.stringify(createPendingMagicLinkRequest(`  ${EMAIL}  `, RETURN_PATH, requestedAt)),
    )
  }

  function buttonNamed(name: string) {
    const button = Array.from(container.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === name,
    )
    expect(button, `Expected button named "${name}"`).toBeTruthy()
    return button as HTMLButtonElement
  }

  async function click(button: HTMLButtonElement) {
    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
  }

  it('renders the stored recipient, focuses the heading, and shows the resend countdown', async () => {
    storeRequest()

    await renderSentScreen()

    expect(container.textContent).toContain(`We sent a sign-in link to ${EMAIL}.`)
    expect(container.textContent).toContain('It works once and expires in 30 minutes')
    expect(container.textContent).toContain('spam or junk folder')
    expect(buttonNamed('Resend in 60s').disabled).toBe(true)
    expect(document.activeElement?.textContent).toBe('Check your email')
    expect(container.querySelector('[role="status"]')?.getAttribute('aria-live')).toBe('polite')
  })

  it.each([
    ['missing', null],
    ['corrupt', '{not valid json'],
  ])('renders a usable generic screen when pending state is %s', async (_label, storedValue) => {
    if (storedValue) sessionStorage.setItem(MAGIC_LINK_REQUEST_STORAGE_KEY, storedValue)

    await renderSentScreen()

    expect(container.textContent).toContain('We sent a sign-in link to your email address.')
    expect(container.textContent).not.toContain('Resend email')
    expect(buttonNamed('Use another sign-in method').disabled).toBe(false)

    if (storedValue) {
      expect(sessionStorage.getItem(MAGIC_LINK_REQUEST_STORAGE_KEY)).toBeNull()
    }
  })

  it('resends through a fragment-only confirmation URL and refreshes the request', async () => {
    storeRequest(NOW - 60_000)
    await renderSentScreen()

    await click(buttonNamed('Resend email'))

    const callbackUrl = new URL('/auth/confirm', window.location.origin)
    callbackUrl.hash = new URLSearchParams({ auth_return_to: RETURN_PATH }).toString()
    expect(mocks.signInWithOtp).toHaveBeenCalledOnce()
    expect(mocks.signInWithOtp).toHaveBeenCalledWith({
      email: EMAIL,
      options: {
        emailRedirectTo: callbackUrl.toString(),
        shouldCreateUser: true,
      },
    })
    expect(mocks.capturePortfolioAccessStarted).toHaveBeenCalledWith('magic_link', RETURN_PATH)
    expect(mocks.stopAutoRefresh).toHaveBeenCalledOnce()
    expect(container.textContent).toContain('We sent a new sign-in link to your email.')
    expect(buttonNamed('Resend in 60s').disabled).toBe(true)

    const refreshedRequest = JSON.parse(
      sessionStorage.getItem(MAGIC_LINK_REQUEST_STORAGE_KEY) ?? 'null',
    ) as ReturnType<typeof createPendingMagicLinkRequest> | null
    expect(refreshedRequest).toMatchObject({
      email: EMAIL,
      returnPath: RETURN_PATH,
      requestedAt: NOW,
      retryAt: NOW + 60_000,
    })
  })

  it('clears the pending request and replaces the route when another method is selected', async () => {
    storeRequest()
    await renderSentScreen()

    await click(buttonNamed('Use another sign-in method'))

    expect(sessionStorage.getItem(MAGIC_LINK_REQUEST_STORAGE_KEY)).toBeNull()
    expect(mocks.replace).toHaveBeenCalledOnce()
    expect(mocks.replace).toHaveBeenCalledWith('/login')
  })
})
