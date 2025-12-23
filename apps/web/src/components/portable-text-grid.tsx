'use client'

import { Children, isValidElement, type ReactNode } from 'react'
import type { PortableTextComponents } from 'next-sanity'
import { cn } from '@/lib/utils'
import { gridCols } from '@/lib/grid-columns'
import { ContentBlock } from '@/components/content-block'

type BlockProps = { children?: ReactNode }
type ListItemProps = { children?: ReactNode; value?: { style?: string } }
type MarkProps = {
  children?: ReactNode
  value?: { href?: string; weight?: string; openInNewTab?: boolean }
}

/**
 * Generate a URL-safe slug from text
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
}

/**
 * Extract plain text from React children (including nested elements)
 */
function getTextFromChildren(children: ReactNode): string {
  let text = ''
  Children.forEach(children, (child) => {
    if (typeof child === 'string') {
      text += child
    } else if (typeof child === 'number') {
      text += String(child)
    } else if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) {
      text += getTextFromChildren(child.props.children)
    }
  })
  return text
}

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
const getWidthClass = (width?: string) => {
  if (width && width in gridCols) {
    return gridCols[width as keyof typeof gridCols]
  }
  return gridCols.full
}

// "media-item" class identifies blocks for sibling selectors
// "peer" allows the *next* sibling to target this one
const getMediaClasses = () => {
  return cn(
    'media-item peer',
    'mt-6 mb-6 md:mt-12 md:mb-12',
    'has-[+_.media-item]:mb-2 has-[+_.media-item]:md:mb-2',
    'peer-[.media-item]:mt-2 peer-[.media-item]:md:mt-2',
  )
}

