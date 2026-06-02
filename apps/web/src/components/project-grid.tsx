import { FullBleedCarousel } from '@/components/full-bleed-carousel'
import { ProjectCard, type ProjectCardData } from '@/components/project-card'

type ProjectGridProps = {
  projects: ProjectCardData[]
  hasRecruiterAccess?: boolean
}

export function ProjectGrid({ projects, hasRecruiterAccess = false }: ProjectGridProps) {
  return (
    <FullBleedCarousel>
      {projects.map((project) => (
        <div
          key={project._id}
          className="w-[85vw] max-w-sm flex-none snap-start md:w-[30vw] md:min-w-80 md:max-w-md"
        >
          <ProjectCard project={project} hasRecruiterAccess={hasRecruiterAccess} />
        </div>
      ))}
    </FullBleedCarousel>
  )
}
