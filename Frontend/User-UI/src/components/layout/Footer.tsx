'use client'

import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from './Logo'
import { useEffect, useState } from 'react'

export function Footer() {
  const [footer, setFooter] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const response = await fetch('/api/cms/footer')
        if (response.ok) {
          const data = await response.json()
          setFooter(data)
        }
      } catch (error) {
        console.error('Failed to fetch footer:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFooter()
  }, [])

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="h-5 w-5" />
      case 'twitter':
        return <Twitter className="h-5 w-5" />
      case 'instagram':
        return <Instagram className="h-5 w-5" />
      case 'linkedin':
        return <Linkedin className="h-5 w-5" />
      case 'youtube':
        return <Youtube className="h-5 w-5" />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <footer className="bg-kryros-primary text-white">
        <div className="container-custom py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-5 w-24 bg-white/10 rounded animate-pulse" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div key={j} className="h-4 w-32 bg-white/5 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    )
  }

  const config = footer?.config
  const sections = footer?.sections || []

  return (
    <footer className="bg-kryros-primary text-white">
      {/* Main Footer */}
      <div className="container-custom py-8 md:py-16 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 md:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 mb-4 md:mb-0">

            <Link href="/" className="flex items-center gap-2 mb-4 md:mb-6">
              {config?.logo ? (
                <img src={config.logo} alt="Logo" className="h-10 md:h-12 w-auto object-contain" />
              ) : (
                <Logo size={40} />
              )}
            </Link>
            <p className="text-gray-300 mb-4 md:mb-6 max-w-sm text-sm md:text-base">
              {config?.description || 'Your trusted source for quality products and services.'}
            </p>

            {/* Contact Info */}
            <div className="space-y-2 md:space-y-3">
              {config?.contactPhone && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Phone className="h-4 w-4 md:h-5 md:w-5 text-kryros-accent shrink-0" />
                  <span className="text-sm md:text-base">{config.contactPhone}</span>
                </div>
              )}
              {config?.contactEmail && (
                <div className="flex items-center gap-3 text-gray-300">
                  <Mail className="h-4 w-4 md:h-5 md:w-5 text-kryros-accent shrink-0" />
                  <span className="text-sm md:text-base">{config.contactEmail}</span>
                </div>
              )}
              {config?.contactAddress && (
                <div className="flex items-center gap-3 text-gray-300">
                  <MapPin className="h-4 w-4 md:h-5 md:w-5 text-kryros-accent shrink-0" />
                  <span className="text-sm md:text-base">{config.contactAddress}</span>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Footer Sections */}
          {sections.map((section: any) => (
            <div key={section.id} className="mb-4 md:mb-0">
              <h3 className="font-semibold text-base md:text-lg mb-3 md:mb-4">{section.title}</h3>
              <ul className="space-y-2 md:space-y-3">
                {section.links?.map((link: any) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className="text-gray-300 hover:text-kryros-accent transition-colors text-sm md:text-base block py-1 md:py-0"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-700">
        <div className="container-custom py-6 md:py-8 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-semibold text-base md:text-lg mb-1">
                {config?.newsletterTitle || 'Subscribe to our Newsletter'}
              </h3>
              <p className="text-gray-400 text-sm">
                {config?.newsletterSubtitle || 'Get the latest deals and updates directly to your inbox'}
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto flex-col sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2.5 md:py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 focus:outline-none focus:border-kryros-accent min-h-[44px]"
              />
              <Button className="bg-kryros-accent hover:bg-kryros-accent-hover min-h-[44px] px-4 md:px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container-custom py-4 md:py-6 px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm text-center md:text-left order-2 md:order-1">
              {config?.copyrightText?.replace('{year}', new Date().getFullYear().toString()) ||
                `© ${new Date().getFullYear()} KRYROS MOBILE TECH LIMITED. All rights reserved.`}
            </p>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-4 order-1 md:order-2">
              {config?.socialLinks?.map((social: any) => (
                <a
                  key={social.platform}
                  href={social.url}
                  className="text-gray-400 hover:text-kryros-accent transition-colors p-2 -m-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="flex items-center justify-center gap-2 order-3">
              <span className="text-gray-400 text-sm mr-1 md:mr-2 hidden sm:inline">We accept:</span>
              <div className="flex gap-2">
                {config?.paymentMethods?.map((method: any) => (
                  <div
                    key={method.name}
                    className="w-8 h-5 md:w-10 md:h-6 bg-gray-700 rounded flex items-center justify-center text-[8px] md:text-xs font-bold"
                  >
                    {method.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
