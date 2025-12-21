'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
import { cn } from '@/lib/utils'
import { gridCols } from '@/lib/grid-columns'
import { SanityImage } from '@/components/sanity-image'
import { CustomVideoPlayer } from '@/components/custom-video-player'
import { DecorativeVideoBlock } from '@/components/decorative-video-block'
import { CaseStudyCarousel } from '@/components/case-study-carousel'
import { PortableTextLite } from '@/components/portable-text-lite'

export type LayoutMode = 'grid' | 'max-width'

interface ContentBlockProps {
  block: any
  layout?: LayoutMode
}

/**
 * Get width class based on layout mode
 * - grid: Uses CSS Grid column classes
 * - max-width: Uses max-width with mx-auto centering
 */
function getWidthClass(width: string | undefined, layout: LayoutMode): string {
  if (layout === 'grid') {
    if (width && width in gridCols) {
      return gridCols[width as keyof typeof gridCols]
    }
    return gridCols.full
  }

  return 'w-full'
}

function getNarrowClass(layout: LayoutMode): string {
  if (layout === 'grid') {
    return gridCols.narrow
  }
  return 'max-w-[592px] mx-auto'
}

/**
 * Unified content block renderer
 * Supports both grid-based (LegalPageContent) and max-width (CaseStudy) layouts
 */
export function ContentBlock({ block, layout = 'max-width' }: ContentBlockProps) {
  if (!block || !block._type) return null

  if (block._type === 'imageBlock') {
    if (!block.image) return null
    const widthClass = getWidthClass(block.width, layout)
    const narrowClass = getNarrowClass(layout)

    return (
      <section className={cn(widthClass, 'space-y-3')}>
        <SanityImage image={block.image} className="w-full h-auto rounded-[8px]" />
        {block.image?.caption && (
          <div className={cn(narrowClass, 'text-center text-sm text-muted-foreground')}>
            {block.image.caption}
          </div>
        )}
        {block.title && (
          <div className={narrowClass}>
            <h3 className="text-xl font-semibold tracking-tight">{block.title}</h3>
          </div>
        )}
        {block.description && (
          <div className={narrowClass}>
            <p className="text-muted-foreground">{block.description}</p>
          </div>
        )}
      </section>
    )
  }

  if (block._type === 'videoBlock') {
    const playbackId: string | undefined = block.video?.asset?.playbackId
    if (!playbackId) return null

    const widthClass = getWidthClass(block.width, layout)
    const narrowClass = getNarrowClass(layout)
    const isDecorative = block.mode === 'decorative'

    if (isDecorative) {
      return (
        <div className={widthClass}>
          <DecorativeVideoBlock
            playbackId={playbackId}
            title={block.title}
            description={block.description}
          />
        </div>
      )
    }

    return (
      <section className={cn(widthClass, 'space-y-3')}>
        <CustomVideoPlayer
          playbackId={playbackId}
          title={block.title}
          className="w-full h-auto rounded-[8px] overflow-hidden"
        />
        {block.title && (
          <div className={narrowClass}>
            <h3 className="text-xl font-semibold tracking-tight">{block.title}</h3>
          </div>
        )}
        {block.description && (
          <div className={narrowClass}>
            <p className="text-muted-foreground">{block.description}</p>
          </div>
        )}
      </section>
    )
  }

  if (block._type === 'carouselBlock') {
    const items: any[] = Array.isArray(block.items) ? block.items : []
    if (items.length === 0) return null
    const widthClass = getWidthClass(block.width, layout)

    return (
      <div className={widthClass}>
        <CaseStudyCarousel items={items} title={block.title} description={block.description} />
      </div>
    )
  }

  if (block._type === 'twoColumnImageBlock') {
    const narrowClass = getNarrowClass(layout)

    return (
      <section className="w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <SanityImage
              image={block.leftImage}
              className="w-full h-auto rounded-[8px]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {block.leftImage?.caption && (
              <div className="text-sm text-muted-foreground">{block.leftImage.caption}</div>
            )}
          </div>
          <div className="space-y-2">
            <SanityImage
              image={block.rightImage}
              className="w-full h-auto rounded-[8px]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {block.rightImage?.caption && (
              <div className="text-sm text-muted-foreground">{block.rightImage.caption}</div>
            )}
          </div>
        </div>
      </section>
    )
  }

  if (block._type === 'spacerBlock') {
    const spacerSizes: Record<string, string> = {
      sm: 'h-4',
      md: 'h-8',
      lg: 'h-16',
      xl: 'h-24',
    }
    const size = block.size || 'md'
    return <div className={cn('w-full', spacerSizes[size] || spacerSizes.md)} aria-hidden="true" />
  }

  if (block._type === 'block') {
    const narrowClass = getNarrowClass(layout)
    return (
      <section className={cn(narrowClass, 'space-y-3')}>
        <PortableTextLite value={[block]} className="text-xl" />
      </section>
    )
  }

  return null
}
/* eslint-enable @typescript-eslint/no-explicit-any */
