import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { sanityFetch } from '@/sanity/client'
import {
  CASE_STUDY_TEASER_BY_SLUG,
  CASE_STUDY_WITH_BLOCKS,
  PUBLISHED_CASE_STUDIES,
  caseStudiesTag,
} from '@/sanity/queries/case-study-queries'
import type { CaseStudy } from '@/sanity/queries'

import { CaseStudyLayout } from '@/components/case-study-layout'
import { CaseStudyAccessGate } from '@/components/case-study-access-gate'
import { getPortfolioAccessState } from '@/lib/portfolio-access'
import { attachMuxTokens } from '@/lib/mux-signing'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ access?: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params
  const data = await sanityFetch<CaseStudy | null>(
    CASE_STUDY_TEASER_BY_SLUG,
    { slug },
    { tag: `caseStudy:${slug}` },
  )
  if (!data) return { title: 'Case Study not found' }
  return {
    title: data.title,
    description: data.summary || undefined,
  }
}

export default async function CaseStudyPage(props: PageProps) {
  const { slug } = await props.params
  const searchParams = await props.searchParams
  const [teaser, accessState] = await Promise.all([
    sanityFetch<CaseStudy | null>(
      CASE_STUDY_TEASER_BY_SLUG,
      { slug },
      { tag: `caseStudy:${slug}` },
    ),
    getPortfolioAccessState(),
  ])
  if (!teaser) return notFound()

  if (teaser.visibility === 'recruiter' && !accessState.hasRecruiterAccess) {
    return (
      <CaseStudyAccessGate
        study={teaser}
        denied={searchParams?.access === 'denied'}
        accessSource="none"
      />
    )
  }

  const [data, allStudies] = await Promise.all([
    sanityFetch<CaseStudy | null>(CASE_STUDY_WITH_BLOCKS, { slug }, { tag: `caseStudy:${slug}` }),
    sanityFetch<CaseStudy[]>(PUBLISHED_CASE_STUDIES, {}, { tag: caseStudiesTag }),
  ])
  if (!data) return notFound()

  const otherStudies = allStudies.filter((study) => study.slug.current !== slug).slice(0, 3)

  return (
    <CaseStudyLayout
      data={attachMuxTokens(data)}
      otherStudies={otherStudies}
      hasRecruiterAccess={accessState.hasRecruiterAccess}
      accessSource={accessState.hasRecruiterAccess ? accessState.source : 'none'}
      companySlug={accessState.hasRecruiterAccess ? accessState.companySlug : undefined}
    />
  )
}
