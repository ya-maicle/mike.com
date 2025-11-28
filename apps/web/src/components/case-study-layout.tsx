'use client'

import * as React from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SanityImage } from '@/components/sanity-image'
import { MuxPlayer } from '@/components/mux-player'
import { CaseStudyBlock } from '@/components/case-study-block'
import type { CaseStudy } from '@/sanity/queries'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'

interface CaseStudyLayoutProps {
  data: CaseStudy
}

export function CaseStudyLayout({ data }: CaseStudyLayoutProps) {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)

  const togglePanel = () => setIsPanelOpen(!isPanelOpen)

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
        <div className="min-h-screen pb-24 relative">
          <div className="mx-auto max-w-[592px] pt-6 pb-16 space-y-8 text-center flex flex-col items-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium">
              {data.projectInfo?.year && <span>{data.projectInfo.year}</span>}
              {data.projectInfo?.year && data.projectInfo?.sector && <span>&nbsp;&nbsp;</span>}
              {data.projectInfo?.sector && <span>{data.projectInfo.sector}</span>}
            </div>

            <h1 className="text-5xl font-medium tracking-tight text-foreground leading-none">
              {data.title}
            </h1>

            {data.summary ? (
              <p className="text-lg leading-relaxed text-black dark:text-white">{data.summary}</p>
            ) : null}
          </div>

          {data.headerMedia ? (
            <section className="w-full my-2">
              {data.headerMedia.type === 'video' && data.headerMedia.video?.asset?.playbackId ? (
                <MuxPlayer
                  playbackId={data.headerMedia.video.asset.playbackId}
                  className="w-full h-auto max-h-[90vh] object-cover rounded-[8px] overflow-hidden"
                  autoPlay
                  muted
                  loop
                />
              ) : data.headerMedia.image ? (
                <SanityImage
                  image={data.headerMedia.image}
                  className="w-full h-auto object-cover max-h-[90vh] rounded-[8px]"
                  priority
                  sizes="100vw"
                />
              ) : null}
            </section>
          ) : data.coverImage ? (
            <section className="w-full my-2">
              <SanityImage
                image={data.coverImage}
                className="w-full h-auto object-cover max-h-[90vh] rounded-[8px]"
                priority
                sizes="100vw"
              />
            </section>
          ) : null}

          <div className="space-y-0">
            {data.content?.map((block: NonNullable<CaseStudy['content']>[number], i: number) => (
              <CaseStudyBlock key={block._key || i} block={block} />
            ))}
          </div>
        </div>
      </div>

      {/* Side Panel (Desktop) */}
      <div
        className={cn(
          'hidden md:block transition-all duration-500 ease-in-out bg-background z-50',
          'relative min-h-screen',
          isPanelOpen ? 'w-1/2 opacity-100' : 'w-0 opacity-0 overflow-hidden',
        )}
      >
        <div className="sticky top-16 p-8 flex flex-col">
          <PanelContent data={data} />
        </div>
      </div>

      {/* Side Panel (Mobile - Portal) */}
      {isPanelOpen &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="md:hidden fixed top-0 right-0 w-full h-[100dvh] z-40 bg-background overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="p-8 pt-14 pb-32 min-h-full flex flex-col">
              <PanelContent data={data} />
            </div>
            {/* Mobile Close Button */}
            <div className="fixed left-0 right-0 bottom-0 pointer-events-none z-[110]">
              <div className="sticky bottom-0 flex flex-col justify-end pb-8 items-center">
                <div className="pointer-events-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={togglePanel}
                    className="shadow-none bg-secondary/40 backdrop-blur-md hover:bg-secondary/60 hover:scale-105 transition-all duration-300 cursor-pointer"
                  >
                    <Plus className="size-4 transition-transform duration-300 ease-in-out rotate-45" />
                    About the project
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Sticky Button - Restored "Absolute + Sticky" behavior */}
      <div className="absolute left-0 right-0 bottom-0 top-[-5rem] md:top-[-6rem] pointer-events-none z-[60]">
        <div className="sticky top-0 h-[100dvh] flex flex-col justify-end pb-8 items-center">
          <div className="pointer-events-auto">
            <Button
              variant="secondary"
              size="lg"
              onClick={togglePanel}
              className="shadow-none bg-secondary/40 backdrop-blur-md hover:bg-secondary/60 hover:scale-105 transition-all duration-300 cursor-pointer"
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
        <div className="space-y-0 text-xl leading-relaxed text-black dark:text-white">
          {data.panelContent.map((block: any, i: number) => (
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
            <p className="text-lg">{data.projectInfo?.sector}</p>
          </div>
        )}
        {data.projectInfo?.discipline && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Discipline</h3>
            <p className="text-lg">{data.projectInfo?.discipline}</p>
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
              href={data.projectInfo?.link}
              target="_blank"
              className="text-lg underline hover:text-muted-foreground transition-colors"
            >
              Visit Project
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
