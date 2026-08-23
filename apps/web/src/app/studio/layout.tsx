import { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'

export const metadata: Metadata = createPageMetadata({
  title: 'Sanity Studio',
  description: 'Sanity Studio for mikeiu.com',
  path: '/studio',
  noIndex: true,
  noFollow: true,
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return children
}
