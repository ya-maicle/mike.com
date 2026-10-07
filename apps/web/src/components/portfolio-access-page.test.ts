// @vitest-environment jsdom
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PortfolioAccessPage } from './portfolio-access-page'
import type { PortfolioRequestState } from '@/lib/portfolio-request-model'
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true
const mocks = vi.hoisted(() => ({
  session: { access_token: 'verified', user: { id: 'visitor', email: 'visitor@example.test' } },
  state: { status: 'none', email: 'visitor@example.test', studies: [] } as PortfolioRequestState,
  submit: vi.fn(),
  router: { replace: vi.fn() },
  refresh: vi.fn(),
  capture: vi.fn(),
}))
vi.mock('next/navigation', () => ({ useRouter: () => mocks.router }))
vi.mock('./providers/auth-provider', () => ({
  useAuth: () => ({ session: mocks.session, loading: false }),
}))
vi.mock('./providers/portfolio-request-provider', () => ({
  usePortfolioRequest: () => ({
    state: mocks.state,
    checking: false,
    error: '',
    submit: mocks.submit,
    refresh: mocks.refresh,
  }),
}))
vi.mock('@/lib/analytics/client', () => ({ captureAnalyticsEvent: mocks.capture }))
vi.mock('./login-form', () => ({ LoginForm: () => null }))

describe('request continuation and portfolio status', () => {
  let root: Root
  let container: HTMLDivElement
  beforeEach(() => {
    vi.resetAllMocks()
    mocks.state = { status: 'none', email: 'visitor@example.test', studies: [] }
    window.history.replaceState({}, '', '/access')
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })
  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
  })
  async function render() {
    await act(async () =>
      root.render(
        React.createElement(React.StrictMode, {}, React.createElement(PortfolioAccessPage)),
      ),
    )
  }
  it('automatically saves an explicit verified continuation once and shows the review email', async () => {
    window.history.replaceState({}, '', '/access#request=encrypted-intent')
    mocks.submit.mockImplementation(async () => {
      mocks.state = { ...mocks.state, status: 'pending' }
      return mocks.state
    })
    await render()
    expect(mocks.submit).toHaveBeenCalledExactlyOnceWith({ intent: 'encrypted-intent' })
    expect(window.location.hash).toBe('')
    expect(mocks.router.replace).toHaveBeenCalledWith('/access', { scroll: false })
    expect(container.textContent).toContain('Your request is awaiting review')
    expect(container.textContent).toContain('email visitor@example.test')
    expect(container.querySelector('form')).toBeNull()
  })
  it('does not create a request on normal sign-in', async () => {
    await render()
    expect(mocks.submit).not.toHaveBeenCalled()
    expect(container.querySelector('[name="company"]')).not.toBeNull()
    expect(container.querySelector('[name="role"]')?.hasAttribute('required')).toBe(false)
    expect(container.querySelector('[name="reason"]')?.hasAttribute('required')).toBe(false)
  })
  it('keeps a failed continuation retryable without parallel or repeated submissions', async () => {
    window.history.replaceState({}, '', '/access#request=retry-intent')
    mocks.submit
      .mockRejectedValueOnce(new Error('Temporarily offline'))
      .mockImplementation(async () => {
        mocks.state = { ...mocks.state, status: 'pending' }
        return mocks.state
      })
    await render()
    expect(container.textContent).toContain('Temporarily offline')
    await act(async () =>
      Array.from(container.querySelectorAll('button'))
        .find((button) => button.textContent === 'Try saving again')!
        .click(),
    )
    expect(mocks.submit).toHaveBeenCalledTimes(2)
    expect(container.textContent).toContain('Your request is awaiting review')
  })
  it('shows approved work directly for a returning approved visitor', async () => {
    mocks.state = {
      ...mocks.state,
      status: 'approved',
      studies: [{ title: 'Shared case study', slug: 'shared-work' }],
    }
    await render()
    expect(container.textContent).toContain('Your portfolio access is approved')
    expect(container.querySelector('a[href="/work/shared-work"]')).not.toBeNull()
    expect(mocks.submit).not.toHaveBeenCalled()
    expect(container.querySelector('form')).toBeNull()
  })
})
