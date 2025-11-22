import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { sanityFetch } from '@/sanity/client'
import { PUBLISHED_CASE_STUDIES } from '@/sanity/queries/case-study-queries'
import type { CaseStudy } from '@/sanity/queries'
import { imageUrl } from '@/sanity/image'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Work - Mike Y.',
  description: 'Portfolio of work and projects',
}

export default async function WorkPage() {
  const caseStudies = await sanityFetch<CaseStudy[]>(
    PUBLISHED_CASE_STUDIES,
    {},
    { tag: 'caseStudies' },
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {caseStudies.map((study) => (
        <Link
          key={study._id}
          href={`/work/${study.slug.current}`}
          className="group block space-y-3"
        >
          <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
            {study.coverImage ? (
              <Image
                src={imageUrl(study.coverImage, { width: 800 })}
                alt={study.coverImage.alt || study.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            ) : null}
          </div>
          <div className="space-y-1">
            <h2 className="font-semibold tracking-tight group-hover:underline">{study.title}</h2>
            {study.summary ? (
              <p className="text-sm text-muted-foreground line-clamp-2">{study.summary}</p>
            ) : null}
            {study.projectInfo?.client ? (
              <div className="pt-1">
                <Badge variant="secondary" className="text-[10px]">
                  {study.projectInfo.client}
                </Badge>
              </div>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  )
}
