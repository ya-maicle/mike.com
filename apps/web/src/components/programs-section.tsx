'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { gridCols } from '@/lib/grid-columns'
import { Button } from '@/components/ui/button'

type Program = {
  title: string
  description: string
}

type ProgramsSectionProps = {
  label?: string
  heading?: string
  button?: { text?: string; link?: string }
  programs?: Program[]
  footerLink?: { text?: string; link?: string }
}

export function ProgramsSection({
  label,
  heading,
  button,
  programs,
  footerLink,
}: ProgramsSectionProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)
  const rowRefs = React.useRef<(HTMLLIElement | null)[]>([])
  const lastPosition = React.useRef<{ top: number; height: number }>({ top: 0, height: 0 })

  if (!programs || programs.length === 0) return null

  // Calculate highlight position based on hovered row
  const getHighlightStyle = (): React.CSSProperties => {
    if (hoveredIndex !== null && rowRefs.current[hoveredIndex]) {
      const row = rowRefs.current[hoveredIndex]
      lastPosition.current = { top: row.offsetTop, height: row.offsetHeight }
      return {
        opacity: 1,
        top: row.offsetTop,
        height: row.offsetHeight,
      }
    }
    // When not hovering, fade out at last known position
    return {
      opacity: 0,
      top: lastPosition.current.top,
      height: lastPosition.current.height,
    }
  }

  return (
    <section className={`${gridCols.full} pb-16 md:pb-24`}>
      <div className="flex flex-col gap-12 md:gap-16">
        {/* Header - using grid system for column width */}
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col gap-6">
            {label && <p className="text-sm text-muted-foreground mb-0">{label}</p>}
            {heading && (
              <h2 className="text-4xl font-normal tracking-tight mt-0 mb-0">{heading}</h2>
            )}
            {button?.text && button?.link && (
              <Button asChild size="lg" className="shrink-0 rounded-full w-fit">
                <Link href={button.link}>{button.text}</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Programs List with smooth highlight animation */}
        <div className="space-y-0">
          <ul className="relative" onMouseLeave={() => setHoveredIndex(null)}>
            {/* Animated highlight background */}
            <div
              className="absolute left-0 right-0 bg-foreground rounded-lg transition-all duration-300 ease-out pointer-events-none z-10"
              style={getHighlightStyle()}
            />

            {programs.map((program, index) => {
              const isHovered = hoveredIndex === index
              const isAnyHovered = hoveredIndex !== null
              const isDimmed = isAnyHovered && !isHovered
              // Hide border if this item is hovered OR if previous item is hovered
              const hideBorder = hoveredIndex === index || hoveredIndex === index - 1

              return (
                <li
                  key={index}
                  ref={(el) => {
                    rowRefs.current[index] = el
                  }}
                  className={`relative transition-all duration-300 ${
                    index > 0
                      ? hideBorder
                        ? 'border-t border-transparent'
                        : 'border-t border-border'
                      : ''
                  }`}
                  onMouseEnter={() => setHoveredIndex(index)}
                >
                  <Link
                    href="/programs"
                    className={`relative z-10 flex flex-col md:flex-row md:items-center gap-1 md:gap-8 py-5 md:py-6 transition-all duration-300 ease-out ${
                      isHovered ? 'text-background' : ''
                    }`}
                  >
                    <h4
                      className={`text-3xl font-normal tracking-tight md:w-[360px] md:shrink-0 mt-0 md:-mt-1 mb-0 leading-tight transition-all duration-300 ${
                        isHovered ? 'pl-4' : ''
                      } ${isDimmed ? 'text-muted-foreground' : ''}`}
                    >
                      {program.title}
                    </h4>
                    <p
                      className={`text-base flex-1 mb-0 leading-tight transition-colors duration-300 ${
                        isHovered
                          ? 'text-background'
                          : isDimmed
                            ? 'text-muted-foreground/50'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {program.description}
                    </p>
                    <div
                      className={`hidden md:flex justify-end shrink-0 w-8 transition-all duration-300 ${
                        isHovered ? 'pr-4' : ''
                      }`}
                    >
                      <ArrowRight
                        className={`w-5 h-5 transition-opacity duration-300 ${
                          isHovered ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Footer Link */}
        {footerLink?.text && footerLink?.link && (
          <Link
            href={footerLink.link}
            className="inline-flex items-center gap-2 text-sm font-medium hover:text-muted-foreground transition-colors w-fit"
          >
            {footerLink.text}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </section>
  )
}
