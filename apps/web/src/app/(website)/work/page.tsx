import type { Metadata } from 'next'
import { sanityFetch } from '@/sanity/client'
import { PUBLISHED_CASE_STUDIES } from '@/sanity/queries/case-study-queries'
import type { CaseStudy } from '@/sanity/queries'
import { WorkCaseStudyList } from '@/components/work-case-study-list'
import { ClientLogoStrip } from '@/components/client-logo-strip'
import { getPortfolioAccessState } from '@/lib/portfolio-access'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Portfolio of work and projects',
}

export default async function WorkPage() {
  const [caseStudies, accessState] = await Promise.all([
    sanityFetch<CaseStudy[]>(PUBLISHED_CASE_STUDIES, {}, { tag: 'caseStudies' }),
    getPortfolioAccessState(),
  ])

  const earliestYear = caseStudies.reduce<number | null>((min, s) => {
    const y = s.projectInfo?.year ? parseInt(s.projectInfo.year, 10) : null
    return y !== null && (min === null || y < min) ? y : min
  }, null)
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex flex-col pb-16 md:pb-24">
      <div className="max-w-[var(--content-max-width)] mx-auto w-full">
        <header className="max-w-[592px] mx-auto text-center flex flex-col items-center pt-4 md:pt-6 pb-8 md:pb-10 space-y-4 md:space-y-6">
          <div className="flex items-center gap-4 text-sm font-normal text-foreground">
            <span>Work Archive</span>
          </div>
          <h1>Case Studies</h1>
          <p className="text-xl text-foreground leading-relaxed max-w-prose mt-2">
            An archive of projects completed
            {earliestYear ? ` between ${earliestYear} and` : ' through'} {currentYear}.
          </p>
        </header>
      </div>

      <ClientLogoStrip />

      <div className="pb-8 md:pb-10" />

      <WorkCaseStudyList
        caseStudies={caseStudies}
        hasRecruiterAccess={accessState.hasRecruiterAccess}
      />
    </div>
  )
}
