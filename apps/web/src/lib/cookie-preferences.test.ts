import { describe, expect, it } from 'vitest'
import {
  COOKIE_PREFERENCES_STORAGE_KEY,
  COOKIE_PREFERENCES_VERSION,
  createCookiePreferences,
  hasAnalyticsConsent,
  hasRevokedConsent,
  parseCookiePreferences,
} from './cookie-preferences'

const updatedAt = '2026-07-20T12:00:00.000Z'

describe('cookie preferences', () => {
  it('fails closed when the preference is missing, corrupt, or outdated', () => {
    expect(parseCookiePreferences(null)).toBeNull()
    expect(parseCookiePreferences('{bad json')).toBeNull()
    expect(
      parseCookiePreferences(
        JSON.stringify({
          version: COOKIE_PREFERENCES_VERSION + 1,
          updatedAt,
          choices: { analytics: true },
        }),
      ),
    ).toBeNull()
  })

  it('rejects incomplete or incorrectly typed choices', () => {
    expect(
      parseCookiePreferences(
        JSON.stringify({ version: COOKIE_PREFERENCES_VERSION, updatedAt, choices: {} }),
      ),
    ).toBeNull()
    expect(
      parseCookiePreferences(
        JSON.stringify({
          version: COOKIE_PREFERENCES_VERSION,
          updatedAt,
          choices: { analytics: 'yes' },
        }),
      ),
    ).toBeNull()
  })

  it('creates and parses a versioned preference record', () => {
    const preferences = createCookiePreferences({ analytics: true }, updatedAt)

    expect(parseCookiePreferences(JSON.stringify(preferences))).toEqual(preferences)
  })

  it('only reports analytics consent for a valid explicit opt-in', () => {
    const optedIn = createCookiePreferences({ analytics: true }, updatedAt)
    const storage = {
      getItem: (key: string) =>
        key === COOKIE_PREFERENCES_STORAGE_KEY ? JSON.stringify(optedIn) : null,
    }

    expect(hasAnalyticsConsent(storage)).toBe(true)
    expect(hasAnalyticsConsent({ getItem: () => '{invalid' })).toBe(false)
    expect(hasAnalyticsConsent({ getItem: () => null })).toBe(false)
    expect(
      hasAnalyticsConsent({
        getItem: () => {
          throw new Error('Storage unavailable')
        },
      }),
    ).toBe(false)
  })

  it('detects optional consent being withdrawn', () => {
    expect(hasRevokedConsent({ analytics: true }, { analytics: false })).toBe(true)
    expect(hasRevokedConsent({ analytics: false }, { analytics: true })).toBe(false)
    expect(hasRevokedConsent({ analytics: false }, { analytics: false })).toBe(false)
  })
})
