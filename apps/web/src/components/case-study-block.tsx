/* eslint-disable @typescript-eslint/no-explicit-any */
import { ContentBlock } from '@/components/content-block'

/**
 * Case Study Block Renderer
 * Wrapper around ContentBlock with max-width layout mode
 */
export function CaseStudyBlock({ block }: { block: any }) {
  return <ContentBlock block={block} layout="max-width" />
}
/* eslint-enable @typescript-eslint/no-explicit-any */
