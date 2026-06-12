import Link from 'next/link'
import { ArrowDown, ArrowRight, ArrowUp, ChevronRight } from 'lucide-react'
import { PageTemplate } from '@/components/page-template'
import { ProgramHeroExamples } from '@/components/program-hero-examples'
import { SanityImage } from '@/components/sanity-image'
import { DecorativeVideo } from '@/components/decorative-video'
import { Button } from '@/components/ui/button'
import { FullBleedCarousel } from '@/components/full-bleed-carousel'
import { ProgramsSection } from '@/components/programs-section'
import { gridCols } from '@/lib/grid-columns'
import { cn } from '@/lib/utils'
import type { Program, ProgramMove, ProgramProof } from '@/sanity/queries/program-queries'
import type { HomePageProgram } from '@/sanity/queries/home-page-queries'

interface ProgramLayoutProps {
  data: Program
  otherPrograms?: HomePageProgram[]
}

function TextSection({
  label,
  body,
  className,
}: {
  label: string
  body: string
  className?: string
}) {
  return (
    <section className={cn(gridCols.narrow, className)}>
      <p className="text-sm font-normal text-foreground mb-5">{label}</p>
      <p className="text-lg md:text-xl leading-relaxed text-foreground mb-0 whitespace-pre-line">
        {body}
      </p>
    </section>
  )
}

function MoveCardMedia({ move }: { move: ProgramMove }) {
  const { media } = move
  if (!media) return null

  const isVideo = media.type === 'video' && media.video?.asset?.playbackId
  const hasImage = media.type === 'image' && media.image?.asset

  if (!isVideo && !hasImage) return null

  return (
    <div className="shrink-0 w-36 md:w-44 p-3 self-start">
      <div className="aspect-square w-full relative overflow-hidden rounded-md bg-muted/40">
        {isVideo ? (
          <DecorativeVideo
            playbackId={media.video!.asset.playbackId}
            className="absolute inset-0 w-full h-full"
            videoClassName="object-cover"
          />
        ) : (
          <SanityImage
            image={media.image!}
            className="absolute inset-0 w-full h-full object-cover"
            sizes="(min-width: 768px) 152px, 120px"
            aspectRatio="1/1"
            quality={85}
          />
        )}
      </div>
    </div>
  )
}

function MoveCard({ move, index }: { move: ProgramMove; index: number }) {
  const displayTitle = `${String(index + 1).padStart(2, '0')}. ${move.title}`

  return (
    <div className="group flex flex-col md:flex-row rounded-lg bg-secondary hover:bg-secondary/80 overflow-hidden transition-colors duration-200">
      <MoveCardMedia move={move} />
      <div
        className={cn(
          'flex-1 flex flex-col justify-start',
          'px-4 pt-3 pb-5',
          'md:px-6 md:pt-0 md:pb-0 md:justify-center md:overflow-hidden',
        )}
      >
        <h5 className="mt-0 mb-0 text-foreground">{displayTitle}</h5>
        <p
          className={cn(
            'mb-0 text-foreground',
            'mt-1',
            'md:mt-0 md:max-h-0 md:overflow-hidden md:opacity-0',
            'md:group-hover:max-h-28 md:group-hover:opacity-100 md:group-hover:mt-1',
            'transition-all duration-300 ease-out',
          )}
        >
          {move.body}
        </p>
      </div>
    </div>
  )
}

function HowSection({ moves }: { moves?: ProgramMove[] }) {
  if (!moves || moves.length === 0) return null

  return (
    <section className={cn(gridCols.medium, 'pb-12 md:pb-16')}>
      <div className="flex flex-col gap-2">
        {moves.map((move, i) => (
          <MoveCard key={move._key} move={move} index={i} />
        ))}
      </div>
    </section>
  )
}

