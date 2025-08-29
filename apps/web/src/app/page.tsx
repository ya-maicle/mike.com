<<<<<<< HEAD
export default function Home() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">Welcome</h1>
        <p className="text-muted-foreground max-w-prose">
          This is the index page. Use the sidebar to browse Work, Biography, and Stories.
        </p>
      </section>
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-muted h-32 rounded-lg border" />
        ))}
      </section>
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className={(i % 3 === 0 ? 'md:col-span-2 ' : '') + 'bg-muted h-40 rounded-lg border'} />
        ))}
      </section>
=======
import { GalleryVerticalEnd } from '@/components/ui/icons'
import { LoginForm } from '@/components/login-form'
import { Icon } from '@/components/ui/icon'

export default function Home() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <Icon icon={GalleryVerticalEnd} size="sm" />
          </div>
          Acme Inc.
        </a>
        <LoginForm />
      </div>
>>>>>>> origin/preview
    </div>
  )
}
