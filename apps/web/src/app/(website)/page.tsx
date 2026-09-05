import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/constants'
import { createPageMetadata, firstMetadataText } from '@/lib/seo'
import { socialImageFromSanity } from '@/lib/sanity-social-image'
import { ContentGrid } from '@/components/content-grid'
import { gridCols } from '@/lib/grid-columns'
import { sanityFetch } from '@/sanity/client'
import { HOME_PAGE_QUERY, homePageTag, type HomePage } from '@/sanity/queries/home-page-queries'
import { HomeShowreel } from '@/components/home-showreel'
import { HOME_SHOWREEL } from '@/lib/home-showreel'
import { ProgramsSection } from '@/components/programs-section'
import { FeaturedWorkSection } from '@/components/featured-work-section'
import { HomeLogoStrip } from '@/components/home-logo-strip'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getPortfolioAccessState } from '@/lib/portfolio-access'
import { SiteStructuredData } from '@/components/site-structured-data'
import { profileImageUrlsFromSanity } from '@/lib/sanity-social-image'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const data = await sanityFetch<HomePage>(HOME_PAGE_QUERY, {}, { tag: homePageTag })
  const title =
    firstMetadataText(data?.seoSettings?.metaTitle, `${SITE_CONFIG.name} — ${SITE_CONFIG.role}`) ??
    SITE_CONFIG.name
  const description =
    firstMetadataText(data?.seoSettings?.metaDescription, SITE_CONFIG.description) ??
    SITE_CONFIG.description

  return createPageMetadata({
    title,
    description,
    path: '/',
    absoluteTitle: true,
    image: socialImageFromSanity(data?.seoSettings?.shareImage, title),
  })
}

export default async function Home() {
  // Fetch home page data from Sanity
  const [data, accessState] = await Promise.all([
    sanityFetch<HomePage>(HOME_PAGE_QUERY, {}, { tag: homePageTag }),
    getPortfolioAccessState(),
  ])

  // Fallback values if no data exists yet
  const tagline = data?.tagline || 'Make progress inevitable.'
  const subtitle =
    data?.subtitle ||
    'Principal Product Designer working at the intersection of strategy, systems, and execution.'

  return (
    <ContentGrid>
      <SiteStructuredData
        profileImages={profileImageUrlsFromSanity(data?.seoSettings?.profileImages)}
      />
      <section
        className={`${gridCols.wide} min-h-[calc(80dvh-112px)] md:min-h-[calc(80dvh-128px)] pt-4 md:pt-6 pb-12 md:pb-16 flex flex-col items-center justify-center text-center`}
      >
        {/* Tagline */}
        <h1 className="font-normal whitespace-nowrap text-[7vw] md:text-[5vw] lg:text-[min(4.5vw,64px)] leading-none mb-6 md:mb-8">
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

      <section className={`${gridCols.full}`}>
        <HomeLogoStrip />
      </section>

      <section className={`${gridCols.full} mt-6 md:mt-8 mb-12 md:mb-16`}>
        <HomeShowreel playbackId={HOME_SHOWREEL.playbackId} />
      </section>

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
          hasRecruiterAccess={accessState.hasRecruiterAccess}
        />
      )}
    </ContentGrid>
  )
}
