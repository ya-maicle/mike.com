import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cache } from 'react'

import { sanityFetch } from '@/sanity/client'
import { PUBLISHED_PROGRAMS, programsTag } from '@/sanity/queries/program-queries'
import type { Program } from '@/sanity/queries/program-queries'
import { programPath } from '@/lib/program-display'
import { createPageMetadata } from '@/lib/seo'
import { shouldIndexStrengthsArchive, strengthsArchiveDescription } from '@/lib/search-indexing'

export const dynamic = 'force-static'
export const revalidate = 300

const getPublishedPrograms = cache(() =>
  sanityFetch<Program[]>(PUBLISHED_PROGRAMS, {}, { tag: programsTag }),
)

export async function generateMetadata(): Promise<Metadata> {
  const programs = await getPublishedPrograms()

  return createPageMetadata({
    title: 'What I Bring',
    description: strengthsArchiveDescription(programs.length),
    path: '/strengths',
    noIndex: !shouldIndexStrengthsArchive(programs.length),
  })
}

export default async function StrengthsPage() {
  const programs = await getPublishedPrograms()

  return (
    <div className="flex flex-col pb-16 md:pb-24">
      <div className="max-w-[var(--content-max-width)] mx-auto w-full px-4">
        <header className="max-w-[592px] mx-auto text-center flex flex-col items-center pt-4 md:pt-6 pb-12 md:pb-16 space-y-4 md:space-y-6">
          <div className="flex items-center gap-4 text-sm font-normal text-foreground">
            <span>My strengths</span>
          </div>
          <h1>What I bring</h1>
          <p className="text-xl text-foreground leading-relaxed max-w-prose mt-2">
            {strengthsArchiveDescription(programs.length)}
          </p>
        </header>

        {programs.length > 0 && (
          <ul className="max-w-[720px] mx-auto">
            {programs.map((program, index) => (
              <li key={program._id} className={index > 0 ? 'border-t border-border' : undefined}>
                <Link
                  href={programPath(program.slug.current)}
                  className="group flex flex-col gap-1 py-6 md:flex-row md:items-center md:gap-8"
                >
                  <h2 className="mt-0 mb-0 text-3xl font-normal leading-tight md:w-[360px] md:shrink-0">
                    {program.title}
                  </h2>
                  <p className="mb-0 flex-1 text-base leading-tight text-muted-foreground">
                    {program.homeListDescription}
                  </p>
                  <ArrowRight className="hidden size-5 shrink-0 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 md:block" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
