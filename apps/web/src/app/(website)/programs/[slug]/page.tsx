import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { sanityFetch } from '@/sanity/client'
import { PROGRAM_BY_SLUG, programTag } from '@/sanity/queries/program-queries'
import type { Program } from '@/sanity/queries/program-queries'
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
  if (!data) return { title: 'Program not found' }
  return {
    title: data.seoSettings?.metaTitle || data.title,
    description: data.seoSettings?.metaDescription || data.summary,
  }
}

export default async function ProgramPage(props: PageProps) {
  const { slug } = await props.params
  const data = await sanityFetch<Program | null>(
    PROGRAM_BY_SLUG,
    { slug },
    { tag: programTag(slug) },
  )
  if (!data) return notFound()

  return <ProgramLayout data={data} />
}
