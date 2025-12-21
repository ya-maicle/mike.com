'use client'

import type { ReactNode } from 'react'
import { PortableText, type PortableTextComponents } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/types'
import { cn } from '@/lib/utils'
import { gridCols } from '@/lib/grid-columns'
import { SanityImage } from '@/components/sanity-image'
import { CustomVideoPlayer } from '@/components/custom-video-player'
import { DecorativeVideoBlock } from '@/components/decorative-video-block'
import { CaseStudyCarousel } from '@/components/case-study-carousel'

type BlockProps = { children?: ReactNode }
type ListItemProps = { children?: ReactNode; value?: { style?: string } }
type MarkProps = { children?: ReactNode; value?: { href?: string; weight?: string } }

const spacerSizes: Record<string, string> = {
  sm: 'h-4',
  md: 'h-8',
  lg: 'h-16',
  xl: 'h-24',
}

const styleClasses: Record<string, string> = {
  normal: 'leading-7 text-foreground',
  h1: 'text-6xl font-medium tracking-tight text-foreground',
  h2: 'text-5xl font-medium tracking-tight text-foreground',
  h3: 'text-4xl font-medium tracking-tight text-foreground',
  h4: 'text-3xl font-medium tracking-tight text-foreground',
  h5: 'text-2xl font-medium tracking-tight text-foreground',
  h6: 'text-lg font-medium tracking-tight text-foreground',
  lead: 'text-xl leading-7 text-foreground',
  small: 'text-sm leading-6 text-muted-foreground',
  blockquote: 'text-4xl font-normal tracking-tight text-foreground',
}

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Get grid column class from width value, defaulting to full */
const getWidthClass = (width?: string) => {
  if (width && width in gridCols) {
    return gridCols[width as keyof typeof gridCols]
  }
  return gridCols.full
}

const components: PortableTextComponents = {
  types: {
    spacerBlock: ({ value }: { value: { size?: string } }) => {
      const size = value?.size || 'md'
      return (
        <div
          className={cn(gridCols.full, spacerSizes[size] || spacerSizes.md)}
          aria-hidden="true"
        />
      )
    },
    imageBlock: ({ value }: { value: any }) => {
      if (!value?.image) return null
      const widthClass = getWidthClass(value.width)
      return (
        <section className={cn(widthClass, 'space-y-3 mt-4 mb-6 md:mt-8 md:mb-12')}>
          <SanityImage
            image={value.image}
            className="w-full h-auto rounded-[8px] border border-foreground/20"
          />
          {value.image?.caption && (
            <div className="text-center text-sm text-muted-foreground">{value.image.caption}</div>
          )}
          {value.title && <h3 className="text-xl font-semibold tracking-tight">{value.title}</h3>}
          {value.description && <p className="text-muted-foreground">{value.description}</p>}
        </section>
      )
    },
    videoBlock: ({ value }: { value: any }) => {
      const playbackId: string | undefined = value?.video?.asset?.playbackId
      if (!playbackId) return null
      const widthClass = getWidthClass(value.width)
      const isDecorative = value.mode === 'decorative'

      if (isDecorative) {
        return (
          <div className={cn(widthClass, 'mt-4 mb-6 md:mt-8 md:mb-12')}>
            <DecorativeVideoBlock
              playbackId={playbackId}
              title={value.title}
              description={value.description}
            />
          </div>
        )
      }

      return (
        <section className={cn(widthClass, 'space-y-3 mt-4 mb-6 md:mt-8 md:mb-12')}>
          <CustomVideoPlayer
            playbackId={playbackId}
            title={value.title}
            className="w-full h-auto rounded-[8px] overflow-hidden border border-foreground/20"
          />
          {value.title && <h3 className="text-xl font-semibold tracking-tight">{value.title}</h3>}
          {value.description && <p className="text-muted-foreground">{value.description}</p>}
        </section>
      )
    },
    carouselBlock: ({ value }: { value: any }) => {
      const items: any[] = Array.isArray(value?.items) ? value.items : []
      if (items.length === 0) return null
      const widthClass = getWidthClass(value.width)
      return (
        <div className={cn(widthClass, 'mt-4 mb-6 md:mt-8 md:mb-12')}>
          <CaseStudyCarousel items={items} title={value.title} description={value.description} />
        </div>
      )
    },
  },
  block: {
    normal: ({ children }: BlockProps) => <p className={gridCols.narrow}>{children}</p>,
    h1: ({ children }: BlockProps) => <h1 className={gridCols.narrow}>{children}</h1>,
    h2: ({ children }: BlockProps) => <h2 className={gridCols.narrow}>{children}</h2>,
    h3: ({ children }: BlockProps) => <h3 className={gridCols.narrow}>{children}</h3>,
    h4: ({ children }: BlockProps) => <h4 className={gridCols.narrow}>{children}</h4>,
    h5: ({ children }: BlockProps) => <h5 className={gridCols.narrow}>{children}</h5>,
    h6: ({ children }: BlockProps) => <h6 className={gridCols.narrow}>{children}</h6>,
    lead: ({ children }: BlockProps) => (
      <p className={cn(gridCols.narrow, 'text-xl leading-7 text-foreground mb-6')}>{children}</p>
    ),
    small: ({ children }: BlockProps) => (
      <p className={cn(gridCols.narrow, 'text-sm leading-6 text-muted-foreground mb-4')}>
        {children}
      </p>
    ),
    blockquote: ({ children }: BlockProps) => (
      <blockquote
        className={cn(
          gridCols.medium,
          'text-4xl font-normal tracking-tight text-foreground text-center my-16',
        )}
      >
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: BlockProps) => (
      <ul className={cn(gridCols.narrow, 'list-disc pl-6 space-y-2 mb-5 mt-2')}>{children}</ul>
    ),
    number: ({ children }: BlockProps) => (
      <ol className={cn(gridCols.narrow, 'list-decimal pl-6 space-y-2 mb-5 mt-2')}>{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children, value }: ListItemProps) => {
      const style = value?.style || 'normal'
      const classes = styleClasses[style] || styleClasses.normal
      return <li className={classes}>{children}</li>
    },
    number: ({ children, value }: ListItemProps) => {
      const style = value?.style || 'normal'
      const classes = styleClasses[style] || styleClasses.normal
      return <li className={classes}>{children}</li>
    },
  },
  marks: {
    strong: ({ children }: MarkProps) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }: MarkProps) => <em className="italic">{children}</em>,
    code: ({ children }: MarkProps) => (
      <code className="rounded bg-muted/60 px-1.5 py-0.5 text-sm font-mono">{children}</code>
    ),
    underline: ({ children }: MarkProps) => <span className="underline">{children}</span>,
    'strike-through': ({ children }: MarkProps) => <span className="line-through">{children}</span>,
    link: ({ value, children }: MarkProps) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noreferrer"
        className="text-foreground underline decoration-1 underline-offset-4 hover:text-muted-foreground hover:decoration-muted-foreground transition-colors"
      >
        {children}
      </a>
    ),
    fontWeight: ({ value, children }: MarkProps) => {
      const weightMap: Record<string, string> = {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      }
      const weightClass = weightMap[value?.weight || ''] || ''
      return <span className={weightClass}>{children}</span>
    },
  },
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface LegalPageContentProps {
  content: PortableTextBlock[]
  className?: string
}

export function LegalPageContent({ content, className }: LegalPageContentProps) {
  if (!content) return null

  return (
    <div className={cn('contents', className)}>
      <PortableText value={content} components={components} />
    </div>
  )
}
