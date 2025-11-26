import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { sanityFetch } from '@/sanity/client'
import { PUBLISHED_CASE_STUDIES } from '@/sanity/queries/case-study-queries'
import type { CaseStudy } from '@/sanity/queries'
import { imageUrl } from '@/sanity/image'
import { Button } from '@/components/ui/button'

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
        <section
          key={study._id}
          className="group grid gap-8 lg:gap-12 items-end lg:grid-cols-[1fr_1.5fr]"
        >
          {/* Content Side - Left, Aligned Bottom */}
          <div className="flex flex-col items-start space-y-4 lg:space-y-6 lg:order-1">
            <div className="space-y-2 lg:space-y-3">
              <h2 className="text-3xl font-normal tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl text-foreground">
                {study.title}
              </h2>
              {study.summary ? (
                <p className="max-w-[600px] text-base sm:text-lg lg:text-xl text-foreground leading-relaxed">
                  {study.summary}
                </p>
              ) : null}
            </div>

            <Button asChild variant="secondary">
              <Link href={`/work/${study.slug.current}`}>View Case Study</Link>
            </Button>
          </div>

          {/* Image Side - Right */}
          <div className="relative aspect-square overflow-hidden bg-muted rounded-lg lg:order-2">
            {study.coverImage ? (
              <Image
                src={imageUrl(study.coverImage, { width: 2400, quality: 100 })}
                alt={study.coverImage.alt || study.title}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 60vw, 100vw"
              />
            ) : null}
          </div>
        </section>
      ))}
    </div>
  )
}
