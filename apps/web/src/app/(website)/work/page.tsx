import type { Metadata } from 'next'
import Link from 'next/link'
import { sanityFetch } from '@/sanity/client'
import { PUBLISHED_CASE_STUDIES } from '@/sanity/queries/case-study-queries'
import type { CaseStudy } from '@/sanity/queries'
import { SanityImage } from '@/components/sanity-image'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Portfolio of work and projects',
}

const TILE_ASPECT_CLASSES = [
  'aspect-[4/5]',
  'aspect-[3/4]',
  'aspect-[2/3]',
  'aspect-[5/7]',
] as const
const TILE_ASPECT_RATIOS = ['4/5', '3/4', '2/3', '5/7'] as const
const TILE_HIDE_CLASSES = ['', 'hidden sm:block', 'hidden md:block', 'hidden lg:block'] as const

export default async function WorkPage() {
  const caseStudies = await sanityFetch<CaseStudy[]>(
    PUBLISHED_CASE_STUDIES,
    {},
    { tag: 'caseStudies' },
  )

  return (
    <div className="flex flex-col gap-12 pb-16 md:gap-16 md:pb-24">
      <div className="max-w-[var(--content-max-width)] mx-auto w-full">
        <header className="max-w-[592px] mx-auto text-center flex flex-col items-center pt-4 md:pt-6 pb-12 md:pb-16 space-y-4 md:space-y-6">
          <div className="flex items-center gap-4 text-sm font-normal text-foreground">
            <span>Work Archive</span>
          </div>
          <h1>Case Studies</h1>
          <p className="text-xl text-foreground leading-relaxed max-w-prose mt-2">
            An archive of projects completed between 2023 and 2026.
          </p>
        </header>
      </div>

      <div className="flex flex-col gap-12 md:gap-16">
        {caseStudies.map((study, index) => {
          const images = (
            study.listingImages?.length
              ? study.listingImages
              : study.coverImage
                ? [study.coverImage]
                : []
          ).slice(0, 4)

          return (
            <Link
              key={study._id}
              href={`/work/${study.slug.current}`}
              className="group flex flex-col gap-4 cursor-pointer"
            >
              {images.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 items-end">
                  {images.map((image, i) => {
                    const hideClass = TILE_HIDE_CLASSES[i] ?? ''
                    const aspectClass = TILE_ASPECT_CLASSES[i] ?? 'aspect-[3/4]'
                    const aspectRatio = TILE_ASPECT_RATIOS[i] ?? '3/4'
                    return (
                      <div
                        key={i}
                        className={`group/card [perspective:1500px] ${aspectClass} ${hideClass}`.trim()}
                      >
                        <div className="relative h-full w-full overflow-hidden rounded-lg bg-muted origin-bottom will-change-transform [transition:transform_800ms_cubic-bezier(0.19,1,0.22,1)] [@media(hover:hover)_and_(pointer:fine)]:group-hover/card:[transform:rotateX(-10deg)]">
                          <SanityImage
                            image={image}
                            className="h-full w-full object-cover"
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                            aspectRatio={aspectRatio}
                            priority={index === 0 && i === 0}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : null}

              <div className="flex flex-col space-y-2 transition-opacity duration-200 group-hover:opacity-60">
                <h4 className="text-3xl font-normal leading-tight text-foreground">
                  {study.title}
                </h4>
                {study.summary ? (
                  <p className="text-base text-foreground">{study.summary}</p>
                ) : null}
                {study.projectInfo?.sector?.length || study.projectInfo?.year ? (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {study.projectInfo?.sector?.length ? (
                      <span>{study.projectInfo.sector.join(', ')}</span>
                    ) : null}
                    {study.projectInfo?.year ? <span>{study.projectInfo.year}</span> : null}
                  </div>
                ) : null}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
