import Link from 'next/link'
import { gridCols } from '@/lib/grid-columns'
import { ProjectGrid } from '@/components/project-grid'
import type { ProjectCardData } from '@/components/project-card'

type KeepExploringSectionProps = {
  projects: ProjectCardData[]
}

export function KeepExploringSection({ projects }: KeepExploringSectionProps) {
  if (!projects || projects.length === 0) return null

  return (
    <section className={`${gridCols.full} py-16 md:py-24`}>
      <div className="flex flex-col gap-12 md:gap-16">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-4xl font-normal m-0">Keep exploring</h2>
          <Link
            href="/work"
            className="shrink-0 text-base text-foreground underline-offset-4 hover:underline"
          >
            View all
          </Link>
        </div>

        <ProjectGrid projects={projects} />
      </div>
    </section>
  )
}
