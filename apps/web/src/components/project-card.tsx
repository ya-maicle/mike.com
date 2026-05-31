'use client'

import * as React from 'react'
import Link from 'next/link'
import { SanityImage } from '@/components/sanity-image'
import type { SanityImage as SanityImageType } from '@/sanity/queries'

export type ProjectCardData = {
  _id: string
  title: string
  slug: { current: string }
  summary?: string
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
}

export function ProjectCard({ project }: ProjectCardProps) {
  const formattedDate = project.publishedAt
    ? new Date(project.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : undefined

  return (
    <article className="group">
      <Link href={`/work/${project.slug.current}`} className="block">
        <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-muted">
          {project.coverImage?.asset && (
            <SanityImage
              image={project.coverImage}
              className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
              sizes="(max-width: 768px) 85vw, (max-width: 1200px) 33vw, 450px"
              aspectRatio="1/1"
            />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-normal leading-tight line-clamp-2">{project.title}</h3>

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
      </Link>
    </article>
  )
}
