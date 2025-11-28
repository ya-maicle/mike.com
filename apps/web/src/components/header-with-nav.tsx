"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { PanelRight, PanelLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Logotype } from "@/components/ui/logotype"


export function HeaderWithNav() {
  const [open, setOpen] = React.useState(true)


  return (
    <>
      <header className="w-full h-14 md:h-16 bg-background">
        <div className="h-full px-6 md:px-8 flex items-center justify-between">
          {/* Left cluster (desktop: Logo + PanelRight; mobile: Logo only) */}
          <div className="flex items-center gap-2 md:gap-12">
            <Logotype
              size="2xl"
              showText={false}
              text="Maicle"
              className="[&_svg]:w-[48px] [&_svg]:h-auto text-foreground"
            />
            <Button
              aria-label="Open navigation"
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? (
                <PanelLeft size={20} className="text-zinc-500" />
              ) : (
                <PanelRight size={20} className="text-zinc-500" />
              )}
            </Button>
          </div>

          {/* Right cluster (desktop: Search + Login; mobile: Search + PanelRight) */}
          <div className="flex items-center gap-3">

            <Button
              aria-label="Open navigation"
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

      {/* Single side panel (toggle open/closed on all viewports) */}
      <aside
        aria-hidden={!open}
        className={cn(
          "fixed left-0 top-14 md:top-16 bottom-0 z-40 w-[230px] p-5 bg-sidebar text-sidebar-foreground", // below header
          "transition-transform duration-200 ease-out", // animation
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <nav className="flex h-full flex-col items-stretch justify-center md:-mt-16">
          <ul className="space-y-1">
            <li>
              <a
                href="#"
                className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium [font-family:var(--font-geist-sans)] text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span>Work</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium [font-family:var(--font-geist-sans)] text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span>Biography</span>
              </a>
            </li>
            <li>
              <a
                href="#"
                className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium [font-family:var(--font-geist-sans)] text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span>Stories</span>
              </a>
            </li>
          </ul>
        </nav>
      </aside>
      

    </>
  )
}
