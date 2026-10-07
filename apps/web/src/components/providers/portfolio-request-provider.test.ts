// @vitest-environment jsdom
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PortfolioRequestProvider, usePortfolioRequest } from './portfolio-request-provider'
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true
const mocks = vi.hoisted(() => ({
  session: { access_token: 'token', user: { id: 'visitor' } } as {
    access_token: string
    user: { id: string }
  } | null,
  router: { refresh: vi.fn() },
  fetch: vi.fn(),
}))
vi.mock('./auth-provider', () => ({ useAuth: () => ({ session: mocks.session }) }))
vi.mock('next/navigation', () => ({ useRouter: () => mocks.router }))
function Status() {
  const { state, error } = usePortfolioRequest()
  return React.createElement('p', {}, error || state?.status || 'loading')
}
const state = { email: 'visitor@example.test', studies: [] }
function response(status: string) {
  return { ok: true, json: async () => ({ ...state, status }) }
}
describe('live shared request status', () => {
  let root: Root
  let container: HTMLDivElement
  beforeEach(() => {
    vi.resetAllMocks()
    vi.useFakeTimers()
    mocks.session = { access_token: 'token', user: { id: 'visitor' } }
    vi.stubGlobal('fetch', mocks.fetch)
    mocks.fetch.mockResolvedValue(response('pending'))
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })
  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })
  async function render() {
    await act(async () =>
      root.render(React.createElement(PortfolioRequestProvider, null, React.createElement(Status))),
    )
  }
  it('refreshes server gates when approval arrives and keeps unchanged polls quiet', async () => {
    await render()
    expect(container.textContent).toBe('pending')
    expect(mocks.router.refresh).toHaveBeenCalledTimes(1)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })
    expect(mocks.router.refresh).toHaveBeenCalledTimes(1)
    mocks.fetch.mockResolvedValue(response('approved'))
    await act(async () => {
      window.dispatchEvent(new Event('focus'))
      await Promise.resolve()
    })
    expect(container.textContent).toBe('approved')
    expect(mocks.router.refresh).toHaveBeenCalledTimes(2)
    expect(mocks.fetch).toHaveBeenLastCalledWith(
      '/api/portfolio-access/request',
      expect.objectContaining({ headers: { Authorization: 'Bearer token' }, cache: 'no-store' }),
    )
  })
  it('drops the previous account’s status when signing out', async () => {
    await render()
    mocks.session = null
    await render()
    expect(container.textContent).toBe('loading')
    expect(mocks.fetch).toHaveBeenCalledTimes(1)
  })
  it('shows live-check failures without granting or submitting anything', async () => {
    mocks.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'We could not check your access.' }),
    })
    await render()
    expect(container.textContent).toBe('We could not check your access.')
    expect(mocks.router.refresh).not.toHaveBeenCalled()
  })
})
