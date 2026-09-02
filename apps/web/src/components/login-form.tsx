'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleIcon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { capturePortfolioAccessStarted } from '@/lib/analytics/portfolio-access'
import {
  buildMagicLinkEmailRedirectUrl,
  createPendingMagicLinkRequest,
  MAGIC_LINK_REQUEST_STORAGE_KEY,
  MAGIC_LINK_SENT_PATH,
} from '@/lib/magic-link'
import getSupabaseClient, { createSupabaseMagicLinkClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { isValidReturnPath } from '@/lib/url-validation'

type LoginFormProps = React.ComponentProps<'div'> & {
  presentation?: 'card' | 'page'
  onMagicLinkSent?: () => void
}

function getSiteOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  const candidate = typeof window !== 'undefined' ? window.location.origin : configuredUrl
  if (!candidate) throw new Error('The site URL is not configured.')
  return new URL(candidate).origin
}

function getReturnPath() {
  if (typeof window === 'undefined') return '/'

  try {
    const rememberedPath = localStorage.getItem('auth-return-url')
    if (isValidReturnPath(rememberedPath)) return rememberedPath!
  } catch {
    // Storage can be unavailable in privacy modes; the current URL is a safe fallback.
  }

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
  return isValidReturnPath(currentPath) ? currentPath : '/'
}

function rememberReturnPath(returnPath: string) {
  try {
    localStorage.setItem('auth-return-url', returnPath)
  } catch {
    // The return path is also carried in the provider redirect, so storage is optional.
  }
}

function getOAuthRedirectUrl(origin: string, returnPath: string) {
  const url = new URL(origin)
  if (returnPath !== '/' && isValidReturnPath(returnPath)) {
    url.searchParams.set('auth_return_to', returnPath)
  }
  return url.toString()
}

function magicLinkErrorMessage(error: { message?: string; status?: number }) {
  if (error.status === 429 || /rate|seconds|too many/i.test(error.message ?? '')) {
    return 'Please wait a minute before requesting another sign-in link.'
  }
  return 'We could not send the sign-in link. Please check the address and try again.'
}

