// @vitest-environment jsdom

import * as React from 'react'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginPageGuard } from './login-page-guard'
;(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true

const authState = vi.hoisted(() => ({
  loading: true,
  user: null as { id: string } | null,
}))
const replace = vi.hoisted(() => vi.fn())

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

vi.mock('@/components/providers/auth-provider', () => ({
  useAuth: () => authState,
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
}))

describe('LoginPageGuard', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    authState.loading = true
    authState.user = null
    replace.mockReset()
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(),
    })
    container = document.createElement('div')
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => root.unmount())
    container.remove()
  })

  async function renderGuard() {
    await act(async () => {
      root.render(
        React.createElement(LoginPageGuard, null, React.createElement('div', null, 'Login form')),
      )
    })
  }

  it('does not show the login form while the session is loading', async () => {
    await renderGuard()

    expect(container.innerHTML).toBe('')
    expect(replace).not.toHaveBeenCalled()
  })

  it('shows the login form to logged-out visitors', async () => {
    authState.loading = false

    await renderGuard()

    expect(container.textContent).toContain('Login form')
    expect(replace).not.toHaveBeenCalled()
  })

  it('replaces /login with the home page for signed-in visitors', async () => {
    authState.loading = false
    authState.user = { id: 'user-1' }

    await renderGuard()

    expect(container.innerHTML).toBe('')
    expect(replace).toHaveBeenCalledOnce()
    expect(replace).toHaveBeenCalledWith('/')
  })

  it('returns signed-in visitors to a remembered safe path', async () => {
    authState.loading = false
    authState.user = { id: 'user-1' }
    localStorage.setItem('auth-return-url', '/work/private?tab=overview')

    await renderGuard()

    expect(replace).toHaveBeenCalledWith('/work/private?tab=overview')
  })
})
