'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/constants'

export function Footer() {
  const [year, setYear] = useState<number>(2025)

  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="mt-auto px-6 md:px-8">
      <div className="max-w-[var(--content-max-width)] mx-auto">
        <div className="border-t border-border py-8">
          <div className="flex flex-col md:flex-row md:items-center gap-4 text-base text-foreground">
            <span>
              {year} {SITE_CONFIG.name}
            </span>
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
