import type { Metadata } from 'next'
import Link from 'next/link'
import { sanityFetch } from '@/sanity/client'
import { PUBLISHED_CASE_STUDIES } from '@/sanity/queries/case-study-queries'
import type { CaseStudy } from '@/sanity/queries'
import { SanityImage } from '@/components/sanity-image'
import { DecorativeVideo } from '@/components/decorative-video'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Portfolio of work and projects',
}

export default async function WorkPage() {
  const caseStudies = await sanityFetch<CaseStudy[]>(
    PUBLISHED_CASE_STUDIES,
    {},
    { tag: 'caseStudies' },
  )

  const earliestYear = caseStudies.reduce<number | null>((min, s) => {
    const y = s.projectInfo?.year ? parseInt(s.projectInfo.year, 10) : null
    return y !== null && (min === null || y < min) ? y : min
  }, null)
  const currentYear = new Date().getFullYear()

  return (
    <div className="flex flex-col pb-16 md:pb-24">
      <div className="max-w-[var(--content-max-width)] mx-auto w-full">
        <header className="max-w-[592px] mx-auto text-center flex flex-col items-center pt-4 md:pt-6 pb-12 md:pb-16 space-y-4 md:space-y-6">
          <div className="flex items-center gap-4 text-sm font-normal text-foreground">
            <span>Work Archive</span>
          </div>
          <h1>Case Studies</h1>
          <p className="text-xl text-foreground leading-relaxed max-w-prose mt-2">
            An archive of projects completed
            {earliestYear ? ` between ${earliestYear} and` : ' through'} {currentYear}.
          </p>
        </header>
      </div>

      <div className="flex flex-col gap-8">
        {caseStudies.map((study, index) => {
          const cover = study.coverImage
          const header = study.headerMedia
          const heroVideoId = header?.type === 'video' ? header.video?.asset?.playbackId : undefined
          const heroImage = header?.type === 'image' ? header.image : null
          const desktopImage = heroImage ?? cover
          const hasMedia = Boolean(heroVideoId || desktopImage)
          const sector = study.projectInfo?.sector?.length
            ? study.projectInfo.sector.join(', ')
            : null
          const year = study.projectInfo?.year ?? null

          return (
            <Link
              key={study._id}
              href={`/work/${study.slug.current}`}
              className="group block cursor-pointer"
            >
              <article className="flex flex-col overflow-hidden lg:grid lg:grid-cols-5 lg:items-stretch lg:rounded-[12px] lg:border lg:border-border">
                <div className="flex flex-col lg:col-span-2 lg:p-8">
                  <div className="flex w-full max-w-[480px] flex-col gap-3 pt-4 lg:pt-0">
                    <h4 className="m-0 text-3xl font-normal leading-tight text-foreground">
                      {study.title}
                    </h4>
                    {study.summary ? (
                      <p className="m-0 text-base text-foreground">{study.summary}</p>
                    ) : null}
                    {sector || year ? (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                        {sector ? <span>{sector}</span> : null}
                        {year ? <span>{year}</span> : null}
                      </div>
                    ) : null}
                  </div>

                  {/* Reason: aria-hidden — the whole card is the link, this CTA is decorative */}
                  <div className="mt-auto hidden pt-8 lg:block">
                    <span aria-hidden="true" className={buttonVariants()}>
                      View case study
                    </span>
                  </div>
                </div>

                {hasMedia ? (
                  <div className="order-first flex items-center lg:order-none lg:col-span-3 lg:p-4">
                    {cover ? (
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted md:hidden">
                        <SanityImage
                          image={cover}
                          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
                          sizes="(min-width: 768px) 1px, 100vw"
                          aspectRatio="1/1"
                          priority={index === 0}
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-border" />
                      </div>
                    ) : null}

                    <div className="relative hidden aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted md:block">
                      {heroVideoId ? (
                        <DecorativeVideo
                          playbackId={heroVideoId}
                          className="pointer-events-none absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-[1.025]"
                        />
                      ) : desktopImage ? (
                        <SanityImage
                          image={desktopImage}
                          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
                          sizes="(min-width: 1024px) 60vw, (min-width: 768px) 100vw, 1px"
                          aspectRatio="16/9"
                          priority={index === 0}
                        />
                      ) : null}
                      <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-border" />
                    </div>
                  </div>
                ) : null}
              </article>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
