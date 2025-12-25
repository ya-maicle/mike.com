import type { Metadata, Viewport } from 'next'
import { Geist_Mono } from 'next/font/google'
import { plain } from '@/lib/fonts'
import './globals.css'

import { SITE_CONFIG } from '@/lib/constants'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: SITE_CONFIG.name,
    template: `%s – ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.description,
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${plain.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
