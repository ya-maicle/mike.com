'use client'

import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto">
      <div className="max-w-[var(--content-max-width)] mx-auto px-6 md:px-8">
        <div className="border-t border-border py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 text-base text-foreground">
            <span>{new Date().getFullYear()} Mike Y.</span>
            <a
              href="#"
              className="font-normal underline decoration-1 underline-offset-4 hover:text-muted-foreground hover:decoration-muted-foreground transition-colors"
            >
              Manage cookies
            </a>
            <Link
              href="/terms"
              className="font-normal underline decoration-1 underline-offset-4 hover:text-muted-foreground hover:decoration-muted-foreground transition-colors"
            >
              Terms of use
            </Link>
            <Link
              href="/privacy"
              className="font-normal underline decoration-1 underline-offset-4 hover:text-muted-foreground hover:decoration-muted-foreground transition-colors"
            >
              Privacy policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
