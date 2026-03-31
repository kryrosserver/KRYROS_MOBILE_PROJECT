import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/providers/AuthProvider'
import { CartProvider } from '@/providers/CartProvider'
import { CurrencyProvider } from '@/providers/CurrencyProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { Header } from '@/components/layout/Header'
import { Toaster } from '@/components/ui/toaster'

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
  title: 'KRYROS | Premium Mobile Tech',
  description: 'Your trusted source for premium mobile technology and accessories.',
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
                </div>
                <Toaster />
              </CartProvider>
            </CurrencyProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
