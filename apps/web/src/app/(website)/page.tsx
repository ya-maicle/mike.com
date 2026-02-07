import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/constants'
import { ContentGrid } from '@/components/content-grid'
import { gridCols } from '@/lib/grid-columns'
import { sanityFetch } from '@/sanity/client'
import { HOME_PAGE_QUERY, homePageTag, type HomePage } from '@/sanity/queries/home-page-queries'
import { SanityImage } from '@/components/sanity-image'
import { DecorativeVideoBlock } from '@/components/decorative-video-block'
import { ProgramsSection } from '@/components/programs-section'
import { FeaturedWorkSection } from '@/components/featured-work-section'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Home',
  description: SITE_CONFIG.description,
}

export default async function Home() {
  // Fetch home page data from Sanity
  const data = await sanityFetch<HomePage>(HOME_PAGE_QUERY, {}, { tag: homePageTag })

  // Fallback values if no data exists yet
  const tagline = data?.tagline || 'Make progress inevitable.'
  const subtitle =
    data?.subtitle ||
    'Principal Product Designer working at the intersection of strategy, systems, and execution.'

  return (
    <ContentGrid>
      <section
        className={`${gridCols.wide} min-h-[calc(80dvh-56px)] md:min-h-[calc(80dvh-64px)] pt-4 md:pt-6 pb-12 md:pb-16 flex flex-col items-center justify-center text-center`}
      >
        {/* Tagline */}
        <h1 className="font-normal tracking-tight whitespace-nowrap text-[7vw] md:text-[5vw] lg:text-[min(4.5vw,64px)] leading-none mb-6 md:mb-8">
          {tagline}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p className="text-base md:text-xl leading-6 md:leading-7 font-normal text-foreground mb-0 max-w-prose">
            {subtitle}
          </p>
        )}

        {/* Hero Buttons */}
        {(data?.heroButtons?.primaryButton || data?.heroButtons?.secondaryButton) && (
          <div className="flex flex-row items-center gap-4 mt-8">
            {data.heroButtons.primaryButton?.text && data.heroButtons.primaryButton?.link && (
              <Button asChild size="lg" className="rounded-full">
                <Link href={data.heroButtons.primaryButton.link}>
                  {data.heroButtons.primaryButton.text}
                </Link>
              </Button>
            )}
            {data.heroButtons.secondaryButton?.text && data.heroButtons.secondaryButton?.link && (
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link href={data.heroButtons.secondaryButton.link}>
                  {data.heroButtons.secondaryButton.text}
                </Link>
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Media Block - renders if coverMedia exists in Sanity */}
      {data?.coverMedia && (
        <section
          className={`${gridCols.full} my-12 md:my-16 aspect-video rounded-[8px] overflow-hidden`}
        >
          {data.coverMedia.type === 'image' && data.coverMedia.image?.asset ? (
            <SanityImage
              image={data.coverMedia.image}
              className="w-full h-full object-cover"
              sizes="100vw"
            />
          ) : data.coverMedia.type === 'video' && data.coverMedia.video?.asset?.playbackId ? (
            <DecorativeVideoBlock playbackId={data.coverMedia.video.asset.playbackId} />
          ) : (
            // Fallback placeholder if media type is selected but no asset uploaded
            <div className="w-full h-full bg-secondary" />
          )}
        </section>
      )}

      {/* Placeholder if no coverMedia exists yet */}
      {!data?.coverMedia && (
        <section
          className={`${gridCols.full} my-12 md:my-16 aspect-video bg-secondary rounded-[8px] overflow-hidden`}
        />
      )}

      {/* Programs Section */}
      {data?.programsSection && (
        <ProgramsSection
          label={data.programsSection.label}
          heading={data.programsSection.heading}
          button={data.programsSection.button}
          programs={data.programsSection.programs}
          footerLink={data.programsSection.footerLink}
        />
      )}

      {/* Featured Work Section */}
      {data?.featuredWorkSection?.projects && data.featuredWorkSection.projects.length > 0 && (
        <FeaturedWorkSection
          label={data.featuredWorkSection.label}
          heading={data.featuredWorkSection.heading}
          button={data.featuredWorkSection.button}
          projects={data.featuredWorkSection.projects}
        />
      )}
    </ContentGrid>
  )
}
