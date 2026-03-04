import type { Metadata } from 'next'
import { Inter, Poppins, Playfair_Display, Montserrat } from 'next/font/google'
import './globals.css'
import { Header, TopBar } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CartProvider } from '@/providers/CartProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import { AuthProvider } from '@/providers/AuthProvider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-playfair',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'KRYROS - Premium Technology & Electronics',
    template: '%s | KRYROS',
  },
  description:
    'KRYROS MOBILE TECH LIMITED - Your trusted source for phones, electronics, accessories, software, and technology services. Buy now, pay later with our flexible credit system.',
  keywords: [
    'electronics',
    'phones',
    'smartphones',
    'laptops',
    'accessories',
    'buy now pay later',
    'credit',
    'installments',
    'Zambia',
    'technology',
  ],
  authors: [{ name: 'KRYROS MOBILE TECH LIMITED' }],
  creator: 'KRYROS',
  icons: {
    icon: '/logo.jpeg',
    apple: '/logo.jpeg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
      <head>
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} ${playfair.variable} ${montserrat.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <TopBar />
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <Toaster />
            </CartProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