export const gridComponents: PortableTextComponents = {
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
    imageBlock: ({ value }: { value: any }) => (
      <div className={cn(getWidthClass(value?.width), getMediaClasses())}>
        <ContentBlock block={{ ...value, _type: 'imageBlock' }} layout="grid" />
      </div>
    ),
    videoBlock: ({ value }: { value: any }) => (
      <div className={cn(getWidthClass(value?.width), getMediaClasses())}>
        <ContentBlock block={{ ...value, _type: 'videoBlock' }} layout="grid" />
      </div>
    ),
    carouselBlock: ({ value }: { value: any }) => (
      <div className={cn(getWidthClass(value?.width), getMediaClasses())}>
        <ContentBlock block={{ ...value, _type: 'carouselBlock' }} layout="grid" />
      </div>
    ),
    twoColumnImageBlock: ({ value }: { value: any }) => (
      <div className={cn(gridCols.full, getMediaClasses())}>
        <ContentBlock block={{ ...value, _type: 'twoColumnImageBlock' }} layout="grid" />
      </div>
    ),
  },
  block: {
    normal: ({ children }: BlockProps) => (
      <p className={cn(gridCols.narrow, 'text-xl leading-7')}>{children}</p>
    ),
    h1: ({ children }: BlockProps) => {
      const id = slugify(getTextFromChildren(children))
      return (
        <h1 id={id} className={cn(gridCols.narrow, 'text-5xl mt-12 mb-6 md:mt-24 md:mb-12')}>
          {children}
        </h1>
      )
    },
    h2: ({ children }: BlockProps) => {
      const id = slugify(getTextFromChildren(children))
      return (
        <h2 id={id} className={cn(gridCols.narrow, 'mt-12 mb-6 md:mt-20 md:mb-10')}>
          {children}
        </h2>
      )
    },
    h3: ({ children }: BlockProps) => {
      const id = slugify(getTextFromChildren(children))
      return (
        <h3 id={id} className={cn(gridCols.narrow, 'mt-10 mb-5 md:mt-16 md:mb-8')}>
          {children}
        </h3>
      )
    },
    h4: ({ children }: BlockProps) => {
      const id = slugify(getTextFromChildren(children))
      return (
        <h4 id={id} className={cn(gridCols.narrow, 'mt-10 mb-5 md:mt-16 md:mb-8 font-normal')}>
          {children}
        </h4>
      )
    },
    h5: ({ children }: BlockProps) => {
      const id = slugify(getTextFromChildren(children))
      return (
        <h5 id={id} className={cn(gridCols.narrow, 'mt-10 mb-5 md:mt-16 md:mb-8 font-medium')}>
          {children}
        </h5>
      )
    },
    h6: ({ children }: BlockProps) => {
      const id = slugify(getTextFromChildren(children))
      return (
        <h6 id={id} className={cn(gridCols.narrow, 'mt-6 mb-3 font-medium')}>
          {children}
        </h6>
      )
    },
    lead: ({ children }: BlockProps) => (
      <p className={cn(gridCols.narrow, 'text-foreground mb-6 text-base leading-7')}>{children}</p>
    ),
    small: ({ children }: BlockProps) => (
      <p
        className={cn(
          gridCols.narrow,
          'text-muted-foreground mb-4 text-sm leading-5 tracking-wide',
        )}
      >
        {children}
      </p>
    ),
    blockquote: ({ children }: BlockProps) => (
      <blockquote
        className={cn(
          gridCols.medium,
          'text-4xl font-normal tracking-tight text-foreground text-center my-16 leading-snug',
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
    strong: ({ children }: MarkProps) => <strong className="font-medium">{children}</strong>,
    em: ({ children }: MarkProps) => <em className="italic">{children}</em>,
    code: ({ children }: MarkProps) => (
      <code className="rounded bg-muted/60 px-1.5 py-0.5 text-sm font-mono">{children}</code>
    ),
    underline: ({ children }: MarkProps) => <span className="underline">{children}</span>,
    'strike-through': ({ children }: MarkProps) => <span className="line-through">{children}</span>,
    link: ({ value, children }: MarkProps) => {
      const isExternal = value?.openInNewTab
      return (
        <a
          href={value?.href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer' : undefined}
          className="text-foreground underline decoration-1 underline-offset-4 hover:text-muted-foreground hover:decoration-muted-foreground transition-colors"
        >
          {children}
        </a>
      )
    },
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

/**
 * Components for using the typography system WITHOUT the grid layout classes.
 * Useful for containers that handle their own layout (e.g., max-width containers, side panels).
 */
export const typographyComponents: PortableTextComponents = {
  types: gridComponents.types,
  block: {
    normal: ({ children }: BlockProps) => <p className="text-xl leading-7">{children}</p>,
    h1: ({ children }: BlockProps) => {
      const id = slugify(getTextFromChildren(children))
      return (
        <h1 id={id} className="text-5xl mt-12 mb-6 md:mt-24 md:mb-12">
          {children}
        </h1>
      )
    },
    h2: ({ children }: BlockProps) => {
      const id = slugify(getTextFromChildren(children))
      return (
        <h2 id={id} className="mt-12 mb-6 md:mt-20 md:mb-10">
          {children}
        </h2>
      )
    },
    h3: ({ children }: BlockProps) => {
      const id = slugify(getTextFromChildren(children))
      return (
        <h3 id={id} className="mt-10 mb-5 md:mt-16 md:mb-8">
          {children}
        </h3>
      )
    },
    h4: ({ children }: BlockProps) => {
      const id = slugify(getTextFromChildren(children))
      return (
        <h4 id={id} className="mt-10 mb-5 md:mt-16 md:mb-8 font-normal">
          {children}
        </h4>
      )
    },
    h5: ({ children }: BlockProps) => {
      const id = slugify(getTextFromChildren(children))
      return (
        <h5 id={id} className="mt-10 mb-5 md:mt-16 md:mb-8 font-medium">
          {children}
        </h5>
      )
    },
    h6: ({ children }: BlockProps) => {
      const id = slugify(getTextFromChildren(children))
      return (
        <h6 id={id} className="mt-6 mb-3 font-medium">
          {children}
        </h6>
      )
    },
    lead: ({ children }: BlockProps) => (
      <p className="text-foreground mb-6 text-base leading-7">{children}</p>
    ),
    small: ({ children }: BlockProps) => (
      <p className="text-muted-foreground mb-4 text-sm leading-5 tracking-wide">{children}</p>
    ),
    blockquote: ({ children }: BlockProps) => (
      <blockquote className="text-4xl font-normal tracking-tight text-foreground text-center my-16 leading-snug">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: BlockProps) => (
      <ul className="list-disc pl-6 space-y-2 mb-5 mt-2">{children}</ul>
    ),
    number: ({ children }: BlockProps) => (
      <ol className="list-decimal pl-6 space-y-2 mb-5 mt-2">{children}</ol>
    ),
  },
  listItem: gridComponents.listItem,
  marks: gridComponents.marks,
}
