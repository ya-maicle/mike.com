import { sanityFetch } from '@/sanity/client'
import { notFound } from 'next/navigation'
import { PageTemplate } from '@/components/page-template'
import { LegalPageContent } from '@/components/legal-page-content'
import type { PortableTextBlock } from '@portabletext/types'
import { createPageMetadata } from '@/lib/seo'

export const metadata = createPageMetadata({
  title: 'Privacy Policy',
  description: 'Privacy policy for mikeiu.com.',
  path: '/privacy',
  noIndex: true,
})

export default async function PrivacyPage() {
  const page = await sanityFetch<{
    title: string
    subtitle?: string
    content: PortableTextBlock[]
    publishedAt: string
  }>(`*[_type == "page" && slug.current == "privacy"][0]{ title, subtitle, content, publishedAt }`)

  if (!page) {
    notFound()
  }

  const formattedDate = page.publishedAt
    ? new Date(page.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : undefined

  return (
    <PageTemplate title={page.title} subtitle={page.subtitle} metadata={formattedDate}>
      <LegalPageContent content={page.content} />
    </PageTemplate>
  )
}
