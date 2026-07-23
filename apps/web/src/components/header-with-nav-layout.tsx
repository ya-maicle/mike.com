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
import { isStrengthDetailPath } from '@/lib/program-display'
import { useMobileNavigation } from '@/components/providers/mobile-navigation-provider'

export function HeaderWithNavLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false)
  const [desktopNavOpen, setDesktopNavOpen] = React.useState(false)
  const { open: mobileNavOpen, setOpen: setMobileNavOpen } = useMobileNavigation()

  const { open: loginOpen, setOpen: setLoginOpen, openLogin } = useLoginModal()
  const { user } = useAuth()
  const pathname = usePathname()
  const [hidden, setHidden] = React.useState(false)
  const [atTop, setAtTop] = React.useState(true)
  const lastYRef = React.useRef(0)
  const [isMobile, setIsMobile] = React.useState(false)
  const navOpen = isMobile ? mobileNavOpen : desktopNavOpen
  const isBioPage = pathname === '/bio'
  const invertHeader = isBioPage && atTop && !navOpen
  React.useEffect(() => setMounted(true), [])
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mqMobile = window.matchMedia('(min-width: 768px)')
      setIsMobile(!mqMobile.matches)

      const onMobileChange = (e: MediaQueryListEvent) => {
        setIsMobile(!e.matches)
        if (e.matches) {
          setMobileNavOpen(false)
        } else {
          setDesktopNavOpen(false)
        }
      }
      mqMobile.addEventListener('change', onMobileChange)
      setDesktopNavOpen(false)
      setMobileNavOpen(false)

      return () => {
        mqMobile.removeEventListener('change', onMobileChange)
      }
    }
  }, [setMobileNavOpen])

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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      {mounted && (
        <header
          className={cn(
            'w-full h-14 md:h-16 sticky top-0 z-50 transition-[transform,color,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
            hidden ? '-translate-y-full' : 'translate-y-0',
            atTop ? 'bg-transparent' : 'bg-background',
            invertHeader ? 'text-white' : 'text-foreground',
          )}
        >
          <div className="h-full px-6 md:px-8 flex items-center justify-between">
            {/* Left cluster (Logo) */}
            <div className="flex items-center relative">
              <Link
                href="/"
                aria-label="Go to home"
                className={cn(
                  'transition-colors',
                  invertHeader
                    ? 'text-white hover:text-white/80'
                    : 'text-foreground hover:text-primary',
                )}
              >
                <Logotype
                  size="2xl"
                  gradient
                  gradientMode={invertHeader ? 'dark' : 'auto'}
                  showText={false}
                  className="[&_svg]:w-[36px] [&_svg]:h-auto md:[&_svg]:h-[20px]"
                />
              </Link>

              {/* Toggle button - positioned at right edge of 230px sidebar width on desktop */}
              <Button
                aria-label="Toggle navigation"
                variant="ghost"
                size="icon"
                className={cn(
                  'hidden md:inline-flex pointer-events-auto md:absolute md:left-[148px]',
                  invertHeader && 'text-white hover:bg-white/15 hover:text-white',
                )}
                onClick={() => setDesktopNavOpen((value) => !value)}
              >
                {navOpen ? (
                  <SideMenuOpen
                    size={20}
                    className={invertHeader ? 'text-white' : 'text-zinc-500'}
                  />
                ) : (
                  <SideMenuClosed
                    size={20}
                    className={invertHeader ? 'text-white' : 'text-zinc-500'}
                  />
                )}
              </Button>
            </div>

            {/* Right cluster (mobile toggle + Login) */}
            <div className="flex items-center gap-3">
              <Button
                aria-label="Toggle navigation"
                variant="ghost"
                size="icon"
                className={cn(
                  'md:hidden',
                  invertHeader && 'text-white hover:bg-white/15 hover:text-white',
                )}
                onClick={() => {
                  const willOpen = !mobileNavOpen
                  setMobileNavOpen(willOpen)
                  // Dispatch custom event on mobile when opening nav
                  if (willOpen && typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('mobile-nav-opening'))
                  }
                }}
              >
                {navOpen ? (
                  <SideMenuOpen
                    size={20}
                    className={invertHeader ? 'text-white' : 'text-zinc-500'}
                  />
                ) : (
                  <SideMenuClosed
                    size={20}
                    className={invertHeader ? 'text-white' : 'text-zinc-500'}
                  />
                )}
              </Button>
              {user ? (
                <UserMenu />
              ) : (
                <Button
                  variant="secondary"
                  size="default"
                  className={cn(
                    'hidden md:inline-flex',
                    invertHeader && 'bg-white/15 text-white backdrop-blur-sm hover:bg-white/25',
                  )}
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
                    onClick={() => setMobileNavOpen(false)}
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
                    href="/bio"
                    onClick={() => setMobileNavOpen(false)}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-md px-4 py-3 md:px-3 md:py-2 text-xl md:text-base font-normal [font-family:var(--font-geist-sans)] transition-colors',
                      pathname === '/bio'
                        ? 'bg-accent text-accent-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground',
                    )}
                  >
                    <span>Bio</span>
                  </Link>
                </li>
              </ul>
            </nav>

            {/* Mobile-only footer action for logged-out users */}
            {!user && (
              <div className="mt-auto flex justify-end md:hidden">
                <Button variant="secondary" size="default" onClick={() => openLogin()}>
                  Log in
                </Button>
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Mobile overlay when sidebar is open */}
      {mounted && (
        <button
          aria-hidden={!navOpen}
          aria-label="Dismiss navigation overlay"
          onClick={() => setMobileNavOpen(false)}
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
          'flex flex-col flex-1',
          isMobile && 'transform-gpu will-change-transform',
          navOpen ? 'md:ml-[230px]' : 'md:ml-0',
          navOpen && isBioPage && '[&_[data-bio-hero]]:rounded-bl-[8px]',
        )}
        style={isMobile ? { transform: navOpen ? 'translateX(80vw)' : 'translateX(0)' } : undefined}
      >
        {/* Content Area */}
        <main
          className={cn(
            isBioPage
              ? '-mt-14 px-0 pt-0 pb-6 md:-mt-16 md:pb-8'
              : 'px-6 pt-6 pb-6 md:px-8 md:pt-8 md:pb-8',
            isStrengthDetailPath(pathname) && 'pb-0',
          )}
        >
          <div className={isBioPage ? 'max-w-none' : 'max-w-[var(--content-max-width)] mx-auto'}>
            {children}
          </div>
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
