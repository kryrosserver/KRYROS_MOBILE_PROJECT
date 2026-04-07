"use client"

import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Send } from "lucide-react"
import { Logo } from "./Logo"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: "Shop",
      links: [
        { label: "All Products", href: "/shop" },
        { label: "Flash Sales", href: "/flash-sales" },
        { label: "Wholesale", href: "/wholesale" },
        { label: "Credit Plans", href: "/credit" },
      ]
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Services", href: "/services" },
        { label: "Software", href: "/software" },
        { label: "Contact", href: "/contact" },
      ]
    },
    {
      title: "Support",
      links: [
        { label: "Track Order", href: "/track" },
        { label: "Shipping Info", href: "/shipping" },
        { label: "Returns", href: "/returns" },
        { label: "FAQs", href: "/faq" },
      ]
    }
  ]

  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
      <div className="container-custom">
        <div className="grid lg:grid-cols-4 gap-12 md:gap-20 mb-20">
          {/* Brand Info */}
          <div className="space-y-8 col-span-1 lg:col-span-1">
            <Link href="/">
              <Logo />
            </Link>
            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs">
              Your premium destination for global technology, accessories, and flexible financing solutions across the globe.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 col-span-1 lg:col-span-3">
            {footerLinks.map((section) => (
              <div key={section.title} className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            © {currentYear} Kryros Global Tech Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-8">
            <Link href="/privacy" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Privacy Policy</Link>
            <Link href="/terms" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
