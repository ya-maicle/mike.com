'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { SideMenuClosed, SideMenuOpen } from '@/components/icons/menu-icons'
import { cn } from '@/lib/utils'
import { Logotype } from '@/components/ui/logotype'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { LoginForm } from '@/components/login-form'
import { useLoginModal } from '@/components/providers/login-modal-provider'
import { useAuth } from '@/components/providers/auth-provider'
import { UserMenu } from '@/components/user-menu'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Footer } from '@/components/footer'

export function HeaderWithNavLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  const [navOpen, setNavOpen] = React.useState(false)

  const { open: loginOpen, setOpen: setLoginOpen, openLogin } = useLoginModal()
  const { user } = useAuth()
  const pathname = usePathname()
  const [hidden, setHidden] = React.useState(false)
  const [atTop, setAtTop] = React.useState(true)
  const lastYRef = React.useRef(0)
  const [isMobile, setIsMobile] = React.useState(false)
  React.useEffect(() => setMounted(true), [])
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mqMobile = window.matchMedia('(min-width: 768px)')
      setIsMobile(!mqMobile.matches)

      const onMobileChange = (e: MediaQueryListEvent) => {
        setIsMobile(!e.matches)
      }
      mqMobile.addEventListener('change', onMobileChange)
      const mqNav = window.matchMedia('(min-width: 1000px)')
      setNavOpen(mqNav.matches)

      const onNavChange = (e: MediaQueryListEvent) => {
        setNavOpen(e.matches)
      }
      mqNav.addEventListener('change', onNavChange)

      return () => {
        mqMobile.removeEventListener('change', onMobileChange)
        mqNav.removeEventListener('change', onNavChange)
      }
    }
  }, [])

  // Header show/hide on scroll and transparency at top
  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0
      setAtTop(y <= 0)
      // If we're at the very top, force header visible
      if (y <= 0) {
        setHidden(false)
        lastYRef.current = 0
        return
      }
      const last = lastYRef.current
      const delta = y - last
      if (Math.abs(delta) > 4) {
        setHidden(delta > 0) // hide on scroll down, show on scroll up
        lastYRef.current = y
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      {mounted && (
        <header
          className={cn(
            'w-full h-14 md:h-16 sticky top-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
            hidden ? '-translate-y-full' : 'translate-y-0',
            atTop ? 'bg-transparent' : 'bg-background',
          )}
        >
          <div className="h-full px-6 md:px-8 flex items-center justify-between">
            {/* Left cluster (Logo) */}
            <div className="flex items-center relative">
              <Link
                href="/"
                aria-label="Go to home"
                className="text-foreground hover:text-primary transition-colors"
              >
                <Logotype
                  size="2xl"
                  showText={false}
                  className="[&_svg]:w-[36px] md:[&_svg]:w-[42px] [&_svg]:h-auto"
                />
              </Link>

              {/* Toggle button - positioned at right edge of 230px sidebar width on desktop */}
              <Button
                aria-label="Toggle navigation"
                variant="ghost"
                size="icon"
                className="hidden md:inline-flex pointer-events-auto md:absolute md:left-[148px]"
                onClick={() => setNavOpen((v) => !v)}
              >
                {navOpen ? (
                  <SideMenuOpen size={20} className="text-zinc-500" />
                ) : (
                  <SideMenuClosed size={20} className="text-zinc-500" />
                )}
              </Button>
            </div>

            {/* Right cluster (mobile toggle + Login) */}
            <div className="flex items-center gap-3">
              <Button
                aria-label="Toggle navigation"
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => {
                  const willOpen = !navOpen
                  setNavOpen(willOpen)
                  // Dispatch custom event on mobile when opening nav
                  if (willOpen && typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('mobile-nav-opening'))
                  }
                }}
              >
                {navOpen ? (
                  <SideMenuOpen size={20} className="text-zinc-500" />
                ) : (
                  <SideMenuClosed size={20} className="text-zinc-500" />
                )}
              </Button>
              {user ? (
                <UserMenu />
              ) : (
                <Button
                  className="hidden md:inline-flex"
                  variant="secondary"
                  size="default"
                  onClick={() => openLogin()}
                >
                  Log in
                </Button>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Sidebar */}
      {mounted && (
        <aside
          aria-hidden={!navOpen}
          suppressHydrationWarning
          className={cn(
            'fixed left-0 top-14 md:top-16 bottom-0 z-[48] w-[80vw] md:w-[230px] p-5 bg-transparent text-foreground',
            'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
            navOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex h-full flex-col">
            <nav className="flex grow flex-col items-stretch justify-center md:-mt-16">
              <ul className="space-y-1">
                <li>
                  <Link
                    href="/work"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 1000)
                        setNavOpen(false)
                    }}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-md px-4 py-3 md:px-3 md:py-2 text-xl md:text-base font-normal [font-family:var(--font-geist-sans)] transition-colors',
                      pathname === '/work'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <span>Work</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/biography"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 1000)
                        setNavOpen(false)
                    }}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-md px-4 py-3 md:px-3 md:py-2 text-xl md:text-base font-normal [font-family:var(--font-geist-sans)] transition-colors',
                      pathname === '/biography'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <span>Biography</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/stories"
                    onClick={() => {
                      if (typeof window !== 'undefined' && window.innerWidth < 1000)
                        setNavOpen(false)
                    }}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-md px-4 py-3 md:px-3 md:py-2 text-xl md:text-base font-normal [font-family:var(--font-geist-sans)] transition-colors',
                      pathname === '/stories'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <span>Stories</span>
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Mobile-only footer action */}
            <div className="mt-auto md:hidden flex justify-end">
              {user ? (
                <UserMenu />
              ) : (
                <Button variant="secondary" size="default" onClick={() => openLogin()}>
                  Log in
                </Button>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* Mobile overlay when sidebar is open */}
      {mounted && (
        <button
          aria-hidden={!navOpen}
          aria-label="Dismiss navigation overlay"
          onClick={() => setNavOpen(false)}
          className={cn(
            'md:hidden fixed left-0 right-0 bottom-0 z-30 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
            hidden ? 'top-0' : 'top-14',
            navOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
            'bg-white/50 dark:bg-black/50 backdrop-blur-sm',
          )}
        />
      )}

      {/* Content container: shifts right ~80% on mobile when open; desktop has static left margin */}
      <div
        suppressHydrationWarning
        className={cn(
          'transition-[transform,margin-left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          'flex flex-col min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)]',
          isMobile && 'transform-gpu will-change-transform',
          navOpen ? 'md:ml-[230px]' : 'md:ml-0',
        )}
        style={isMobile ? { transform: navOpen ? 'translateX(80vw)' : 'translateX(0)' } : undefined}
      >
        {/* Content Area */}
        <main className="flex-1 px-6 md:px-8 py-6 md:py-8">
          <div className="max-w-[var(--content-max-width)] mx-auto">{children}</div>
        </main>
        <Footer />
      </div>

      {/* Login Modal */}
      {mounted && (
        <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
          <DialogContent
            aria-label="Log in"
            className="sm:max-w-sm bg-transparent border-none shadow-none p-0"
          >
            <DialogTitle className="sr-only">Log in</DialogTitle>
            <LoginForm />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
