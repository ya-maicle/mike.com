import type { Metadata } from 'next'
import { GalleryVerticalEnd } from 'lucide-react'
import { LoginForm } from '@/components/login-form'
import { SITE_CONFIG } from '@/lib/constants'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'Login',
  description: 'Sign in to access recruiter-only portfolio content.',
  path: '/login',
  noIndex: true,
  noFollow: true,
})

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          {SITE_CONFIG.name}
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
