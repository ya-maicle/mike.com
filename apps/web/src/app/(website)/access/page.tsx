import type { Metadata } from 'next'
import { PortfolioAccessPage } from '@/components/portfolio-access-page'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'Portfolio access',
  description: 'Request and manage access to the private portfolio.',
  path: '/access',
  noIndex: true,
  noFollow: true,
})

export default async function AccessPage({
  searchParams,
}: {
  searchParams: Promise<{ signin?: string }>
}) {
  const { signin } = await searchParams
  return <PortfolioAccessPage signInOnly={signin === '1'} signInFailed={signin === 'failed'} />
}
