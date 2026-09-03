'use client'

import { PageTemplate } from '@/components/page-template'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import * as Icons from '@/components/ui/icons'
import { gridCols } from '@/lib/grid-columns'
import { useLoginModal } from '@/components/providers/login-modal-provider'
import { resolveStudyCoverMedia } from '@/lib/cover-media'
import type { CaseStudy } from '@/sanity/queries'
import { CaseStudyAnalytics } from '@/components/case-study-analytics'
import { CaseStudyByline } from '@/components/case-study-byline'
import { ContentActions } from '@/components/blog-article-actions'
import type { StudyAccessSource } from '@/lib/analytics/events'

type CaseStudyAccessGateProps = {
  study: CaseStudy
  denied?: boolean
  accessSource?: StudyAccessSource
}

export function CaseStudyAccessGate({
  study,
  denied = false,
  accessSource = 'none',
}: CaseStudyAccessGateProps) {
  const { openLogin } = useLoginModal()
  const href = `/work/${study.slug.current}`
  const coverMedia = resolveStudyCoverMedia(study.headerMedia, study.cover, study.coverImage)

  return (
    <CaseStudyAnalytics
      studySlug={study.slug.current}
      studyVisibility="recruiter"
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
        byline={<CaseStudyByline />}
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
          <div className="mx-auto flex max-w-[592px] flex-col items-center gap-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Icon icon={Icons.Lock} size="md" />
            </div>
            <div className="space-y-3">
              <h2 className="m-0 text-3xl font-normal">Log in to view this case study</h2>
              <p className="m-0 text-base text-muted-foreground">
                Some case studies are shared with hiring teams and trusted reviewers.
              </p>
            </div>
            {denied ? (
              <p className="m-0 text-sm text-muted-foreground" role="status" aria-live="polite">
                This email does not currently have access to the full case study.
              </p>
            ) : null}
            <Button
              size="lg"
              onClick={() => openLogin({ returnTo: href, entryPoint: 'case_study_gate' })}
            >
              <Icon icon={Icons.Lock} size="sm" />
              Log in
            </Button>
          </div>
        </section>
      </PageTemplate>
    </CaseStudyAnalytics>
  )
}
