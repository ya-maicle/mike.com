'use client'

import * as React from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageTemplate } from '@/components/page-template'
import { CaseStudyBlock } from '@/components/case-study-block'
import { PortableText } from 'next-sanity'
import { gridComponents } from '@/components/portable-text-grid'
import type { CaseStudy } from '@/sanity/queries'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

interface CaseStudyLayoutProps {
  data: CaseStudy
}

export function CaseStudyLayout({ data }: CaseStudyLayoutProps) {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)

  const togglePanel = () => setIsPanelOpen(!isPanelOpen)

  // Close panel when mobile navigation opens
  React.useEffect(() => {
    const handleNavOpening = () => {
      setIsPanelOpen(false)
    }

    window.addEventListener('mobile-nav-opening', handleNavOpening)
    return () => {
      window.removeEventListener('mobile-nav-opening', handleNavOpening)
    }
  }, [])

  // Lock body scroll when mobile panel is open
  React.useEffect(() => {
    const mobileMediaQuery = window.matchMedia('(max-width: 767px)')

    const handleScrollLock = () => {
      if (isPanelOpen && mobileMediaQuery.matches) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    // Initial check
    handleScrollLock()

    // Listen for changes
    mobileMediaQuery.addEventListener('change', handleScrollLock)

    return () => {
      mobileMediaQuery.removeEventListener('change', handleScrollLock)
      document.body.style.overflow = ''
    }
  }, [isPanelOpen])

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row">
      {/* Main Content Area */}
      <div
        className={cn(
          'flex-1 transition-all duration-500 ease-in-out w-full',
          isPanelOpen ? 'md:w-1/2' : 'w-full',
        )}
      >
        <PageTemplate
          title={data.title}
          metadata={
            [
              data.projectInfo?.year,
              ...(Array.isArray(data.projectInfo?.sector)
                ? data.projectInfo.sector
                : [data.projectInfo?.sector]),
            ].filter(Boolean) as string[]
          }
          subtitle={data.summary}
          className="pb-0"
          coverMedia={
            data.headerMedia?.type === 'video' && data.headerMedia?.video?.asset?.playbackId
              ? { type: 'video', video: data.headerMedia.video }
              : data.headerMedia?.image
                ? { type: 'image', image: data.headerMedia.image }
                : data.coverImage
                  ? { type: 'image', image: data.coverImage }
                  : undefined
          }
        >
          {data.content && <PortableText value={data.content} components={gridComponents} />}
        </PageTemplate>
      </div>

      {/* Side Panel (Desktop) */}
      <div
        className={cn(
          'hidden md:block transition-all duration-500 ease-in-out bg-background z-50',
          'relative',
          isPanelOpen ? 'min-h-screen w-1/2 opacity-100' : 'w-0 opacity-0 overflow-hidden',
        )}
      >
        {isPanelOpen && (
          <div className="sticky top-16 p-8 flex flex-col">
            <PanelContent data={data} />
          </div>
        )}
      </div>

      {/* Side Panel (Mobile - Portal) */}
      {isPanelOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="md:hidden fixed top-0 right-0 w-full h-[100dvh] z-[45] bg-background overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-8 pt-14 pb-32 min-h-full flex flex-col">
              <PanelContent data={data} />
            </div>
          </div>,
          document.body,
        )}

      {/* Sticky Button - Mobile uses portal, Desktop uses absolute positioning */}
      {isPanelOpen && typeof document !== 'undefined'
        ? // Mobile: Render button as portal when panel is open to ensure proper z-index stacking
          createPortal(
            <div className="md:hidden fixed left-0 right-0 bottom-0 pointer-events-none z-[70]">
              <div className="flex flex-col justify-end pb-8 items-center">
                <div className="pointer-events-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={togglePanel}
                    className="shadow-none bg-border/90 backdrop-blur-md hover:bg-border/95 hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <Plus className="size-4 transition-transform duration-300 ease-in-out rotate-45" />
                    About the project
                  </Button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
      {/* Desktop button and mobile button when panel is closed */}
      <div
        className={cn(
          'absolute left-0 right-0 bottom-0 top-[-5rem] md:top-[-6rem] pointer-events-none z-[70]',
          isPanelOpen && 'max-md:hidden',
        )}
      >
        <div className="sticky top-0 h-[100dvh] flex flex-col justify-end pb-8 items-center">
          <div className="pointer-events-auto">
            <Button
              variant="secondary"
              size="lg"
              onClick={togglePanel}
              className="shadow-none bg-border/90 backdrop-blur-md hover:bg-border/95 hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <Plus
                className={cn(
                  'size-4 transition-transform duration-300 ease-in-out',
                  isPanelOpen ? 'rotate-45' : 'rotate-0',
                )}
              />
              About the project
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PanelContent({ data }: { data: CaseStudy }) {
  return (
    <div className="max-w-[592px] mx-auto w-full space-y-8 pb-24">
      {/* Panel Content */}
      {data.panelContent && (
        <div className="space-y-0">
          {data.panelContent.map((block, i) => (
            <CaseStudyBlock key={block._key || i} block={block} />
          ))}
        </div>
      )}

      {/* Metadata Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-6">
        {data.projectInfo?.client && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Client</h3>
            <p className="text-lg">{data.projectInfo?.client}</p>
          </div>
        )}
        {data.projectInfo?.sector && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Sector</h3>
            <p className="text-lg">
              {Array.isArray(data.projectInfo.sector)
                ? data.projectInfo.sector.join(', ')
                : data.projectInfo.sector}
            </p>
          </div>
        )}
        {data.projectInfo?.discipline && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Discipline</h3>
            <p className="text-lg">
              {Array.isArray(data.projectInfo.discipline)
                ? data.projectInfo.discipline.join(', ')
                : data.projectInfo.discipline}
            </p>
          </div>
        )}
        {data.projectInfo?.year && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Year</h3>
            <p className="text-lg">{data.projectInfo?.year}</p>
          </div>
        )}
        {data.projectInfo?.link && (
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Link</h3>
            <Link
              href={
                typeof data.projectInfo.link === 'string'
                  ? data.projectInfo.link
                  : data.projectInfo.link.url || '#'
              }
              target="_blank"
              className="text-lg underline hover:text-muted-foreground transition-colors"
            >
              {typeof data.projectInfo.link === 'string'
                ? 'Visit Project'
                : data.projectInfo.link.text || 'Visit Project'}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
