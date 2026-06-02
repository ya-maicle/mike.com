'use client'

import { ProjectCard, type ProjectCardData } from '@/components/project-card'

type ProjectGridProps = {
  projects: ProjectCardData[]
  hasRecruiterAccess?: boolean
}

export function ProjectGrid({ projects, hasRecruiterAccess = false }: ProjectGridProps) {
  return (
    <div className="w-full">
      <div className="viewport-carousel viewport-carousel-track flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-hide md:gap-6 lg:gap-8">
        {projects.map((project) => (
          <div
            key={project._id}
            className="w-[85vw] max-w-sm flex-none snap-start md:w-[30vw] md:min-w-80 md:max-w-md"
          >
            <ProjectCard project={project} hasRecruiterAccess={hasRecruiterAccess} />
          </div>
        ))}
      </div>
    </div>
  )
}
