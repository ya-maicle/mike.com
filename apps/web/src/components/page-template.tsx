'use client'

import { cn } from '@/lib/utils'
import { SanityImage } from '@/components/sanity-image'
import { ContentGrid } from '@/components/content-grid'
import { gridCols } from '@/lib/grid-columns'
import { DecorativeVideoPlayer } from '@/components/decorative-video-player'
import type { ReactNode } from 'react'
import type { SanityImage as SanityImageType } from '@/sanity/queries'

type CoverMedia =
  | { type: 'image'; image: SanityImageType }
  | { type: 'video'; video: { asset: { playbackId: string; aspectRatio?: string } } }

interface PageTemplateProps {
  /** Page title (uses h2 styling) */
  title: string
  /** Optional typography class for the title */
  titleClassName?: string
  /** Optional metadata (e.g., date, category) - displayed with regular weight */
  metadata?: string | string[]
  /** Optional subtitle/lead text */
  subtitle?: string
  /** Optional typography class for the subtitle */
  subtitleClassName?: string
  /** Optional cover media (image or video) */
  coverMedia?: CoverMedia
  /** Apply the portfolio media frame (rounded corners and an inset border). */
  frameCoverMedia?: boolean
  /** Optional custom cover content rendered in the cover-media area (takes precedence over coverMedia) */
  cover?: ReactNode
  /** Optional article actions rendered between the header copy and cover media */
  headerActions?: ReactNode
  /** Page content */
  children: ReactNode
  /** Header text alignment */
  headerAlign?: 'center' | 'left'
  /** Optional className for the outer wrapper */
  className?: string
}

export function PageTemplate({
  title,
  titleClassName,
  metadata,
  subtitle,
  subtitleClassName,
  coverMedia,
  frameCoverMedia = false,
  cover,
  headerActions,
  children,
  headerAlign = 'center',
  className,
}: PageTemplateProps) {
  const hasCover = !!coverMedia || !!cover

  return (
    <div className={cn('pb-24', className)}>
      {/* Header - uses max-width like body copy, not grid */}
      <div className="max-w-[var(--content-max-width)] mx-auto px-4">
        <header
          className={cn(
            'max-w-[592px] mx-auto',
            'pt-4 md:pt-6 space-y-4 md:space-y-6',
            // Finalized spacing
            !headerActions && (hasCover ? 'pb-12 md:pb-16' : 'pb-20 md:pb-32'),
            headerAlign === 'center' && 'text-center flex flex-col items-center',
          )}
        >
          {metadata && (
            <div className="flex items-center gap-4 text-sm font-normal text-foreground">
              {Array.isArray(metadata) ? (
                metadata.map((item, i) => <span key={i}>{item}</span>)
              ) : (
                <span>{metadata}</span>
              )}
            </div>
          )}

          <h1 className={titleClassName}>{title}</h1>

          {subtitle && (
            <p
              className={cn(
                'text-xl text-foreground leading-relaxed max-w-prose mt-2',
                headerActions && 'mb-0',
                subtitleClassName,
              )}
            >
              {subtitle}
            </p>
          )}
        </header>

        {headerActions ? (
          <div
            className={cn(
              '-mx-4 mt-20 max-w-[596px] md:mx-auto',
              hasCover ? 'pb-[52px] md:pb-7' : 'pb-20 md:pb-32',
            )}
          >
            {headerActions}
          </div>
        ) : null}
      </div>

      {cover ? (
        <ContentGrid>
          <section className={cn(gridCols.full, 'mb-8')}>{cover}</section>
        </ContentGrid>
      ) : coverMedia ? (
        <ContentGrid>
          <section className={cn(gridCols.full, 'mb-8')}>
            <div className={cn(frameCoverMedia && 'relative overflow-hidden rounded-lg bg-muted')}>
              {coverMedia.type === 'video' && coverMedia.video?.asset?.playbackId ? (
                <DecorativeVideoPlayer
                  playbackId={coverMedia.video.asset.playbackId}
                  aspectRatio={coverMedia.video.asset.aspectRatio}
                  maxResolution="2160p"
                  minResolution="1080p"
                  eager
                />
              ) : coverMedia.type === 'image' && coverMedia.image ? (
                <SanityImage
                  image={coverMedia.image}
                  className="w-full h-auto object-cover max-h-[90vh] rounded-[8px]"
                  priority
                  sizes="(min-width: 1376px) 1376px, 100vw"
                  aspectRatio="auto"
                />
              ) : null}
              {frameCoverMedia ? (
                <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-border" />
              ) : null}
            </div>
          </section>
        </ContentGrid>
      ) : null}

      {/* Page Content - Rendered as grid children */}
      <ContentGrid>{children}</ContentGrid>
    </div>
  )
}
