'use client'

import { cn } from '@/lib/utils'
import getSupabaseClient from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import * as React from 'react'

export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const RAW_SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '')
  // Sanitize: remove whitespace/newlines and trailing slashes
  const SITE_URL = (RAW_SITE_URL || '').toString().trim().replace(/\/+$/, '')
  const [email, setEmail] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [infoMsg, setInfoMsg] = React.useState<string | null>(null)
  const [sent, setSent] = React.useState(false)

  const handleGoogleLogin = async () => {
    try {
      const supabase = getSupabaseClient()
      const currentPath =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}${window.location.hash}`
          : '/'
      const redirectTo = `${SITE_URL}${currentPath || '/'}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Return the user to the same path they initiated login from
          redirectTo,
        },
      })
      if (error) {
        console.error('Google OAuth error:', error.message)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    setInfoMsg(null)
    setPending(true)
    try {
      const supabase = getSupabaseClient()
      const currentPath =
        typeof window !== 'undefined'
          ? `${window.location.pathname}${window.location.search}${window.location.hash}`
          : '/'
      const emailRedirectTo = `${SITE_URL}${currentPath || '/'}`
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Return to same page after email link confirmation
          emailRedirectTo,
          shouldCreateUser: true,
        },
      })
      if (error) {
        setErrorMsg(error.message || 'Unable to send magic link. Please try again.')
      } else {
        setSent(true)
        setInfoMsg('Check your email for a magic link to sign in.')
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unexpected error. Please try again.')
    } finally {
      setPending(false)
    }
  }
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Sign in</CardTitle>
          <CardDescription>Use Google or get a magic link by email</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} noValidate>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleLogin}
                  disabled={pending}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </div>
              <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={pending || sent}
                  />
                  <p className="text-muted-foreground text-xs">
                    We’ll send you a magic link to sign in.
                  </p>
                </div>
                {infoMsg ? (
                  <p className="text-muted-foreground text-sm" role="status" aria-live="polite">
                    {infoMsg}
                  </p>
                ) : null}
                {errorMsg ? (
                  <p className="text-destructive text-sm" role="alert" aria-live="polite">
                    {errorMsg}
                  </p>
                ) : null}
                <Button type="submit" className="w-full" disabled={pending || !email}>
                  {pending
                    ? sent
                      ? 'Resending…'
                      : 'Sending…'
                    : sent
                      ? 'Resend magic link'
                      : 'Send magic link'}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
