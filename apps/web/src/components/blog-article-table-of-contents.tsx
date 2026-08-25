'use client'

import { useEffect, useState, type MouseEvent } from 'react'

import { ArticleTocChevronIcon } from '@/components/ui/icon'
import type { ArticleHeading } from '@/lib/article-headings'
import { cn } from '@/lib/utils'

type BlogArticleTableOfContentsProps = {
  headings: ArticleHeading[]
}

function ArticleTableOfContentsLinks({
  headings,
  activeId,
  mobile = false,
  onSelect,
}: {
  headings: ArticleHeading[]
  activeId: string
  mobile?: boolean
  onSelect: (event: MouseEvent<HTMLAnchorElement>, heading: ArticleHeading) => void
}) {
  return (
    <ul className="flex w-full flex-col">
      {headings.map((heading) => {
        const active = heading.id === activeId
        return (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              aria-current={active ? 'true' : 'false'}
              onClick={(event) => onSelect(event, heading)}
              className={cn(
                'block w-full text-xs leading-tight transition-colors duration-200 focus-visible:outline focus-visible:outline-foreground',
                mobile ? 'px-6 pb-5' : 'py-2',
                active ? 'text-foreground' : 'text-foreground/60 hover:text-foreground',
              )}
            >
              {heading.text}
            </a>
          </li>
        )
      })}
    </ul>
  )
}

export function BlogArticleTableOfContents({ headings }: BlogArticleTableOfContentsProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? '')
  const [hasEnteredArticle, setHasEnteredArticle] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!headings.length) return

    let animationFrame = 0
    const updateActiveHeading = () => {
      animationFrame = 0
      const activationLine = window.innerHeight * 0.25
      const atPageEnd =
        window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
      let nextActiveId = headings[0].id
      let enteredArticle = false

      for (const heading of headings) {
        const element = document.getElementById(heading.id)
        if (!element) continue
        const headingTop = element.getBoundingClientRect().top
        if (headingTop > activationLine && !(atPageEnd && headingTop < window.innerHeight)) continue
        nextActiveId = heading.id
        enteredArticle = true
      }

      setActiveId(nextActiveId)
      setHasEnteredArticle(enteredArticle)
    }
    const scheduleUpdate = () => {
      if (animationFrame) return
      animationFrame = window.requestAnimationFrame(updateActiveHeading)
    }

    updateActiveHeading()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', scheduleUpdate)
      if (animationFrame) window.cancelAnimationFrame(animationFrame)
    }
  }, [headings])

  if (!headings.length) return null

  function selectHeading(event: MouseEvent<HTMLAnchorElement>, heading: ArticleHeading) {
    event.preventDefault()
    const target = document.getElementById(heading.id)
    if (!target) return

    setActiveId(heading.id)
    setMobileOpen(false)
    target.scrollIntoView({
      block: 'start',
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }

  const activeHeading = headings.find((heading) => heading.id === activeId) ?? headings[0]

  return (
    <>
      <nav
        aria-label="Table of contents"
        aria-hidden="false"
        className="sticky top-28 z-10 col-span-2 col-start-1 row-start-1 -ml-4 hidden max-h-[calc(100dvh-7rem)] self-start overflow-y-auto pb-6 pl-4 @6xl:block"
      >
        <ArticleTableOfContentsLinks
          headings={headings}
          activeId={activeId}
          onSelect={selectHeading}
        />
      </nav>

      <nav
        aria-label="Table of contents"
        data-show-toc={hasEnteredArticle}
        className={cn(
          'sticky top-[var(--mobile-site-header-offset)] z-40 col-span-full row-start-1 -mx-6 h-0 w-[calc(100%+3rem)] -translate-y-px transition-opacity duration-300 @6xl:hidden',
          hasEnteredArticle ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <div className="absolute inset-x-0 top-0 border-b border-foreground/[0.04] bg-background">
          {!mobileOpen ? (
            <button
              type="button"
              aria-expanded="false"
              className="flex h-11 w-full items-center px-6 text-left focus-visible:outline focus-visible:outline-foreground"
              onClick={() => setMobileOpen(true)}
            >
              <span className="truncate pe-5 text-xs leading-tight">{activeHeading.text}</span>
              <span className="ml-auto flex size-9 shrink-0 items-center justify-center">
                <ArticleTocChevronIcon />
              </span>
            </button>
          ) : (
            <button
              type="button"
              aria-label="Close table of contents"
              aria-expanded="true"
              className="absolute right-6 top-0 z-10 flex h-11 w-9 items-center justify-center focus-visible:outline focus-visible:outline-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <ArticleTocChevronIcon className="rotate-180 transition-transform duration-200" />
            </button>
          )}

          <div
            aria-hidden={!mobileOpen}
            inert={!mobileOpen}
            className={cn(
              'grid overflow-hidden transition-[grid-template-rows] duration-300',
              mobileOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            )}
          >
            <div className="min-h-0 overflow-y-auto">
              <ArticleTableOfContentsLinks
                headings={headings}
                activeId={activeId}
                mobile
                onSelect={selectHeading}
              />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
