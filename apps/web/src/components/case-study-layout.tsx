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

interface CaseStudyLayoutProps {
  data: CaseStudy
}

export function CaseStudyLayout({ data }: CaseStudyLayoutProps) {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)

  const togglePanel = () => setIsPanelOpen(!isPanelOpen)

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
            {data.content?.map((block: any, i: number) => (
              <CaseStudyBlock key={block._key || i} block={block} />
            ))}
          </div>
        </div>
      </div>

      {/* Side Panel */}
      <div
        className={cn(
          'transition-all duration-500 ease-in-out bg-background z-50',
          // Desktop styles: Relative flex child (pushes content)
          'md:relative md:h-auto md:block',
          isPanelOpen ? 'md:w-1/2 md:opacity-100' : 'md:w-0 md:opacity-0 md:overflow-hidden',
          // Mobile styles: Fixed full screen (hidden when closed on mobile ONLY)
          !isPanelOpen && 'hidden',
          isPanelOpen &&
            'fixed inset-0 block w-full h-full overflow-y-auto md:inset-auto md:overflow-visible',
        )}
      >
        {/* Sticky Content Container */}
        <div className="md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:overflow-y-auto p-8 min-h-screen flex flex-col">
          <div className="max-w-[592px] mx-auto w-full space-y-8 pb-24">
            <div>
              <h2 className="text-3xl font-medium tracking-tight mb-4">About the project</h2>
              {data.summary && (
                <p className="text-lg leading-relaxed text-muted-foreground">{data.summary}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
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
                <div>
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
        </div>
      </div>

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
