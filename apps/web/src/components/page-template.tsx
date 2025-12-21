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
  | { type: 'video'; video: { asset: { playbackId: string } } }

interface PageTemplateProps {
  /** Page title (uses h2 styling) */
  title: string
  /** Optional metadata (e.g., date, category) - displayed with regular weight */
  metadata?: string | string[]
  /** Optional subtitle/lead text */
  subtitle?: string
  /** Optional cover media (image or video) */
  coverMedia?: CoverMedia
  /** Page content */
  children: ReactNode
  /** Header text alignment */
  headerAlign?: 'center' | 'left'
  /** Optional className for the outer wrapper */
  className?: string
}

export function PageTemplate({
  title,
  metadata,
  subtitle,
  coverMedia,
  children,
  headerAlign = 'center',
  className,
}: PageTemplateProps) {
  const hasCover = !!coverMedia

  return (
    <div className={cn('pb-24', className)}>
      {/* Header - uses max-width like body copy, not grid */}
      <div className="max-w-[var(--content-max-width)] mx-auto px-4">
        <header
          className={cn(
            'max-w-[592px] mx-auto',
            'pt-6 space-y-6',
            hasCover ? 'pb-8' : 'pb-16',
            headerAlign === 'center' && 'text-center flex flex-col items-center',
          )}
        >
          {metadata && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-normal">
              {Array.isArray(metadata) ? (
                metadata.map((item, i) => <span key={i}>{item}</span>)
              ) : (
                <span>{metadata}</span>
              )}
            </div>
          )}

          <h2>{title}</h2>

          {subtitle && (
            <p className="text-xl text-foreground leading-relaxed max-w-prose mt-2">{subtitle}</p>
          )}
        </header>
      </div>

      {/* Cover Media - full width with grid */}
      {coverMedia && (
        <ContentGrid>
          <section className={cn(gridCols.full, 'mb-8')}>
            {coverMedia.type === 'video' && coverMedia.video?.asset?.playbackId ? (
              <DecorativeVideoPlayer
                playbackId={coverMedia.video.asset.playbackId}
                className="max-h-[90vh] object-cover"
              />
            ) : coverMedia.type === 'image' && coverMedia.image ? (
              <SanityImage
                image={coverMedia.image}
                className="w-full h-auto object-cover max-h-[90vh] rounded-[8px]"
                priority
                sizes="100vw"
              />
            ) : null}
          </section>
        </ContentGrid>
      )}

      {/* Page Content - Rendered as grid children */}
      <ContentGrid>{children}</ContentGrid>
    </div>
  )
}
