'use client'

import * as React from 'react'
import Link from 'next/link'
import { CoverMediaFill } from '@/components/cover-media-fill'
import { resolveCover } from '@/lib/cover-media'
import type { CoverMedia, SanityImage as SanityImageType } from '@/sanity/queries'
import { Icon } from '@/components/ui/icon'
import * as Icons from '@/components/ui/icons'
import { useLoginModal } from '@/components/providers/login-modal-provider'

export type ProjectCardData = {
  _id: string
  title: string
  slug: { current: string }
  summary?: string
  visibility?: 'public' | 'recruiter'
  cover?: CoverMedia
  coverImage?: SanityImageType
  projectInfo?: {
    sector?: string[]
    year?: string
    link?: { text?: string; url?: string }
  }
  publishedAt?: string
}

type ProjectCardProps = {
  project: ProjectCardData
  hasRecruiterAccess?: boolean
}

export function ProjectCard({ project, hasRecruiterAccess = false }: ProjectCardProps) {
  const { openLogin } = useLoginModal()
  const formattedDate = project.publishedAt
    ? new Date(project.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : undefined
  const href = `/work/${project.slug.current}`
  const isLocked = project.visibility === 'recruiter' && !hasRecruiterAccess
  const cover = resolveCover(project.cover, project.coverImage)

  const content = (
    <>
      <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-muted">
        <CoverMediaFill
          cover={cover}
          className="transition-transform duration-300 ease-out group-hover:scale-[1.025]"
          sizes="(max-width: 768px) 85vw, (max-width: 1200px) 33vw, 450px"
          imageAspectRatio="1/1"
        />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-normal leading-tight line-clamp-2">
          {isLocked ? (
            <Icon
              icon={Icons.Lock}
              className="mr-1.5 inline-flex size-3 translate-y-[-2px] text-current"
            />
          ) : null}
          {project.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          {project.projectInfo?.sector && (
            <span>
              {Array.isArray(project.projectInfo.sector)
                ? project.projectInfo.sector.join(', ')
                : project.projectInfo.sector}
            </span>
          )}
          <time dateTime={project.publishedAt} className="text-muted-foreground/70">
            {project.projectInfo?.year || formattedDate}
          </time>
        </div>
      </div>
    </>
  )

  return (
    <article className="group">
      <Link
        href={href}
        className="block"
        onClick={
          isLocked
            ? (event) => {
                event.preventDefault()
                openLogin({ returnTo: href, entryPoint: 'work_card' })
              }
            : undefined
        }
      >
        {content}
      </Link>
    </article>
  )
}
