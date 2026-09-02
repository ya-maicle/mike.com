// @vitest-environment jsdom

import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MagicLinkConfirmation } from './magic-link-confirmation'
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

const authActions = vi.hoisted(() => ({
  completeMagicLink: vi.fn(),
  confirmMagicLinkSwitch: vi.fn(),
  cancelMagicLinkSwitch: vi.fn(),
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

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

vi.mock('@/components/providers/auth-provider', () => ({
  useAuth: () => authActions,
}))

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: React.ComponentProps<'a'>) =>
    React.createElement('a', { href, ...props }, children),
}))

describe('MagicLinkConfirmation', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    authActions.completeMagicLink.mockReset().mockResolvedValue({ status: 'complete' })
    authActions.confirmMagicLinkSwitch.mockReset().mockResolvedValue({ status: 'complete' })
    authActions.cancelMagicLinkSwitch.mockReset().mockResolvedValue(undefined)
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
    window.history.replaceState({}, '', '/')
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    vi.useRealTimers()
    vi.restoreAllMocks()
    container.remove()
  })

  async function renderAt(url: string) {
    window.history.replaceState({}, '', url)
    const replaceState = vi.spyOn(window.history, 'replaceState')

    await act(async () => {
      root.render(React.createElement(MagicLinkConfirmation))
    })

    return replaceState
  }

  function buttonNamed(name: string) {
    const button = Array.from(container.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === name,
    )
    if (!button) throw new Error(`Unable to find button named "${name}".`)
    return button
  }

  async function click(button: Element) {
    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
  }

  it('immediately strips the secret fragment and preserves its safe return path', async () => {
    const replaceState = await renderAt(
      '/auth/confirm#auth_return_to=%2Fwork%2Fexample%3Ftab%3Dresult&token_hash=one-time-secret&type=email',
    )

    expect(window.location.pathname).toBe('/auth/confirm')
    expect(window.location.search).toBe('')
    expect(window.location.hash).toBe('')
    expect(window.localStorage.getItem('auth-return-url')).toBe('/work/example?tab=result')
    expect(replaceState).toHaveBeenCalledOnce()
    expect(String(replaceState.mock.calls[0]?.[2])).not.toContain('one-time-secret')
    expect(container.textContent).toContain('Finish signing in')
    expect(authActions.completeMagicLink).not.toHaveBeenCalled()
  })

  it('confirms a token hash only after the explicit action', async () => {
    await renderAt('/auth/confirm#token_hash=one-time-secret&type=email')

    expect(authActions.completeMagicLink).not.toHaveBeenCalled()
    await click(buttonNamed('Continue to mikeiu.com'))

    expect(authActions.completeMagicLink).toHaveBeenCalledOnce()
    expect(authActions.completeMagicLink).toHaveBeenCalledWith({
      kind: 'token_hash',
      tokenHash: 'one-time-secret',
    })
    expect(container.textContent).toContain('You’re signed in')
    expect((buttonNamed('Redirecting…') as HTMLButtonElement).disabled).toBe(true)
  })

  it('keeps waiting beyond the former failure timeout and still completes successfully', async () => {
    vi.useFakeTimers()
    const completion = createDeferred<{ status: 'complete' }>()
    authActions.completeMagicLink.mockReturnValue(completion.promise)
    await renderAt('/auth/confirm#token_hash=slow-secret&type=email')

    await click(buttonNamed('Continue to mikeiu.com'))

    await act(async () => {
      vi.advanceTimersByTime(20_000)
    })

    expect(container.textContent).toContain('This is taking longer than usual')
    expect(container.textContent).not.toContain('This sign-in didn’t work')
    expect(authActions.completeMagicLink).toHaveBeenCalledOnce()

    await act(async () => {
      completion.resolve({ status: 'complete' })
      await completion.promise
    })

    expect(container.textContent).toContain('You’re signed in')
  })

  it('offers recovery immediately when completion fails', async () => {
    authActions.completeMagicLink.mockResolvedValue({ status: 'error' })
    await renderAt('/auth/confirm#token_hash=expired-secret&type=email')

    await click(buttonNamed('Continue to mikeiu.com'))

    expect(container.textContent).toContain('This sign-in didn’t work')
    expect(container.querySelector('a[href="/login"]')?.textContent).toContain('Request a new link')
  })

  it('deduplicates rapid confirmation clicks at the action boundary', async () => {
    const completion = createDeferred<{ status: 'complete' }>()
    authActions.completeMagicLink.mockReturnValue(completion.promise)
    await renderAt('/auth/confirm#token_hash=one-time-secret&type=email')
    const button = buttonNamed('Continue to mikeiu.com')

    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })

    expect(authActions.completeMagicLink).toHaveBeenCalledOnce()

    await act(async () => {
      completion.resolve({ status: 'complete' })
      await completion.promise
    })
  })

  it('automatically adopts an old-template implicit session once and cleans the URL', async () => {
    await renderAt(
      '/auth/confirm#auth_return_to=%2Fwork%2Fexample#access_token=legacy-access&refresh_token=legacy-refresh&type=bearer',
    )

    expect(authActions.completeMagicLink).toHaveBeenCalledOnce()
    expect(authActions.completeMagicLink).toHaveBeenCalledWith({
      kind: 'legacy_tokens',
      accessToken: 'legacy-access',
      refreshToken: 'legacy-refresh',
    })
    expect(window.location.search).toBe('')
    expect(window.localStorage.getItem('auth-return-url')).toBe('/work/example')
    expect(container.textContent).toContain('You’re signed in')
  })

  it('requires an explicit choice before switching accounts', async () => {
    authActions.completeMagicLink.mockResolvedValue({
      status: 'switch_required',
      currentEmail: 'current@example.com',
      candidateEmail: 'candidate@example.com',
    })
    await renderAt('/auth/confirm#token_hash=other-account-secret&type=email')

    await click(buttonNamed('Continue to mikeiu.com'))

    expect(container.textContent).toContain('Switch accounts?')
    expect(container.textContent).toContain('current@example.com')
    expect(container.textContent).toContain('candidate@example.com')
    expect(authActions.confirmMagicLinkSwitch).not.toHaveBeenCalled()
    expect(authActions.cancelMagicLinkSwitch).not.toHaveBeenCalled()

    await click(buttonNamed('Switch to this account'))

    expect(authActions.confirmMagicLinkSwitch).toHaveBeenCalledOnce()
    expect(container.textContent).toContain('You’re signed in')
  })

  it('discards the candidate only after the user keeps the current account', async () => {
    authActions.completeMagicLink.mockResolvedValue({
      status: 'switch_required',
      currentEmail: 'current@example.com',
      candidateEmail: 'candidate@example.com',
    })
    const cancellation = createDeferred<void>()
    authActions.cancelMagicLinkSwitch.mockReturnValue(cancellation.promise)
    await renderAt('/auth/confirm#token_hash=other-account-secret&type=email')
    await click(buttonNamed('Continue to mikeiu.com'))

    await click(buttonNamed('Keep current account'))

    expect(authActions.cancelMagicLinkSwitch).toHaveBeenCalledOnce()
    expect(container.textContent).toContain('Keeping your account')
    expect((buttonNamed('Keeping current account…') as HTMLButtonElement).disabled).toBe(true)
    expect(container.textContent).not.toContain('Switch to this account')
  })

  it('offers recovery for a missing or invalid credential', async () => {
    await renderAt('/auth/confirm#token_hash=secret&type=magiclink')

    expect(container.textContent).toContain('This sign-in didn’t work')
    expect(authActions.completeMagicLink).not.toHaveBeenCalled()
    expect(container.querySelector('a[href="/login"]')).not.toBeNull()
  })

  it('accepts a new email link opened in the same tab after an error', async () => {
    await renderAt('/auth/confirm')
    expect(container.textContent).toContain('This sign-in didn’t work')

    await act(async () => {
      window.history.replaceState(
        {},
        '',
        '/auth/confirm#auth_return_to=%2Fwork&token_hash=fresh-secret&type=email',
      )
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })

    expect(window.location.hash).toBe('')
    expect(window.localStorage.getItem('auth-return-url')).toBe('/work')
    expect(container.textContent).toContain('Finish signing in')
    expect(authActions.completeMagicLink).not.toHaveBeenCalled()
  })
})
