'use client'

import Link from 'next/link'
import { gridCols } from '@/lib/grid-columns'
import { ProjectGrid } from '@/components/project-grid'
import { Button } from '@/components/ui/button'
import type { ProjectCardData } from '@/components/project-card'

type FeaturedWorkSectionProps = {
  label?: string
  heading?: string
  button?: { text?: string; link?: string }
  projects: ProjectCardData[]
  hasRecruiterAccess?: boolean
}

export function FeaturedWorkSection({
  label,
  heading,
  button,
  projects,
  hasRecruiterAccess = false,
}: FeaturedWorkSectionProps) {
  if (!projects || projects.length === 0) return null

  return (
    <section className={`${gridCols.full} pb-16 md:pb-24`}>
      <div className="flex flex-col gap-12 md:gap-16">
        <div className="grid grid-cols-12">
          <div className="col-span-12 md:col-span-8 lg:col-span-6 flex flex-col gap-6">
            {label && <p className="text-sm text-muted-foreground mb-0">{label}</p>}
            {heading && <h2 className="text-4xl font-normal mt-0 mb-0">{heading}</h2>}
            {button?.text && button?.link && (
              <Button asChild size="lg" className="shrink-0 rounded-full w-fit">
                <Link href={button.link}>{button.text}</Link>
              </Button>
            )}
          </div>
        </div>

        <ProjectGrid projects={projects} hasRecruiterAccess={hasRecruiterAccess} />
      </div>
    </section>
  )
}
