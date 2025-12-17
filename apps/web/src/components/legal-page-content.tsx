'use client'

import { PortableText, type PortableTextComponents } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/types'
import { cn } from '@/lib/utils'

const spacerSizes: Record<string, string> = {
  sm: 'h-4', // 16px
  md: 'h-8', // 32px
  lg: 'h-16', // 64px
  xl: 'h-24', // 96px
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
  blockquote: 'italic text-muted-foreground',
}

const components: PortableTextComponents = {
  types: {
    spacerBlock: ({ value }) => {
      const size = value?.size || 'md'
      return <div className={spacerSizes[size] || spacerSizes.md} aria-hidden="true" />
    },
  },
  block: {
    // Normal paragraphs - standard bottom margin, no top margin (contextual spacing)
    normal: ({ children }) => <p className="leading-7 text-foreground mb-5">{children}</p>,
    // Headings - larger top margin for visual separation from previous content
    h1: ({ children }) => (
      <h1 className="text-6xl font-medium tracking-tight text-foreground mb-6 mt-10 first:mt-0">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-5xl font-medium tracking-tight text-foreground mb-5 mt-10 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-4xl font-medium tracking-tight text-foreground mb-4 mt-8 first:mt-0">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-3xl font-medium tracking-tight text-foreground mb-4 mt-8 first:mt-0">
        {children}
      </h4>
    ),
    h5: ({ children }) => (
      <h5 className="text-2xl font-medium tracking-tight text-foreground mb-3 mt-6 first:mt-0">
        {children}
      </h5>
    ),
    h6: ({ children }) => (
      <h6 className="text-lg font-medium tracking-tight text-foreground mb-3 mt-6 first:mt-0">
        {children}
      </h6>
    ),
    // Lead paragraph - slightly more breathing room
    lead: ({ children }) => <p className="text-xl leading-7 text-foreground mb-6">{children}</p>,
    small: ({ children }) => (
      <p className="text-sm leading-6 text-muted-foreground mb-4">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-border pl-6 italic text-muted-foreground my-8">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => <ul className="list-disc pl-6 space-y-2 mb-5 mt-2">{children}</ul>,
    number: ({ children }) => <ol className="list-decimal pl-6 space-y-2 mb-5 mt-2">{children}</ol>,
  },
  listItem: {
    bullet: ({ children, value }) => {
      const style = value?.style || 'normal'
      const classes = styleClasses[style] || styleClasses.normal
      return <li className={classes}>{children}</li>
    },
    number: ({ children, value }) => {
      const style = value?.style || 'normal'
      const classes = styleClasses[style] || styleClasses.normal
      return <li className={classes}>{children}</li>
    },
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-muted/60 px-1.5 py-0.5 text-sm font-mono">{children}</code>
    ),
    underline: ({ children }) => <span className="underline">{children}</span>,
    'strike-through': ({ children }) => <span className="line-through">{children}</span>,
    link: ({ value, children }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noreferrer"
        className="text-foreground underline decoration-1 underline-offset-4 hover:text-muted-foreground hover:decoration-muted-foreground transition-colors"
      >
        {children}
      </a>
    ),
    fontWeight: ({ value, children }) => {
      const weightMap: Record<string, string> = {
        light: 'font-light',
        normal: 'font-normal',
        medium: 'font-medium',
        semibold: 'font-semibold',
        bold: 'font-bold',
      }
      const weightClass = weightMap[value?.weight] || ''
      return <span className={weightClass}>{children}</span>
    },
  },
}

interface LegalPageContentProps {
  content: PortableTextBlock[]
  className?: string
}

export function LegalPageContent({ content, className }: LegalPageContentProps) {
  if (!content) return null

  return (
    <div className={cn('', className)}>
      <PortableText value={content} components={components} />
    </div>
  )
}
