import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import { plain } from '@/lib/fonts'
import '../globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { LoginModalProvider } from '@/components/providers/login-modal-provider'
import { HeaderWithNavLayout } from '@/components/header-with-nav-layout'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Mike Y.',
  description: 'Personal website and portfolio',
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
        <AuthProvider>
          <LoginModalProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <HeaderWithNavLayout>{children}</HeaderWithNavLayout>
            </ThemeProvider>
          </LoginModalProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
