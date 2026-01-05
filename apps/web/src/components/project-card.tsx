'use client'

import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { urlFor } from '@/sanity/image-builder'
import type { SanityImage } from '@/sanity/queries'

type ProjectCardProps = {
  project: {
    title: string
    slug: { current: string }
    summary: string
    coverImage: SanityImage
    projectInfo?: {
      sector?: string
      year?: string
    }
    publishedAt: string
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  // Use a custom loader to handle dynamic resizing and square cropping for retina support
  const imageLoader = ({
    src,
    width,
    quality,
  }: {
    src: string
    width: number
    quality?: number
  }) => {
    try {
      const url = new URL(src)
      url.searchParams.set('auto', 'format')
      url.searchParams.set('fit', 'crop')
      url.searchParams.set('w', width.toString())
      url.searchParams.set('h', width.toString()) // Force square aspect ratio
      if (quality) url.searchParams.set('q', quality.toString())
      return url.toString()
    } catch {
      return src
    }
  }

  // Get base URL without dimensions so loader can control it
  const imageUrl = project.coverImage?.asset ? urlFor(project.coverImage).url() : null

  const formattedDate = new Date(project.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <article className="group">
      <Link href={`/work/${project.slug.current}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square mb-3 overflow-hidden rounded-lg bg-muted">
          {imageUrl && (
            <Image
              loader={imageLoader}
              src={imageUrl}
              alt={project.coverImage.alt || project.title}
              fill
              sizes="(max-width: 768px) 85vw, (max-width: 1200px) 33vw, 450px"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.025]"
            />
          )}
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-xl font-normal tracking-tight leading-tight line-clamp-2">
            {project.title}
          </h3>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            {project.projectInfo?.sector && <span>{project.projectInfo.sector}</span>}
            <time dateTime={project.publishedAt} className="text-muted-foreground/70">
              {project.projectInfo?.year || formattedDate}
            </time>
          </div>
        </div>
      </Link>
    </article>
  )
}
