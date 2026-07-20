export const COOKIE_PREFERENCES_STORAGE_KEY = 'cookie-preferences'
export const COOKIE_PREFERENCES_VERSION = 1

export const COOKIE_CATEGORY_KEYS = ['analytics'] as const

export type CookieCategory = (typeof COOKIE_CATEGORY_KEYS)[number]
export type CookieChoices = Record<CookieCategory, boolean>

export interface CookiePreferences {
  version: number
  updatedAt: string
  choices: CookieChoices
}

export const DEFAULT_COOKIE_CHOICES: CookieChoices = {
  analytics: false,
}

export const OPTIONAL_STORAGE_MANIFEST = {
  analytics: {
    cookies: ['muxData'],
    localStorage: ['muxData'],
  },
} as const satisfies Record<
  CookieCategory,
  { cookies: readonly string[]; localStorage: readonly string[] }
>

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function createCookiePreferences(
  choices: CookieChoices,
  updatedAt = new Date().toISOString(),
): CookiePreferences {
  return {
    version: COOKIE_PREFERENCES_VERSION,
    updatedAt,
    choices: { ...choices },
  }
}

export function parseCookiePreferences(value: string | null): CookiePreferences | null {
  if (!value) return null

  try {
    const parsed: unknown = JSON.parse(value)
    if (!isRecord(parsed) || parsed.version !== COOKIE_PREFERENCES_VERSION) return null
    if (typeof parsed.updatedAt !== 'string' || Number.isNaN(Date.parse(parsed.updatedAt))) {
      return null
    }
    const parsedChoices = parsed.choices
    if (!isRecord(parsedChoices)) return null
    if (!COOKIE_CATEGORY_KEYS.every((key) => typeof parsedChoices[key] === 'boolean')) return null

    return {
      version: COOKIE_PREFERENCES_VERSION,
      updatedAt: parsed.updatedAt,
      choices: {
        analytics: parsedChoices.analytics as boolean,
      },
    }
  } catch {
    return null
  }
}

export function hasAnalyticsConsent(storage?: Pick<Storage, 'getItem'>): boolean {
  try {
    const selectedStorage = storage ?? (typeof window === 'undefined' ? null : window.localStorage)
    const preferences = selectedStorage
      ? parseCookiePreferences(selectedStorage.getItem(COOKIE_PREFERENCES_STORAGE_KEY))
      : null
    return preferences?.choices.analytics === true
  } catch {
    return false
  }
}

export function hasRevokedConsent(previous: CookieChoices, next: CookieChoices): boolean {
  return COOKIE_CATEGORY_KEYS.some((key) => previous[key] && !next[key])
}
