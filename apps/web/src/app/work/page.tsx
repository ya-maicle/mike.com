import type { Metadata } from 'next'
import Link from 'next/link'
import { sanityFetch } from '@/sanity/client'
import { PUBLISHED_CASE_STUDIES } from '@/sanity/queries/case-study-queries'
import type { CaseStudy } from '@/sanity/queries'
import { Button } from '@/components/ui/button'
import { SanityImage } from '@/components/sanity-image'

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
    <div className="flex flex-col gap-16 py-8 lg:gap-32 lg:py-16">
      {caseStudies.map((study) => (
        <section key={study._id} className="group grid gap-8 lg:gap-12 items-end lg:grid-cols-2">
          <div className="flex flex-col items-start space-y-4 lg:space-y-6 lg:order-1">
            <div className="space-y-2 lg:space-y-3">
              <h2 className="text-5xl font-normal tracking-tight text-foreground">{study.title}</h2>
              {study.summary ? (
                <p className="max-w-[600px] text-xl text-foreground leading-relaxed">
                  {study.summary}
                </p>
              ) : null}
            </div>

            <Button asChild variant="secondary">
              <Link href={`/work/${study.slug.current}`}>View Case Study</Link>
            </Button>
          </div>

          <div className="relative aspect-square overflow-hidden bg-muted rounded-lg lg:order-2">
            {study.coverImage ? (
              <SanityImage
                image={study.coverImage}
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            ) : null}
          </div>
        </section>
      ))}
    </div>
  )
}
