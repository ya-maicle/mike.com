import Link from 'next/link'

import { SITE_CONFIG } from '@/lib/constants'

export function CaseStudyByline() {
  return (
    <p className="m-0 text-base text-muted-foreground">
      Case study by{' '}
      <Link
        href="/bio"
        rel="author"
        className="underline decoration-1 underline-offset-4 transition-colors hover:text-foreground"
      >
        {SITE_CONFIG.name}
      </Link>
    </p>
  )
}
