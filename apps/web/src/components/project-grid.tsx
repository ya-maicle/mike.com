'use client'

import { ProjectCard, type ProjectCardData } from '@/components/project-card'

type ProjectGridProps = {
  projects: ProjectCardData[]
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  return (
    <div className="w-full">
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

      <div className="hidden md:grid md:grid-cols-12 md:gap-6 lg:gap-8">
        {projects.map((project) => (
          <div key={project._id} className="col-span-4">
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </div>
  )
}
