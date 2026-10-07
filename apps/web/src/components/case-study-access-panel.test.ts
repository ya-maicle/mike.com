// @vitest-environment jsdom
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CaseStudyAccessPanel } from './case-study-access-panel'
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true
const mocks = vi.hoisted(() => ({
  auth: {
    session: null as null | { access_token: string; user: { email: string } },
    loading: false,
  },
  openLogin: vi.fn(),
  fetch: vi.fn(),
  capture: vi.fn(),
}))
vi.mock('@/components/providers/auth-provider', () => ({ useAuth: () => mocks.auth }))
vi.mock('@/components/providers/login-modal-provider', () => ({
  useLoginModal: () => ({ openLogin: mocks.openLogin }),
}))
vi.mock('@/lib/analytics/client', () => ({ captureAnalyticsEvent: mocks.capture }))

describe('continuous access-request flow', () => {
  let container: HTMLDivElement
  let root: Root
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.session = null
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ status: 'none' }) })
    vi.stubGlobal('fetch', mocks.fetch)
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })
  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
    vi.unstubAllGlobals()
  })
  async function render(visibility = 'recruiter') {
    await act(async () =>
      root.render(
        React.createElement(CaseStudyAccessPanel, { studySlug: 'private-work', visibility }),
      ),
    )
  }
  function signIn() {
    mocks.auth.session = {
      access_token: 'verified-session',
      user: { email: 'reviewer@example.test' },
    }
  }
  it('continues directly from sign-in to the form, then confirms a saved request', async () => {
    await render()
    const start = Array.from(container.querySelectorAll('button')).find(
      (b) => b.textContent === 'Request access',
    )!
    await act(async () => start.click())
    expect(mocks.openLogin).toHaveBeenCalledWith({
      returnTo: '/work/private-work#request-access',
      entryPoint: 'case_study_gate',
      requestAccess: true,
    })
    signIn()
    await render()
    expect(container.querySelector('#access-company')).not.toBeNull()
    expect(
      Array.from(container.querySelectorAll('button')).some(
        (b) => b.textContent === 'Request access',
      ),
    ).toBe(false)
    for (const [name, value] of Object.entries({
      company: 'Example',
      role: 'Recruiter',
      reason: 'Reviewing design work for a role.',
    })) {
      const input = container.querySelector<HTMLInputElement>(`[name="${name}"]`)!
      input.value = value
    }
    mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ status: 'pending' }) })
    await act(async () =>
      container
        .querySelector('form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
    )
    expect(container.textContent).toContain('Your request is awaiting review')
    expect(container.querySelector('form')).toBeNull()
    expect(mocks.fetch).toHaveBeenLastCalledWith(
      '/api/portfolio-access/request',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          studySlug: 'private-work',
          company: 'Example',
          role: 'Recruiter',
          reason: 'Reviewing design work for a role.',
        }),
      }),
    )
  })
  it.each(['none', 'expired'])(
    'shows the form immediately to a signed-in visitor with %s access',
    async (status) => {
      signIn()
      mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ status }) })
      await render()
      expect(container.querySelector('form')).not.toBeNull()
    },
  )
  it.each(['pending', 'blocked', 'declined', 'approved', 'available'])(
    'does not reopen the form for %s requests',
    async (status) => {
      signIn()
      mocks.fetch.mockResolvedValue({ ok: true, json: async () => ({ status }) })
      await render()
      expect(container.querySelector('form')).toBeNull()
    },
  )
  it('does not ask members-only visitors to request approval', async () => {
    signIn()
    await render('members')
    expect(container.querySelector('form')).toBeNull()
  })
})
