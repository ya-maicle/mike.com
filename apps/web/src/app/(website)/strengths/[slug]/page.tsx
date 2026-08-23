import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { sanityFetch } from '@/sanity/client'
import {
  PROGRAM_BY_SLUG,
  PUBLISHED_PROGRAM_SLUGS,
  programTag,
  programsTag,
} from '@/sanity/queries/program-queries'
import type { Program, ProgramSlug } from '@/sanity/queries/program-queries'
import {
  HOME_PAGE_PROGRAMS_QUERY,
  homePageTag,
  type HomePageProgram,
} from '@/sanity/queries/home-page-queries'
import { ProgramLayout } from '@/components/program-layout'
import { SITE_CONFIG } from '@/lib/constants'
import { createPageMetadata, firstMetadataText } from '@/lib/seo'
import { socialImageFromSanity } from '@/lib/sanity-social-image'

export const dynamic = 'force-static'
export const revalidate = 300

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const programs = await sanityFetch<ProgramSlug[]>(
    PUBLISHED_PROGRAM_SLUGS,
    {},
    { tag: programsTag },
  )

  return programs.map(({ slug }) => ({ slug: slug.current }))
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const { slug } = await props.params
  const data = await sanityFetch<Program | null>(
    PROGRAM_BY_SLUG,
    { slug },
    { tag: programTag(slug) },
  )
  if (!data) return { title: 'Strength not found', robots: { index: false, follow: false } }

  const title = firstMetadataText(data.seoSettings?.metaTitle, data.title) ?? SITE_CONFIG.name
  const description =
    firstMetadataText(
      data.seoSettings?.metaDescription,
      data.summary,
      `${data.title}, one of ${SITE_CONFIG.name}'s core product design strengths.`,
    ) ?? SITE_CONFIG.description

  return createPageMetadata({
    title,
    description,
    path: `/strengths/${slug}`,
    image: socialImageFromSanity(data.seoSettings?.shareImage, title),
  })
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
