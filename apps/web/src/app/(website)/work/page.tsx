import type { Metadata } from 'next'
import { absoluteUrl, createPageMetadata } from '@/lib/seo'
import { sanityFetch } from '@/sanity/client'
import { PUBLISHED_CASE_STUDIES } from '@/sanity/queries/case-study-queries'
import type { CaseStudy } from '@/sanity/queries'
import { WorkCaseStudyList } from '@/components/work-case-study-list'
import { HomeLogoStrip } from '@/components/home-logo-strip'
import { getPortfolioAccessState } from '@/lib/portfolio-access'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = createPageMetadata({
  title: 'Case Studies',
  description:
    'Selected product design case studies spanning agentic AI, strategy, systems, and complex digital products.',
  path: '/work',
  image: {
    url: absoluteUrl('/social/work.jpg'),
    width: 1200,
    height: 630,
    alt: 'Selected product design case studies by Mike Iukhtenko',
  },
})

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
        <header className="max-w-[592px] mx-auto text-center flex flex-col items-center pt-8 md:pt-10 pb-8 md:pb-10 space-y-4 md:space-y-6">
          <HomeLogoStrip hideLeaves />
          <h1>Case Studies</h1>
          <p className="text-xl text-foreground leading-relaxed max-w-prose mt-2">
            An archive of projects completed
            {earliestYear ? ` between ${earliestYear} and` : ' through'} {currentYear}.
          </p>
        </header>
      </div>

      <WorkCaseStudyList
        caseStudies={caseStudies}
        hasRecruiterAccess={accessState.hasRecruiterAccess}
      />
    </div>
  )
}
