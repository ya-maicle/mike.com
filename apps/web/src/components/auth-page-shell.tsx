import Link from 'next/link'

import { GoogleOneTap } from '@/components/google-one-tap'
import { Logotype } from '@/components/ui/logotype'

type AuthPageShellProps = {
  children: React.ReactNode
  showGoogleOneTap?: boolean
}

export function AuthPageShell({ children, showGoogleOneTap = false }: AuthPageShellProps) {
  return (
    <div className="bg-background text-foreground relative flex min-h-svh w-full justify-center">
      {showGoogleOneTap ? <GoogleOneTap /> : null}

      <Link
        href="/"
        aria-label="Go to home"
        className="absolute top-5 left-5 z-10 md:top-6 md:left-8"
      >
        <Logotype size="md" gradient showText={false} />
      </Link>

      <div className="flex min-h-svh w-full max-w-[520px] flex-col items-center justify-between px-5 py-8 md:px-6">
        <main className="flex w-full grow flex-col items-center justify-center">
          <div className="mt-5 w-full max-w-[440px] px-6 pb-10">{children}</div>
        </main>

        <footer className="text-muted-foreground flex shrink-0 flex-col items-center gap-3 text-xs">
          <Logotype size="xs" showText={false} aria-hidden="true" />
          <nav aria-label="Legal" className="flex items-center gap-3">
            <Link className="underline underline-offset-4" href="/terms">
              Terms of use
            </Link>
            <span aria-hidden="true">|</span>
            <Link className="underline underline-offset-4" href="/privacy">
              Privacy policy
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  )
}