export function LoginForm({
  presentation = 'card',
  onMagicLinkSent,
  className,
  ...props
}: LoginFormProps) {
  const router = useRouter()
  const isPage = presentation === 'page'
  const [email, setEmail] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  const handleGoogleLogin = async () => {
    setErrorMsg(null)
    try {
      const supabase = getSupabaseClient()
      const returnPath = getReturnPath()
      const redirectTo = getOAuthRedirectUrl(getSiteOrigin(), returnPath)

      rememberReturnPath(returnPath)
      await capturePortfolioAccessStarted('google', returnPath)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (error) throw error
    } catch (error) {
      setErrorMsg('Google sign-in could not be started. Please try again.')
      console.error('[AUTH] Google OAuth error:', error)
    }
  }

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMsg(null)
    setPending(true)

    const normalizedEmail = email.trim()

    try {
      const returnPath = getReturnPath()
      const emailRedirectTo = buildMagicLinkEmailRedirectUrl(getSiteOrigin(), returnPath)
      rememberReturnPath(returnPath)

      const magicLinkClient = createSupabaseMagicLinkClient()
      let sendError: { message?: string; status?: number } | null = null

      try {
        const { error } = await magicLinkClient.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            emailRedirectTo,
            shouldCreateUser: true,
          },
        })
        sendError = error
      } finally {
        try {
          await magicLinkClient.auth.stopAutoRefresh()
        } catch {
          // Cleanup must not make a successfully sent email look like a failure.
        }
      }

      if (sendError) {
        setErrorMsg(magicLinkErrorMessage(sendError))
        console.error('[AUTH] Magic link error:', sendError)
        return
      }

      try {
        sessionStorage.setItem(
          MAGIC_LINK_REQUEST_STORAGE_KEY,
          JSON.stringify(createPendingMagicLinkRequest(normalizedEmail, returnPath)),
        )
      } catch {
        // Confirmation remains useful without the optional recipient/resend state.
      }

      try {
        await capturePortfolioAccessStarted('magic_link', returnPath)
      } catch {
        // Analytics must never turn a successfully sent email into an apparent failure.
      }

      onMagicLinkSent?.()
      router.push(MAGIC_LINK_SENT_PATH)
    } catch (error) {
      setErrorMsg('We could not send the sign-in link. Please try again.')
      console.error('[AUTH] Magic link exception:', error)
    } finally {
      setPending(false)
    }
  }

  return (
    <Card
      className={cn(isPage && 'w-full gap-5 border-0 bg-transparent py-0 shadow-none', className)}
      {...props}
    >
      <CardHeader className={cn('text-center', isPage && 'gap-0 px-0')}>
        <CardTitle
          role="heading"
          aria-level={1}
          className={cn(isPage ? 'text-3xl leading-9 font-normal tracking-[-0.01em]' : 'text-xl')}
        >
          {isPage ? 'Log in or sign up' : 'Sign in'}
        </CardTitle>
        {!isPage ? (
          <CardDescription>Use Google or get a magic link by email</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className={cn(isPage && 'px-0')}>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {pending ? 'Sending your sign-in link…' : ''}
        </p>
        <form
          onSubmit={onSubmit}
          aria-busy={pending}
          className={cn(isPage ? 'flex flex-col gap-4' : 'grid gap-6')}
        >
          <Button
            type="button"
            variant="outline"
            size={isPage ? 'lg' : 'default'}
            className={cn(
              'w-full',
              isPage &&
                'relative h-13 border-border bg-card text-base font-medium shadow-none hover:bg-accent',
            )}
            onClick={handleGoogleLogin}
            disabled={pending}
          >
            <GoogleIcon
              variant={isPage ? 'brand' : 'monochrome'}
              className={cn(isPage && 'absolute left-5 size-4')}
            />
            Continue with Google
          </Button>

          <div
            role="separator"
            aria-label="Or continue with email"
            className={cn(
              isPage
                ? 'text-muted-foreground flex h-5 items-center gap-3 text-xs'
                : 'after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t',
            )}
          >
            {isPage ? <span aria-hidden="true" className="bg-border h-px flex-1" /> : null}
            <span className={cn(!isPage && 'bg-card text-muted-foreground relative z-10 px-2')}>
              {isPage ? 'OR' : 'Or continue with'}
            </span>
            {isPage ? <span aria-hidden="true" className="bg-border h-px flex-1" /> : null}
          </div>

          <div className={cn('grid', isPage ? 'gap-2' : 'gap-6')}>
            <div className={cn('grid', isPage ? 'gap-2' : 'gap-3')}>
              <Label htmlFor="email" className={cn(isPage && 'sr-only')}>
                {isPage ? 'Email address' : 'Email'}
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={isPage ? 'Email address' : 'm@example.com'}
                required
                aria-invalid={Boolean(errorMsg)}
                aria-describedby={errorMsg ? 'login-error' : undefined}
                className={cn(
                  isPage &&
                    'h-13 rounded-full border-border bg-background px-5 py-3 text-base shadow-none md:text-base',
                )}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (errorMsg) setErrorMsg(null)
                }}
                disabled={pending}
              />
              {!isPage ? (
                <p className="text-muted-foreground text-xs">
                  We&apos;ll send you a magic link to sign in.
                </p>
              ) : null}
            </div>

            {errorMsg ? (
              <p
                id="login-error"
                className={cn('text-destructive text-sm', isPage && 'mb-0 text-center')}
                role="alert"
                aria-live="polite"
              >
                {errorMsg}
              </p>
            ) : null}

            <Button
              type="submit"
              size={isPage ? 'lg' : 'default'}
              className={cn('w-full', isPage && 'h-13 text-base font-medium')}
              disabled={pending || !email.trim()}
            >
              {pending ? 'Sending…' : isPage ? 'Continue' : 'Send magic link'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
