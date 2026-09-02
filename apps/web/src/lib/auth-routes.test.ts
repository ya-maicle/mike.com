import { describe, expect, it } from 'vitest'

import { isLoginPath, isSensitiveAuthPath, isStandaloneAuthPath } from './auth-routes'

describe('auth routes', () => {
  it.each(['/login', '/login/check-email', '/login/'])(
    'recognises %s as a login path',
    (pathname) => {
      expect(isLoginPath(pathname)).toBe(true)
      expect(isStandaloneAuthPath(pathname)).toBe(true)
    },
  )

  it.each(['/auth', '/auth/confirm', '/auth/future-entry'])(
    'keeps %s outside site chrome and analytics',
    (pathname) => {
      expect(isSensitiveAuthPath(pathname)).toBe(true)
      expect(isStandaloneAuthPath(pathname)).toBe(true)
    },
  )

  it.each(['/login-help', '/authentication', '/work'])('does not overmatch %s', (pathname) => {
    expect(isStandaloneAuthPath(pathname)).toBe(false)
  })
})
