'use client'

import Link from 'next/link'

import { SanityImage } from '@/components/sanity-image'
import { DecorativeVideo } from '@/components/decorative-video'
import { CoverMediaFill } from '@/components/cover-media-fill'
import { resolveCover } from '@/lib/cover-media'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/ui/icon'
import * as Icons from '@/components/ui/icons'
import { useLoginModal } from '@/components/providers/login-modal-provider'
import type { CaseStudy } from '@/sanity/queries'

type WorkCaseStudyListProps = {
  caseStudies: CaseStudy[]
  hasRecruiterAccess?: boolean
}

export function WorkCaseStudyList({
  caseStudies,
  hasRecruiterAccess = false,
}: WorkCaseStudyListProps) {
  const { openLogin } = useLoginModal()

  return (
    <div className="flex flex-col gap-8">
      {caseStudies.map((study, index) => {
        const href = `/work/${study.slug.current}`
        const cover = resolveCover(study.cover, study.coverImage)
        const header = study.headerMedia
        const heroVideoId = header?.type === 'video' ? header.video?.asset?.playbackId : undefined
        const heroImage = header?.type === 'image' ? header.image : null
        const hasMedia = Boolean(heroVideoId || heroImage || cover)
        const sector = study.projectInfo?.sector?.length
          ? study.projectInfo.sector.join(', ')
          : null
        const year = study.projectInfo?.year ?? null
        const isLocked = study.visibility === 'recruiter' && !hasRecruiterAccess

        const article = (
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

              <div className="mt-auto hidden pt-8 lg:block">
                <Button asChild variant={isLocked ? 'secondary' : 'default'}>
                  <span aria-hidden="true">
                    {isLocked ? <Icon icon={Icons.Lock} size="sm" /> : null}
                    {isLocked ? 'Log in' : 'View case study'}
                  </span>
                </Button>
              </div>
            </div>

            {hasMedia ? (
              <div className="order-first flex items-center lg:order-none lg:col-span-3 lg:p-4">
                {cover ? (
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted md:hidden">
                    <CoverMediaFill
                      cover={cover}
                      className="transition-transform duration-300 ease-out group-hover:scale-[1.025]"
                      sizes="(min-width: 768px) 1px, 100vw"
                      imageAspectRatio="1/1"
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
                  ) : heroImage ? (
                    <SanityImage
                      image={heroImage}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
                      sizes="(min-width: 1024px) 60vw, (min-width: 768px) 100vw, 1px"
                      aspectRatio="16/9"
                      priority={index === 0}
                    />
                  ) : (
                    <CoverMediaFill
                      cover={cover}
                      className="transition-transform duration-300 ease-out group-hover:scale-[1.025]"
                      sizes="(min-width: 1024px) 60vw, (min-width: 768px) 100vw, 1px"
                      imageAspectRatio="16/9"
                      priority={index === 0}
                    />
                  )}
                  <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-border" />
                </div>
              </div>
            ) : null}
          </article>
        )

        return isLocked ? (
          <Link
            key={study._id}
            className="group block w-full cursor-pointer text-left"
            href={href}
            onClick={(event) => {
              event.preventDefault()
              openLogin({ returnTo: href })
            }}
          >
            {article}
          </Link>
        ) : (
          <Link key={study._id} href={href} className="group block cursor-pointer">
            {article}
          </Link>
        )
      })}
    </div>
  )
}
