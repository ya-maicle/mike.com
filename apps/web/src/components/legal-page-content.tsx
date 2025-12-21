'use client'

import { PortableText } from 'next-sanity'
import type { PortableTextBlock } from '@portabletext/types'
import { cn } from '@/lib/utils'
import { gridComponents } from '@/components/portable-text-grid'

interface LegalPageContentProps {
  content: PortableTextBlock[]
  className?: string
}

export function LegalPageContent({ content, className }: LegalPageContentProps) {
  if (!content) return null

  return (
    <div className={cn('contents', className)}>
      <PortableText value={content} components={gridComponents} />
    </div>
  )
}
