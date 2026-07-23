import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ContentGrid } from '@/components/content-grid'
import { SanityImage } from '@/components/sanity-image'
import type { SanityImage as SanityImageType } from '@/sanity/queries'

interface BioPageLayoutProps {
  title: string
  titleClassName?: string
  metadata?: string | string[]
  subtitle?: string
  subtitleClassName?: string
  image: SanityImageType
  children: ReactNode
}

function getObjectPosition(image: SanityImageType) {
  // The fallback follows the portrait in the current bio cover. A Sanity
  // hotspot set by an editor always takes precedence.
  const x = image.hotspot?.x ?? 0.65
  const y = image.hotspot?.y ?? 0
  return `${Math.round(x * 100)}% ${Math.round(y * 100)}%`
}

export function BioPageLayout({
  title,
  titleClassName,
  metadata,
  subtitle,
  subtitleClassName,
  image,
  children,
}: BioPageLayoutProps) {
  return (
    <div className="pb-24">
      <section
        data-bio-hero
        className="relative h-[80svh] min-h-[560px] overflow-hidden bg-black text-white transition-[border-radius] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:min-h-[640px]"
      >
        <SanityImage
          image={image}
          className="absolute inset-0 h-full w-full object-cover"
          objectPosition={getObjectPosition(image)}
          priority
          sizes="100vw"
          aspectRatio="auto"
        />

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.68)_0%,rgba(0,0,0,0.18)_38%,rgba(0,0,0,0)_65%)]"
        />

        <header
          data-bio-hero-copy
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center px-6 pb-10 text-center text-white md:px-8 md:pb-14 lg:pb-16"
        >
          <div className="flex max-w-[760px] flex-col items-center gap-4 md:gap-5">
            {metadata && (
              <div className="flex items-center gap-4 text-sm font-normal text-white">
                {Array.isArray(metadata) ? (
                  metadata.map((item, index) => <span key={index}>{item}</span>)
                ) : (
                  <span>{metadata}</span>
                )}
              </div>
            )}

            <h1
              className={cn(
                'mb-0 max-w-[600px] text-balance text-[clamp(36px,9vw,72px)] leading-none tracking-[-1px] text-white [text-shadow:0_2px_24px_rgb(0_0_0_/_0.3)]',
                titleClassName,
              )}
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className={cn(
                  'mb-0 max-w-[620px] text-[20px] leading-relaxed text-white [text-shadow:0_1px_16px_rgb(0_0_0_/_0.35)]',
                  subtitleClassName,
                )}
              >
                {subtitle}
              </p>
            )}
          </div>
        </header>
      </section>

      <div className="px-6 pt-16 md:px-8 md:pt-24">
        <ContentGrid>{children}</ContentGrid>
      </div>
    </div>
  )
}
