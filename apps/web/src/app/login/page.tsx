<<<<<<< HEAD
import { GalleryVerticalEnd } from '@/components/ui/icons'
import { LoginForm } from '@/components/login-form'
import { Icon } from '@/components/ui/icon'
=======
import { GalleryVerticalEnd } from 'lucide-react'

import { LoginForm } from '@/components/login-form'
>>>>>>> origin/preview

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
<<<<<<< HEAD
            <Icon icon={GalleryVerticalEnd} size="sm" />
=======
            <GalleryVerticalEnd className="size-4" />
>>>>>>> origin/preview
          </div>
          Acme Inc.
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
