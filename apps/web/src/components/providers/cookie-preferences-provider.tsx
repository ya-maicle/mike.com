'use client'

import * as React from 'react'
import { ConsentAwareAnalytics } from '@/components/consent-aware-analytics'
import { CookieConsentPrompt } from '@/components/cookie-consent-prompt'
import { CookiePreferencesDialog } from '@/components/cookie-preferences-dialog'
import { useMobileNavigation } from '@/components/providers/mobile-navigation-provider'
import { clearPostHogPersistence, isDoNotTrackEnabled } from '@/lib/analytics/client'
import {
  COOKIE_PREFERENCES_STORAGE_KEY,
  DEFAULT_COOKIE_CHOICES,
  OPTIONAL_STORAGE_MANIFEST,
  createCookiePreferences,
  hasRevokedConsent,
  parseCookiePreferences,
  type CookieChoices,
} from '@/lib/cookie-preferences'

interface CookiePreferencesContextValue {
  analyticsEnabled: boolean
  openPreferences: () => void
}

const CookiePreferencesContext = React.createContext<CookiePreferencesContextValue | undefined>(
  undefined,
)

function clearDisabledCategoryData(choices: CookieChoices) {
  if (!choices.analytics) clearPostHogPersistence()

  for (const [category, storage] of Object.entries(OPTIONAL_STORAGE_MANIFEST)) {
    if (choices[category as keyof CookieChoices]) continue

    for (const cookieName of storage.cookies) {
      try {
        document.cookie = `${encodeURIComponent(cookieName)}=; Max-Age=0; Path=/; SameSite=Lax`
      } catch {
        // Cookie access is already blocked, which is an acceptable disabled state.
      }
    }
    for (const storageKey of storage.localStorage) {
      try {
        localStorage.removeItem(storageKey)
      } catch {
        // Optional storage is already inaccessible, which is an acceptable disabled state.
      }
    }
  }
}

function effectiveTrackingChoices(choices: CookieChoices): CookieChoices {
  return isDoNotTrackEnabled() ? { ...choices, analytics: false } : choices
}

export function CookiePreferencesProvider({ children }: { children: React.ReactNode }) {
  const { open: mobileNavigationOpen } = useMobileNavigation()
  const [choices, setChoices] = React.useState<CookieChoices>(DEFAULT_COOKIE_CHOICES)
  const [dntEnabled, setDntEnabled] = React.useState(false)
  const [ready, setReady] = React.useState(false)
  const [hasSavedPreferences, setHasSavedPreferences] = React.useState(false)
  const [open, setOpen] = React.useState(false)
  const [saveError, setSaveError] = React.useState<string>()
  const choicesRef = React.useRef(choices)

  React.useEffect(() => {
    let saved = null
    try {
      saved = parseCookiePreferences(localStorage.getItem(COOKIE_PREFERENCES_STORAGE_KEY))
    } catch {
      // Storage failures intentionally fall back to all optional categories off.
    }

    const initialChoices = saved?.choices ?? DEFAULT_COOKIE_CHOICES
    const initialDntEnabled = isDoNotTrackEnabled()
    clearDisabledCategoryData(effectiveTrackingChoices(initialChoices))
    choicesRef.current = initialChoices
    setChoices(initialChoices)
    setDntEnabled(initialDntEnabled)
    setHasSavedPreferences(saved !== null)
    setReady(true)

    function handleStorage(event: StorageEvent) {
      if (event.key !== COOKIE_PREFERENCES_STORAGE_KEY) return

      const nextPreferences = parseCookiePreferences(event.newValue)
      const nextChoices = nextPreferences?.choices ?? DEFAULT_COOKIE_CHOICES
      const nextDntEnabled = isDoNotTrackEnabled()
      clearDisabledCategoryData(effectiveTrackingChoices(nextChoices))
      setDntEnabled(nextDntEnabled)

      if (hasRevokedConsent(choicesRef.current, nextChoices)) {
        window.location.reload()
        return
      }

      choicesRef.current = nextChoices
      setChoices(nextChoices)
      setHasSavedPreferences(nextPreferences !== null)
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const openPreferences = React.useCallback(() => {
    setSaveError(undefined)
    setOpen(true)
  }, [])

  const savePreferences = React.useCallback((nextChoices: CookieChoices) => {
    const preferences = createCookiePreferences(nextChoices)

    try {
      localStorage.setItem(COOKIE_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
    } catch {
      setSaveError('Your preference could not be saved. Please try again.')
      return
    }

    const consentWasRevoked = hasRevokedConsent(choicesRef.current, nextChoices)
    const nextDntEnabled = isDoNotTrackEnabled()
    clearDisabledCategoryData(effectiveTrackingChoices(nextChoices))
    choicesRef.current = nextChoices
    setChoices(nextChoices)
    setDntEnabled(nextDntEnabled)
    setHasSavedPreferences(true)
    setSaveError(undefined)
    setOpen(false)

    // Vercel's injected scripts do not clean themselves up when unmounted. A
    // reload after withdrawal guarantees the next document never loads them.
    if (consentWasRevoked) window.location.reload()
  }, [])

  const contextValue = React.useMemo(
    () => ({ analyticsEnabled: ready && choices.analytics && !dntEnabled, openPreferences }),
    [choices.analytics, dntEnabled, openPreferences, ready],
  )

  const analyticsEnabled = contextValue.analyticsEnabled

  return (
    <CookiePreferencesContext.Provider value={contextValue}>
      {children}
      {analyticsEnabled ? <ConsentAwareAnalytics /> : null}
      {ready && !hasSavedPreferences && !open && !mobileNavigationOpen ? (
        <CookieConsentPrompt
          saveError={saveError}
          onAccept={() => savePreferences({ analytics: true })}
          onReject={() => savePreferences({ analytics: false })}
          onManage={openPreferences}
        />
      ) : null}
      <CookiePreferencesDialog
        open={open}
        choices={choices}
        saveError={saveError}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen)
          if (nextOpen) setSaveError(undefined)
        }}
        onSave={savePreferences}
      />
    </CookiePreferencesContext.Provider>
  )
}

export function useCookiePreferences() {
  const context = React.useContext(CookiePreferencesContext)
  if (!context) {
    throw new Error('useCookiePreferences must be used within CookiePreferencesProvider')
  }
  return context
}
