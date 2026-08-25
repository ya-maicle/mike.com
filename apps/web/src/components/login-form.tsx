'use client'

import { cn } from '@/lib/utils'
import getSupabaseClient from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GoogleIcon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { isValidReturnPath } from '@/lib/url-validation'
import { capturePortfolioAccessStarted } from '@/lib/analytics/portfolio-access'
import * as React from 'react'

type LoginFormProps = React.ComponentProps<'div'> & {
  presentation?: 'card' | 'page'
}

export function LoginForm({ presentation = 'card', className, ...props }: LoginFormProps) {
  const isPage = presentation === 'page'
  const RAW_SITE_URL =
    (typeof window !== 'undefined' ? window.location.origin : '') ||
    process.env.NEXT_PUBLIC_SITE_URL
  const SITE_URL = (RAW_SITE_URL || '').toString().trim().replace(/\/+$/, '')
  const [email, setEmail] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [infoMsg, setInfoMsg] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)
  const [cooldown, setCooldown] = React.useState(0)

  React.useEffect(() => {
    const checkCooldown = () => {
      const expires = localStorage.getItem('magic-link-cooldown-expires')
      if (expires) {
        const remaining = Math.ceil((parseInt(expires, 10) - Date.now()) / 1000)
        if (remaining > 0) {
          setCooldown(remaining)
          setSent(true)
        } else {
          localStorage.removeItem('magic-link-cooldown-expires')
          setCooldown(0)
        }
      }
    }

    checkCooldown()

    let interval: NodeJS.Timeout
    if (cooldown > 0) {
      interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem('magic-link-cooldown-expires')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [cooldown])

  const getReturnPath = React.useCallback(() => {
    if (typeof window === 'undefined') return '/'

    const existingReturnUrl = localStorage.getItem('auth-return-url')
    if (isValidReturnPath(existingReturnUrl)) return existingReturnUrl!

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`
    return isValidReturnPath(currentPath) ? currentPath : '/'
  }, [])

  const getRedirectTo = React.useCallback(
    (returnPath: string) => {
      const url = new URL(SITE_URL)
      if (isValidReturnPath(returnPath) && returnPath !== '/') {
        url.searchParams.set('auth_return_to', returnPath)
      }
      return url.toString()
    },
    [SITE_URL],
  )

  const handleGoogleLogin = async () => {
    try {
      const supabase = getSupabaseClient()
      const returnPath = getReturnPath()
      const redirectTo = getRedirectTo(returnPath)

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-return-url', returnPath)
      }

      await capturePortfolioAccessStarted('google', returnPath)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })
      if (error) {
        console.error('[AUTH] Google OAuth error:', error.message)
      }
    } catch (e) {
      console.error('[AUTH] Google OAuth exception:', e)
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    setInfoMsg(null)
    setPending(true)
    try {
      const supabase = getSupabaseClient()
      const returnPath = getReturnPath()
      const emailRedirectTo = getRedirectTo(returnPath)

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth-return-url', returnPath)
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo,
          shouldCreateUser: true,
        },
      })
      if (error) {
        setErrorMsg(error.message || 'Unable to send magic link. Please try again.')
        console.error('[AUTH] Magic link error:', error)
      } else {
        await capturePortfolioAccessStarted('magic_link', returnPath)
        setSent(true)
        setInfoMsg('Check your email for a magic link to sign in.')
        const expires = Date.now() + 60000
        localStorage.setItem('magic-link-cooldown-expires', expires.toString())
        setCooldown(60)
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error. Please try again.')
      console.error('[AUTH] Magic link exception:', err)
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
        <form
          onSubmit={onSubmit}
          noValidate
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
                aria-describedby={errorMsg ? 'login-error' : infoMsg ? 'login-status' : undefined}
                className={cn(
                  isPage &&
                    'h-13 rounded-full border-border bg-background px-5 py-3 text-base shadow-none md:text-base',
                )}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (sent) setSent(false)
                  if (infoMsg) setInfoMsg(null)
                  if (errorMsg) setErrorMsg(null)
                }}
                disabled={pending || (sent && cooldown > 0)}
              />
              {!isPage && !infoMsg ? (
                <p className="text-muted-foreground text-xs">
                  We&apos;ll send you a magic link to sign in.
                </p>
              ) : null}
              {!isPage && infoMsg ? (
                <p
                  id="login-status"
                  className="text-muted-foreground text-sm"
                  role="status"
                  aria-live="polite"
                >
                  {infoMsg}
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
              disabled={pending || !email || cooldown > 0}
            >
              {pending
                ? sent
                  ? 'Resending…'
                  : 'Sending…'
                : sent
                  ? cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : 'Resend magic link'
                  : isPage
                    ? 'Continue'
                    : 'Send magic link'}
            </Button>

            {isPage && infoMsg ? (
              <p
                id="login-status"
                className="text-muted-foreground mb-0 text-center text-sm"
                role="status"
                aria-live="polite"
              >
                {infoMsg}
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
