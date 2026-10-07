import type { StudyAccess } from '@/lib/study-access'
import { FullBleedCarousel } from '@/components/full-bleed-carousel'
import { ProjectCard, type ProjectCardData } from '@/components/project-card'

type ProjectGridProps = {
  projects: ProjectCardData[]
  access?: StudyAccess
  hasRecruiterAccess?: boolean
}

export function ProjectGrid({ projects, access, hasRecruiterAccess = false }: ProjectGridProps) {
  return (
    <FullBleedCarousel>
      {projects.map((project) => (
        <div
          key={project._id}
          className="w-[85vw] max-w-sm flex-none snap-start md:w-[30vw] md:min-w-80 md:max-w-md"
        >
          <ProjectCard project={project} access={access} hasRecruiterAccess={hasRecruiterAccess} />
        </div>
      ))}
    </FullBleedCarousel>
  )
}
