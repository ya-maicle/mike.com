'use client'

import { PageTemplate } from '@/components/page-template'
import { gridCols } from '@/lib/grid-columns'
import { resolveStudyCoverMedia } from '@/lib/cover-media'
import type { CaseStudy } from '@/sanity/queries'
import { CaseStudyAnalytics } from '@/components/case-study-analytics'
import { CaseStudyByline } from '@/components/case-study-byline'
import { ContentActions } from '@/components/blog-article-actions'
import type { StudyAccessSource } from '@/lib/analytics/events'

import { CaseStudyAccessPanel } from '@/components/case-study-access-panel'
import { Button } from '@/components/ui/button'

type CaseStudyAccessGateProps = {
  study: CaseStudy
  blocked?: boolean
  accessSource?: StudyAccessSource
}

export function CaseStudyAccessGate({
  study,
  blocked = false,
  accessSource = 'none',
}: CaseStudyAccessGateProps) {
  const coverMedia = resolveStudyCoverMedia(study.headerMedia, study.cover, study.coverImage)

  return (
    <CaseStudyAnalytics
      studySlug={study.slug.current}
      studyVisibility={study.visibility ?? 'recruiter'}
      viewState="locked"
      accessSource={accessSource}
    >
      <PageTemplate
        title={study.title}
        metadata={
          [
            study.projectInfo?.year,
            ...(Array.isArray(study.projectInfo?.sector)
              ? study.projectInfo.sector
              : [study.projectInfo?.sector]),
          ].filter(Boolean) as string[]
        }
        subtitle={study.summary}
        byline={
          <div className="space-y-5">
            <CaseStudyByline />
            <Button variant="secondary" asChild>
              <a href="#request-access">
                {study.visibility === 'members' ? 'Sign in to read' : 'Portfolio access'}
              </a>
            </Button>
          </div>
        }
        coverMedia={coverMedia}
        className="pb-0"
        headerActions={
          <ContentActions
            content={{ type: 'case-study', slug: study.slug.current }}
            shareText={study.summary ?? study.title}
            listenLabel="Listen to case study"
          />
        }
      >
        <section data-nosnippet className={`${gridCols.narrow} py-16 md:py-24`}>
          <CaseStudyAccessPanel
            studySlug={study.slug.current}
            visibility={study.visibility}
            blocked={blocked}
          />
        </section>
      </PageTemplate>
    </CaseStudyAnalytics>
  )
}
