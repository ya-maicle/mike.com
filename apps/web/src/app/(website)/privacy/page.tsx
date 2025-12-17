import { sanityFetch } from '@/sanity/client'
import { notFound } from 'next/navigation'
import { LegalPageContent } from '@/components/legal-page-content'
import type { PortableTextBlock } from '@portabletext/types'

export const metadata = {
  title: 'Privacy Policy',
}

export default async function PrivacyPage() {
  const page = await sanityFetch<{
    title: string
    content: PortableTextBlock[]
    publishedAt: string
  }>(`*[_type == "legalPage" && slug.current == "privacy"][0]{ title, content, publishedAt }`)

  if (!page) {
    notFound()
  }

  const formattedDate = page.publishedAt
    ? new Date(page.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <main className="min-h-screen pb-24">
      <div className="mx-auto max-w-[648px] pt-6 pb-16 space-y-8 text-center flex flex-col items-center">
        {formattedDate && (
          <div className="text-sm text-muted-foreground font-medium">Updated: {formattedDate}</div>
        )}

        <h1 className="text-5xl font-medium tracking-tight text-foreground leading-none">
          {page.title}
        </h1>
      </div>

      <div className="mx-auto max-w-[648px]">
        <LegalPageContent content={page.content} />
      </div>
    </main>
  )
}
