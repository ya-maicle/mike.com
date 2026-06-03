import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { sanityFetch } from '@/sanity/client'
import { PROGRAM_BY_SLUG, programTag } from '@/sanity/queries/program-queries'
import type { Program } from '@/sanity/queries/program-queries'
import {
  HOME_PAGE_PROGRAMS_QUERY,
  homePageTag,
  type HomePageProgram,
} from '@/sanity/queries/home-page-queries'
import { ProgramLayout } from '@/components/program-layout'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params
  const data = await sanityFetch<Program | null>(
    PROGRAM_BY_SLUG,
    { slug },
    { tag: programTag(slug) },
  )
  if (!data) return { title: 'Strength not found' }
  return {
    title: data.seoSettings?.metaTitle || data.title,
    description: data.seoSettings?.metaDescription || data.summary,
  }
}

export default async function StrengthPage(props: PageProps) {
  const { slug } = await props.params

  const [data, homePrograms] = await Promise.all([
    sanityFetch<Program | null>(PROGRAM_BY_SLUG, { slug }, { tag: programTag(slug) }),
    sanityFetch<HomePageProgram[] | null>(HOME_PAGE_PROGRAMS_QUERY, {}, { tag: homePageTag }),
  ])

  if (!data) return notFound()

  const otherPrograms = (homePrograms ?? []).filter((program) => program._id !== data._id)

  return <ProgramLayout data={data} otherPrograms={otherPrograms} />
}
