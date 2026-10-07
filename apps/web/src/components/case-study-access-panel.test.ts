// @vitest-environment jsdom
import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CaseStudyAccessPanel } from './case-study-access-panel'
import type { PortfolioRequestState } from '@/lib/portfolio-request-model'
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true
const mocks = vi.hoisted(() => ({
  auth: {
    session: null as null | { access_token: string; user: { email: string } },
    loading: false,
  },
  state: null as PortfolioRequestState | null,
  openLogin: vi.fn(),
  refresh: vi.fn(),
}))
vi.mock('@/components/providers/auth-provider', () => ({ useAuth: () => mocks.auth }))
vi.mock('@/components/providers/login-modal-provider', () => ({
  useLoginModal: () => ({ openLogin: mocks.openLogin }),
}))
vi.mock('@/components/providers/portfolio-request-provider', () => ({
  usePortfolioRequest: () => ({
    state: mocks.state,
    error: '',
    checking: false,
    refresh: mocks.refresh,
  }),
}))

describe('case-study entry into the portfolio request', () => {
  let container: HTMLDivElement
  let root: Root
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.auth.session = null
    mocks.state = null
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })
  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
  })
  async function render(visibility = 'recruiter') {
    await act(async () =>
      root.render(
        React.createElement(CaseStudyAccessPanel, { studySlug: 'private-work', visibility }),
      ),
    )
  }
  function signIn(status: PortfolioRequestState['status']) {
    mocks.auth.session = {
      access_token: 'verified-session',
      user: { email: 'reviewer@example.test' },
    }
    mocks.state = { status, email: 'reviewer@example.test', studies: [] }
  }
  it('takes new visitors directly to one combined portfolio form', async () => {
    await render()
    const link = Array.from(container.querySelectorAll('a')).find(
      (item) => item.textContent === 'Request portfolio access',
    )!
    expect(link.getAttribute('href')).toBe('/access')
    expect(mocks.openLogin).not.toHaveBeenCalled()
    expect(container.textContent).toContain('one request for the private portfolio')
    expect(container.querySelector('a[href="/access?signin=1"]')).not.toBeNull()
  })
  it('shows the existing pending request on any project without another form', async () => {
    signIn('pending')
    await render()
    expect(container.textContent).toContain('Your portfolio request is awaiting review')
    expect(container.textContent).toContain('reviewer@example.test')
    expect(container.querySelector('form')).toBeNull()
    expect(container.querySelector('a[href="/access"]')?.textContent).toBe('View portfolio access')
  })
  it.each(['blocked', 'declined', 'revoked'] as const)(
    'keeps %s visitors on the public path',
    async (status) => {
      signIn(status)
      await render()
      expect(container.querySelector('a[href="/access"]')).toBeNull()
      expect(container.querySelector('form')).toBeNull()
      expect(container.querySelector('a[href="/work?view=public"]')).not.toBeNull()
    },
  )
  it('explains separately shared work to an approved visitor', async () => {
    signIn('approved')
    await render()
    expect(container.textContent).toContain('This case study is shared separately')
    expect(container.textContent).not.toContain('Request portfolio access')
  })
  it('keeps ordinary member sign-in separate from an approval request', async () => {
    await render('members')
    await act(async () =>
      Array.from(container.querySelectorAll('button'))
        .find((button) => button.textContent === 'Sign in to read')!
        .click(),
    )
    expect(mocks.openLogin).toHaveBeenCalledWith({
      returnTo: '/work/private-work',
      entryPoint: 'case_study_gate',
    })
  })
})
