import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { LoginModalProvider } from '@/components/providers/login-modal-provider'
import { CookiePreferencesProvider } from '@/components/providers/cookie-preferences-provider'
import { MobileNavigationProvider } from '@/components/providers/mobile-navigation-provider'
import { HeaderWithNavLayout } from '@/components/header-with-nav-layout'

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthProvider>
      <LoginModalProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <MobileNavigationProvider>
            <CookiePreferencesProvider>
              <HeaderWithNavLayout>{children}</HeaderWithNavLayout>
            </CookiePreferencesProvider>
          </MobileNavigationProvider>
        </ThemeProvider>
      </LoginModalProvider>
    </AuthProvider>
  )
}