function ProofCard({ proof }: { proof: ProgramProof }) {
  const caseStudySlug = proof.caseStudy?.slug?.current
  const caseStudyHref = caseStudySlug ? `/work/${caseStudySlug}` : null
  const caseStudyTitle = proof.caseStudy?.title ?? 'Case study'
  const isOutcome = proof.markerType === 'outcome'
  const isDirection = proof.markerType === 'direction'
  const normalizedMarker = proof.marker.trim().toLowerCase()
  const DirectionIcon =
    normalizedMarker === 'down' || normalizedMarker === '↓'
      ? ArrowDown
      : normalizedMarker === 'right' || normalizedMarker === '→'
        ? ArrowRight
        : ArrowUp

  return (
    <article className="flex aspect-[3/4] min-h-72 flex-col rounded-lg bg-secondary p-5 transition-colors hover:bg-secondary/80 md:p-6">
      {isDirection ? (
        <DirectionIcon className="mb-12 size-20 stroke-[1.5] text-foreground md:size-24" />
      ) : (
        <p
          className={cn(
            'mb-12 text-7xl leading-none tracking-normal text-foreground md:text-8xl',
            isOutcome && 'text-3xl leading-tight md:text-4xl',
          )}
        >
          {proof.marker}
        </p>
      )}
      <div className="mt-auto">
        <h5 className="mb-0 mt-0 text-foreground">{proof.title}</h5>
        <p className="mb-0 mt-3 text-foreground">{proof.body}</p>
        {caseStudyHref && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-5 w-fit border-transparent bg-background hover:border-transparent hover:bg-background/90"
          >
            <Link href={caseStudyHref}>
              {caseStudyTitle}
              <ChevronRight className="size-4 shrink-0" />
            </Link>
          </Button>
        )}
      </div>
    </article>
  )
}

function ProofSection({ intro, proofs }: { intro?: string; proofs?: ProgramProof[] }) {
  const validProofs =
    proofs?.filter((proof) => proof.marker && proof.title && proof.body && proof.caseStudy) ?? []

  if (validProofs.length === 0) return null

  return (
    <>
      <section className={gridCols.medium}>
        <p className="mb-5 text-sm font-normal text-foreground">The proof.</p>
        {intro && (
          <p className="mb-6 text-lg leading-relaxed text-foreground whitespace-pre-line md:mb-8 md:text-xl">
            {intro}
          </p>
        )}
      </section>
      <section className={cn(gridCols.full, 'pb-12 md:pb-16')}>
        <FullBleedCarousel align="medium" gapClassName="gap-2">
          {validProofs.map((proof) => (
            <div
              key={proof._key}
              className="w-[82vw] max-w-sm flex-none snap-start md:w-[32vw] md:min-w-80 md:max-w-md"
            >
              <ProofCard proof={proof} />
            </div>
          ))}
        </FullBleedCarousel>
      </section>
    </>
  )
}

function CTASection() {
  return (
    <section className={cn(gridCols.full, 'pt-12 md:pt-16')}>
      <div
        className={cn(
          'rounded-lg bg-secondary',
          'px-6 py-12 md:px-12 md:py-20',
          'flex flex-col items-center gap-7 text-center',
        )}
      >
        <h4 className="mb-0 mt-0 text-balance text-foreground">Working on this in your team?</h4>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild size="lg">
            <Link href="mailto:ya@maicle.co.uk">Let&apos;s talk</Link>
          </Button>
          <Button asChild variant="ghost" size="lg">
            <Link href="/work">
              Case studies
              <ChevronRight className="size-4 shrink-0" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function ProgramLayout({ data, otherPrograms }: ProgramLayoutProps) {
  return (
    <PageTemplate
      className="pb-0"
      title={data.title}
      metadata={data.tagline ? [data.tagline] : undefined}
      subtitle={data.summary}
      cover={<ProgramHeroExamples examples={data.heroExamples} />}
    >
      {data.thesis && (
        <TextSection
          label="The problem."
          body={data.thesis}
          className={cn(gridCols.medium, 'py-12 md:py-16')}
        />
      )}

      {data.approachIntro && (
        <TextSection
          label="The approach."
          body={data.approachIntro}
          className={cn(gridCols.medium, 'pb-6 md:pb-8')}
        />
      )}

      {data.moves && data.moves.length > 0 && <HowSection moves={data.moves} />}

      <ProofSection intro={data.proofIntro} proofs={data.proofs} />

      <ProgramsSection
        label="Other strengths"
        heading="More ways I can help"
        programs={otherPrograms}
        className={gridCols.medium}
      />

      <CTASection />
    </PageTemplate>
  )
}
