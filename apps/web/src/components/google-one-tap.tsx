'use client'

import Script from 'next/script'
import * as React from 'react'

import { useAuth } from '@/components/providers/auth-provider'
import { capturePortfolioAccessStarted } from '@/lib/analytics/portfolio-access'
import {
  createGoogleNonce,
  GOOGLE_ONE_TAP_LOGIN_PENDING_KEY,
  hashGoogleNonce,
} from '@/lib/google-one-tap'
import getSupabaseClient from '@/lib/supabase'
import { isValidReturnPath } from '@/lib/url-validation'

type GoogleCredentialResponse = {
  credential?: string
}

type GoogleIdConfiguration = {
  auto_select?: boolean
  callback: (response: GoogleCredentialResponse) => void
  cancel_on_tap_outside?: boolean
  client_id: string
  context?: 'signin' | 'signup' | 'use'
  itp_support?: boolean
  nonce?: string
  use_fedcm_for_prompt?: boolean
}

type GoogleIdentityServices = {
  accounts?: {
    id?: {
      cancel: () => void
      initialize: (configuration: GoogleIdConfiguration) => void
      prompt: () => void
    }
  }
}

declare global {
  interface Window {
    google?: GoogleIdentityServices
  }
}

function getReturnPath() {
  const existingReturnUrl = localStorage.getItem('auth-return-url')
  if (isValidReturnPath(existingReturnUrl)) return existingReturnUrl!

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
  return isValidReturnPath(currentPath) ? currentPath : '/'
}

export function GoogleOneTap() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const { loading, user } = useAuth()
  const [scriptReady, setScriptReady] = React.useState(false)
  const mountedRef = React.useRef(false)
  const promptStartedRef = React.useRef(false)
  const credentialPendingRef = React.useRef(false)

  React.useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      window.google?.accounts?.id?.cancel()
    }
  }, [])

  React.useEffect(() => {
    const googleIdentity = window.google?.accounts?.id

    if (user) {
      googleIdentity?.cancel()
      return
    }

    if (!clientId || loading || !scriptReady || !googleIdentity || promptStartedRef.current) return

    promptStartedRef.current = true

    void (async () => {
      const rawNonce = createGoogleNonce()
      const hashedNonce = await hashGoogleNonce(rawNonce)

      if (!mountedRef.current) return

      googleIdentity.initialize({
        client_id: clientId,
        context: 'signin',
        auto_select: false,
        cancel_on_tap_outside: true,
        itp_support: true,
        use_fedcm_for_prompt: true,
        nonce: hashedNonce,
        callback: (response) => {
          if (!response.credential || credentialPendingRef.current) return
          credentialPendingRef.current = true

          void (async () => {
            const returnPath = getReturnPath()
            localStorage.setItem('auth-return-url', returnPath)
            sessionStorage.setItem(GOOGLE_ONE_TAP_LOGIN_PENDING_KEY, '1')

            try {
              await capturePortfolioAccessStarted('google', returnPath)

              const { error } = await getSupabaseClient().auth.signInWithIdToken({
                provider: 'google',
                token: response.credential!,
                nonce: rawNonce,
              })

              if (error) throw error
            } catch (error) {
              sessionStorage.removeItem(GOOGLE_ONE_TAP_LOGIN_PENDING_KEY)
              credentialPendingRef.current = false
              console.error('[AUTH] Google One Tap error:', error)
            }
          })()
        },
      })

      googleIdentity.prompt()
    })().catch((error) => {
      promptStartedRef.current = false
      console.error('[AUTH] Unable to start Google One Tap:', error)
    })
  }, [clientId, loading, scriptReady, user])

  if (!clientId || user) return null

  return (
    <Script
      id="google-identity-services"
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onReady={() => setScriptReady(true)}
      onError={(error) => console.error('[AUTH] Unable to load Google Identity Services:', error)}
    />
  )
}
