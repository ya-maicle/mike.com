import { PageTemplate } from '@/components/page-template'
import { ProgramHeroExamples } from '@/components/program-hero-examples'
import type { Program } from '@/sanity/queries/program-queries'

interface ProgramLayoutProps {
  data: Program
}

export function ProgramLayout({ data }: ProgramLayoutProps) {
  return (
    <PageTemplate
      title={data.title}
      metadata={data.tagline ? [data.tagline] : undefined}
      subtitle={data.summary}
      cover={<ProgramHeroExamples examples={data.heroExamples} />}
    >
      {null}
    </PageTemplate>
  )
}
