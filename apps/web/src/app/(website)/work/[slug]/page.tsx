import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { sanityFetch } from '@/sanity/client'
import { ALL_CASE_STUDY_SLUGS_QUERY } from '@/sanity/queries'
import { CASE_STUDY_WITH_BLOCKS } from '@/sanity/queries/case-study-queries'
import type { CaseStudy } from '@/sanity/queries'

import { CaseStudyLayout } from '@/components/case-study-layout'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const slugs = await sanityFetch<{ slug: string }[]>(
    ALL_CASE_STUDY_SLUGS_QUERY,
    {},
    { tag: 'caseStudy' },
  )
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params
  const data = await sanityFetch<CaseStudy | null>(
    CASE_STUDY_WITH_BLOCKS,
    { slug },
    { tag: `caseStudy:${slug}` },
  )
  if (!data) return { title: 'Case Study not found' }
  return {
    title: data.seoSettings?.metaTitle || data.title,
    description: data.seoSettings?.metaDescription || data.summary || undefined,
  }
}

export default async function CaseStudyPage(props: PageProps) {
  const { slug } = await props.params
  const data = await sanityFetch<CaseStudy | null>(
    CASE_STUDY_WITH_BLOCKS,
    { slug },
    { tag: `caseStudy:${slug}` },
  )
  if (!data) return notFound()

  return <CaseStudyLayout data={data} />
}
