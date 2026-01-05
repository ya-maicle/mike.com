'use client'

import * as React from 'react'
import Link from 'next/link'
import { gridCols } from '@/lib/grid-columns'
import { ProjectCard } from '@/components/project-card'
import { Button } from '@/components/ui/button'
import type { SanityImage } from '@/sanity/queries'

type FeaturedProject = {
  _id: string
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

type FeaturedWorkSectionProps = {
  label?: string
  heading?: string
  button?: { text?: string; link?: string }
  projects: FeaturedProject[]
}

export function FeaturedWorkSection({
  label,
  heading,
  button,
  projects,
}: FeaturedWorkSectionProps) {
  if (!projects || projects.length === 0) return null

  return (
    <section className={`${gridCols.full} pb-16 md:pb-24`}>
      <div className="flex flex-col gap-12 md:gap-16">
        {/* Header - matching Programs section */}
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col gap-6">
            {label && <p className="text-sm text-muted-foreground mb-0">{label}</p>}
            {heading && (
              <h2 className="text-4xl font-normal tracking-tight mt-0 mb-0">{heading}</h2>
            )}
            {button?.text && button?.link && (
              <Button asChild size="lg" className="shrink-0 rounded-full w-fit">
                <Link href={button.link}>{button.text}</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Projects Grid/Scroll */}
        <div className="w-full">
          {/* Mobile: Horizontal Scroll */}
          <div className="md:hidden -mx-6">
            <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4">
              <div className="w-6 shrink-0 snap-start" role="presentation" />
              {projects.map((project, index) => (
                <div
                  key={project._id}
                  className={`flex-none w-[85vw] max-w-sm ${index > 0 ? 'snap-start ml-4' : ''}`}
                >
                  <ProjectCard project={project} />
                </div>
              ))}
              <div className="w-6 shrink-0 ml-4" role="presentation" />
            </div>
          </div>

          {/* Desktop: Grid */}
          <div className="hidden md:grid md:grid-cols-12 md:gap-6 lg:gap-8">
            {projects.map((project) => (
              <div key={project._id} className="col-span-4">
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
