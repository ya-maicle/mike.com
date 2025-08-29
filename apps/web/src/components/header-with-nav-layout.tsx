"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { PanelRight, PanelLeft, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { CommandMenu } from "@/components/command-menu"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function HeaderWithNavLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const pathname = usePathname()
  const [hidden, setHidden] = React.useState(false)
  const [atTop, setAtTop] = React.useState(true)
  const lastYRef = React.useRef(0)
  const [isMobile, setIsMobile] = React.useState(false)

  // Default: open on desktop, closed on mobile (initial load)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(min-width: 768px)')
      setOpen(mq.matches)
      setIsMobile(!mq.matches)
      const onChange = (e: MediaQueryListEvent) => setIsMobile(!e.matches)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
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
      <header
        className={cn(
          'w-full h-14 md:h-16 sticky top-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
          hidden ? '-translate-y-full' : 'translate-y-0',
          atTop ? 'bg-transparent' : 'bg-background',
        )}
      >
        <div className="h-full px-6 md:px-8 flex items-center justify-between">
          {/* Left cluster (Logo + toggle on desktop) */}
          <div className="flex items-center gap-2 md:gap-12">
            <Link href="/" aria-label="Go to home" className="text-xl md:text-2xl font-semibold text-foreground hover:text-primary transition-colors">
              Mike Y.
            </Link>
            <Button
              aria-label="Toggle navigation"
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex pointer-events-auto"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <PanelLeft size={20} className="text-zinc-500" />
              ) : (
                <PanelRight size={20} className="text-zinc-500" />
              )}
            </Button>
          </div>

          {/* Right cluster (Search + mobile toggle + Login) */}
          <div className="flex items-center gap-3">
            <Button aria-label="Search" variant="ghost" size="icon" onClick={() => setCommandOpen(true)}>
              <Search size={20} className="text-zinc-500" />
            </Button>
            <Button
              aria-label="Toggle navigation"
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <PanelLeft size={20} className="text-zinc-500" />
              ) : (
                <PanelRight size={20} className="text-zinc-500" />
              )}
            </Button>
            <Button className="hidden md:inline-flex" variant="secondary" size="default">
              Log in
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        aria-hidden={!open}
        suppressHydrationWarning
        className={cn(
          'fixed left-0 top-14 md:top-16 bottom-0 z-40 w-[80vw] md:w-[230px] p-5 bg-transparent text-foreground',
          'transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          <nav className="flex grow flex-col items-stretch justify-center md:-mt-16">
            <ul className="space-y-1">
              <li>
                <Link
                  href="/work"
                  onClick={() => {
                    if (typeof window !== 'undefined' && window.innerWidth < 768) setOpen(false)
                  }}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-md px-4 py-3 md:px-3 md:py-2 text-base md:text-sm font-medium [font-family:var(--font-geist-sans)] transition-colors",
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
                    if (typeof window !== 'undefined' && window.innerWidth < 768) setOpen(false)
                  }}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-md px-4 py-3 md:px-3 md:py-2 text-base md:text-sm font-medium [font-family:var(--font-geist-sans)] transition-colors",
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
                    if (typeof window !== 'undefined' && window.innerWidth < 768) setOpen(false)
                  }}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-md px-4 py-3 md:px-3 md:py-2 text-base md:text-sm font-medium [font-family:var(--font-geist-sans)] transition-colors",
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
            <Button variant="secondary" size="default">Log in</Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay when sidebar is open */}
      <button
        aria-hidden={!open}
        aria-label="Dismiss navigation overlay"
        onClick={() => setOpen(false)}
        className={cn(
          'md:hidden fixed left-0 right-0 bottom-0 z-30 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]',
          hidden ? 'top-0' : 'top-14',
          open ? "opacity-100" : "opacity-0 pointer-events-none",
          "bg-white/50 dark:bg-black/50 backdrop-blur-sm",
        )}
      />

      {/* Content container: shifts right ~80% on mobile when open; desktop has static left margin */}
      <div
        suppressHydrationWarning
        className={cn(
          'transform-gpu transition-[transform,margin-left] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform',
          open ? 'md:ml-[230px]' : 'md:ml-0',
        )}
        style={{ transform: isMobile && open ? 'translateX(80vw)' : 'translateX(0)' }}
      >
        {/* Content Area */}
        <main className="min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)] px-6 md:px-8 py-6 md:py-8">
          <div className="max-w-[var(--content-max-width)] mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  )
}
