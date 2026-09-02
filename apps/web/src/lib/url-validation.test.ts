import { describe, expect, it } from 'vitest'

import { isValidReturnPath } from './url-validation'

describe('isValidReturnPath', () => {
  it.each(['/', '/work', '/work/example?tab=overview#results'])('accepts %s', (path) => {
    expect(isValidReturnPath(path)).toBe(true)
  })

  it.each([
    null,
    '',
    'https://example.com',
    '//example.com/path',
    '/\\example.com',
    '/login',
    '/login?next=/work',
    '/login/check-email',
    '/auth/callback',
    '/auth/confirm?auth_return_to=/work',
  ])('rejects auth loops and unsafe destination %s', (path) => {
    expect(isValidReturnPath(path)).toBe(false)
  })
})
