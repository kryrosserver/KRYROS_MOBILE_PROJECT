import type { Metadata, Viewport } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/providers/AuthProvider'
import { CartProvider } from '@/providers/CartProvider'
import { CurrencyProvider } from '@/providers/CurrencyProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { Header } from '@/components/layout/Header'
import { Toaster } from '@/components/ui/toaster'
import { WhatsAppWidget } from '@/components/whatsapp/WhatsAppWidget'
import MobileBottomNav from '@/components/layout/MobileNav/MobileBottomNav'
import { PWAInstallPrompt } from '@/components/common/PWAInstallPrompt'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'KRYROS World | Simple. Reliable. Global.',
  description: 'Shopping made easy with delivery everywhere.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'KRYROS',
    statusBarStyle: 'default',
  },
}

export const viewport: Viewport = {
  themeColor: '#1FA89A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <QueryProvider>
          <AuthProvider>
            <CurrencyProvider>
              <CartProvider>
                <div className="flex flex-col min-h-screen">
                  <Header />
                  <main className="flex-grow">
                    {children}
                  </main>
                  <MobileBottomNav />
                </div>
                <PWAInstallPrompt />
                <Toaster />
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
