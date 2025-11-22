import type { DocumentActionComponent } from 'sanity'

export const linkToCaseStudyAction: DocumentActionComponent = (props) => {
  const { draft, published, type, onComplete, id, getClient } = props

  const supported = new Set(['caseStudyBlock', 'imageBlock', 'videoBlock', 'carouselBlock'])
  if (!supported.has(type)) return null
  if (draft?.caseStudy || published?.caseStudy) return null

  return {
    label: 'Link to Parent Case Study',
    icon: () => '🔗',
    onHandle: async () => {
      try {
        const url = new URL(window.location.href)
        const caseStudyId =
          url.searchParams.get('referringDocumentId') || url.searchParams.get('parentId') || null
        if (!caseStudyId) {
          alert('Could not detect parent case study from URL.')
          onComplete?.()
          return
        }
        const client = getClient({ apiVersion: '2025-01-01' })
        await client
          .patch(id)
          .set({ caseStudy: { _type: 'reference', _ref: caseStudyId } })
          .commit({ autoGenerateArrayKeys: true })
        onComplete?.()
      } catch (err) {
        console.error('Link to Case Study failed', err)
        alert('Failed to link case study; please set it manually.')
        onComplete?.()
      }
    },
  }
}
