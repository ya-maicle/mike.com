'use client'

import * as React from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageTemplate } from '@/components/page-template'
import { CaseStudyBlock } from '@/components/case-study-block'
import { PortableText } from 'next-sanity'
import { gridComponents } from '@/components/portable-text-grid'
import { KeepExploringSection } from '@/components/keep-exploring-section'
import type { ProjectCardData } from '@/components/project-card'
import type { CaseStudy } from '@/sanity/queries'
import { resolveStudyCoverMedia } from '@/lib/cover-media'
import { cn } from '@/lib/utils'
import { createPortal } from 'react-dom'
import { CaseStudyAnalytics } from '@/components/case-study-analytics'
import { CaseStudyByline } from '@/components/case-study-byline'
import { ContentActions } from '@/components/blog-article-actions'
import type { StudyAccessSource } from '@/lib/analytics/events'

interface CaseStudyLayoutProps {
  data: CaseStudy
  otherStudies?: ProjectCardData[]
  hasRecruiterAccess?: boolean
  accessSource?: StudyAccessSource
  companySlug?: string
}

export function CaseStudyLayout({
  data,
  otherStudies,
  hasRecruiterAccess = false,
  accessSource = 'none',
  companySlug,
}: CaseStudyLayoutProps) {
  const [isPanelOpen, setIsPanelOpen] = React.useState(false)
  const narrationAsset = data.narration?.audioFile?.asset
  const narrationDuration = data.narration?.durationSeconds
  const hasNarration =
    narrationAsset?.url &&
    narrationAsset.mimeType === 'audio/mpeg' &&
    typeof narrationDuration === 'number' &&
    narrationDuration > 0

  const togglePanel = () => setIsPanelOpen((current) => !current)

  React.useEffect(() => {
    const handleNavOpening = () => {
      setIsPanelOpen(false)
    }

    window.addEventListener('mobile-nav-opening', handleNavOpening)
    return () => {
      window.removeEventListener('mobile-nav-opening', handleNavOpening)
    }
  }, [])

  React.useEffect(() => {
    const mobileMediaQuery = window.matchMedia('(max-width: 767px)')

    const handleScrollLock = () => {
      if (isPanelOpen && mobileMediaQuery.matches) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    }

    handleScrollLock()
    mobileMediaQuery.addEventListener('change', handleScrollLock)

    return () => {
      mobileMediaQuery.removeEventListener('change', handleScrollLock)
      document.body.style.overflow = ''
    }
  }, [isPanelOpen])

  return (
    <CaseStudyAnalytics
      studySlug={data.slug.current}
      studyVisibility={data.visibility ?? 'public'}
      viewState="unlocked"
      accessSource={accessSource}
      companySlug={companySlug}
    >
      <div
        data-case-study-layout
        data-panel-open={isPanelOpen}
        className={cn(
          'relative min-h-screen flex flex-col md:flex-row',
          isPanelOpen && 'case-study-panel-open',
        )}
      >
        <div
          data-case-study-main
          className={cn(
            'min-w-0 flex-1 transition-all duration-500 ease-in-out w-full',
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
            byline={<CaseStudyByline />}
            className="pb-0"
            coverMedia={resolveStudyCoverMedia(data.headerMedia, data.cover, data.coverImage)}
            frameCoverMedia
            headerActions={
              <ContentActions
                content={{ type: 'case-study', slug: data.slug.current }}
                shareText={data.summary ?? data.title}
                listenLabel="Listen to case study"
                audioUrl={hasNarration ? narrationAsset.url : undefined}
                durationSeconds={hasNarration ? narrationDuration : undefined}
              />
            }
          >
            {data.content && <PortableText value={data.content} components={gridComponents} />}
            {otherStudies && (
              <KeepExploringSection
                projects={otherStudies}
                hasRecruiterAccess={hasRecruiterAccess}
              />
            )}
          </PageTemplate>
        </div>

        <div
          data-case-study-panel
          className={cn(
            'hidden md:block transition-all duration-500 ease-in-out bg-background z-30',
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

        {isPanelOpen && typeof document !== 'undefined'
          ? createPortal(
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
    </CaseStudyAnalytics>
  )
}

function PanelContent({ data }: { data: CaseStudy }) {
  return (
    <div className="max-w-[592px] mx-auto w-full space-y-8 pb-24">
      {data.panelContent && (
        <div className="space-y-0">
          {data.panelContent.map((block, i) => (
            <CaseStudyBlock key={block._key || i} block={block} />
          ))}
        </div>
      )}

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
