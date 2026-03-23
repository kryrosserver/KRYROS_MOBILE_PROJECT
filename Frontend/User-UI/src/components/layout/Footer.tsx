import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from './Logo'

const footerLinks = {
  shop: {
    title: 'Shop',
    links: [
      { label: 'Smartphones', href: '/shop?category=smartphones' },
      { label: 'Laptops', href: '/shop?category=laptops' },
      { label: 'Accessories', href: '/shop?category=accessories' },
      { label: 'Wearables', href: '/shop?category=wearables' },
      { label: 'Software', href: '/software' },
    ],
  },
  services: {
    title: 'Services',
    links: [
      { label: 'Phone Repairs', href: '/services?type=repairs' },
      { label: 'Laptop Repairs', href: '/services?type=repairs' },
      { label: 'Installation', href: '/services?type=installation' },
      { label: 'Tech Support', href: '/services?type=support' },
      { label: 'Consulting', href: '/services?type=consulting' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns', href: '/returns' },
      { label: 'Track Order', href: '/track-order' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
}

export function Footer() {
  return (
    <footer className="bg-kryros-primary text-white">
      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Logo size={48} />
            </Link>
            <p className="text-gray-300 mb-6 max-w-sm">
              Your trusted source for phones, electronics, accessories, software, and technology services in Zambia and beyond.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Phone className="h-5 w-5 text-kryros-accent" />
                <span>+260 966 423 719</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Mail className="h-5 w-5 text-kryros-accent" />
                <span>kryrosmobile@gmail.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin className="h-5 w-5 text-kryros-accent" />
                <span>Lusaka, Zambia</span>
              </div>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{footerLinks.shop.title}</h3>
            <ul className="space-y-3">
              {footerLinks.shop.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-kryros-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{footerLinks.services.title}</h3>
            <ul className="space-y-3">
              {footerLinks.services.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-kryros-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{footerLinks.support.title}</h3>
            <ul className="space-y-3">
              {footerLinks.support.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-kryros-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">{footerLinks.company.title}</h3>
            <ul className="space-y-3">
              {footerLinks.company.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-kryros-accent transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-700">
        <div className="container-custom py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-1">Subscribe to our Newsletter</h3>
              <p className="text-gray-400 text-sm">Get the latest deals and updates directly to your inbox</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 px-4 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder:text-gray-400 focus:outline-none focus:border-kryros-accent"
              />
              <Button className="bg-kryros-accent hover:bg-kryros-accent-hover">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-700">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} KRYROS MOBILE TECH LIMITED. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-kryros-accent transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-kryros-accent transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-kryros-accent transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-kryros-accent transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-kryros-accent transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-sm mr-2">We accept:</span>
              <div className="flex gap-2">
                <div className="w-10 h-6 bg-gray-700 rounded flex items-center justify-center text-xs font-bold">
                  Visa
                </div>
                <div className="w-10 h-6 bg-gray-700 rounded flex items-center justify-center text-xs font-bold">
                  MC
                </div>
                <div className="w-10 h-6 bg-gray-700 rounded flex items-center justify-center text-xs font-bold">
                  M-Pesa
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
