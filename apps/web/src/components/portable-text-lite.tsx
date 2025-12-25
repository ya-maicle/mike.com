import * as React from 'react'
import { cn } from '@/lib/utils'

type Span = { _type: 'span'; text: string; marks?: string[] }
type MarkDef = { _key: string; _type: string; href?: string }
type Block = {
  _type: 'block'
  style?: 'normal' | 'h3' | 'h4' | 'blockquote'
  children?: Span[]
  markDefs?: MarkDef[]
  listItem?: 'bullet' | 'number'
  level?: number
}

function withMarks(text: React.ReactNode, marks: string[] = [], markDefs: MarkDef[] = []) {
  return marks.reduce((acc, mark) => {
    if (mark === 'strong') return <strong className="font-semibold">{acc}</strong>
    if (mark === 'em') return <em className="italic">{acc}</em>
    if (mark === 'code')
      return <code className="rounded bg-muted/60 px-1.5 py-0.5 text-sm">{acc}</code>
    const def = markDefs.find((d) => d._key === mark)
    if (def?._type === 'link' && def.href) {
      return (
        <a
          href={def.href}
          className="text-foreground underline decoration-1 underline-offset-4 hover:text-muted-foreground hover:decoration-muted-foreground transition-colors"
          target="_blank"
          rel="noreferrer"
        >
          {acc}
        </a>
      )
    }
    return acc
  }, text)
}

function renderInline(children: Span[] = [], markDefs: MarkDef[] = []) {
  return children.map((span, i) => (
    <React.Fragment key={i}>{withMarks(span.text, span.marks, markDefs)}</React.Fragment>
  ))
}

export function PortableTextLite({ value, className }: { value?: Block[]; className?: string }) {
  if (!Array.isArray(value) || value.length === 0) return null

  const elements: React.ReactNode[] = []

  for (let i = 0; i < value.length; i++) {
    const block = value[i]
    if (!block || block._type !== 'block') continue

    // Group lists
    if (block.listItem) {
      const type = block.listItem
      const items: React.ReactNode[] = []
      let j = i
      while (j < value.length && value[j]?._type === 'block' && value[j]?.listItem === type) {
        const b = value[j] as Block
        items.push(<li key={j}>{renderInline(b.children, b.markDefs)}</li>)
        j++
      }
      elements.push(
        type === 'bullet' ? (
          <ul key={`list-${i}`} className={cn('list-disc pl-6 space-y-1', className)}>
            {items}
          </ul>
        ) : (
          <ol key={`list-${i}`} className={cn('list-decimal pl-6 space-y-1', className)}>
            {items}
          </ol>
        ),
      )
      i = j - 1
      continue
    }

    // Regular blocks
    const content = renderInline(block.children, block.markDefs)
    switch (block.style) {
      case 'h3':
        elements.push(
          <h3 key={i} className="text-2xl font-semibold tracking-tight">
            {content}
          </h3>,
        )
        break
      case 'h4':
        elements.push(
          <h4 key={i} className="text-xl font-semibold tracking-tight mt-6 mb-2">
            {content}
          </h4>,
        )
        break
      case 'blockquote':
        elements.push(
          <blockquote
            key={i}
            className="w-full max-w-[885px] mx-auto text-4xl font-normal tracking-tight text-foreground text-center my-16"
          >
            {content}
          </blockquote>,
        )
        break
      default:
        elements.push(
          <p key={i} className={cn('leading-7 text-foreground/90', className)}>
            {content}
          </p>,
        )
    }
  }

  return <div className="space-y-3">{elements}</div>
}
