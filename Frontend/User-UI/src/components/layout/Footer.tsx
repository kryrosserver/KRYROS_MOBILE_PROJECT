"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Facebook, Twitter, Instagram, Youtube, Globe } from "lucide-react"
import { Logo } from "./Logo"
import { cmsApi } from "@/lib/api"

interface FooterLink {
  id: string
  label: string
  href: string
  order: number
  isActive: boolean
}

interface FooterSection {
  id: string
  title: string
  order: number
  isActive: boolean
  links: FooterLink[]
}

interface FooterConfig {
  id?: string
  logo?: string
  description?: string
  contactPhone?: string
  contactEmail?: string
  contactAddress?: string
  copyrightText?: string
  socialLinks?: Array<{ platform: string; url: string }>
  paymentMethods?: Array<{ name: string }>
}

export function Footer() {
  const currentYear = new Date().getFullYear()
  const [sections, setSections] = useState<FooterSection[]>([])
  const [config, setConfig] = useState<FooterConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadFooterData = async () => {
      try {
        const res = await cmsApi.getFooter()
        if (res.data) {
          setSections(res.data.sections || [])
          setConfig(res.data.config || null)
        }
      } catch (err) {
        console.error("Error loading footer:", err)
      } finally {
        setLoading(false)
      }
    }
    loadFooterData()
  }, [])

  if (loading) {
    return (
      <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
        <div className="container-custom">
          <div className="animate-pulse space-y-8">
            <div className="h-20 w-32 bg-slate-100 rounded" />
            <div className="h-4 w-64 bg-slate-100 rounded" />
          </div>
        </div>
      </footer>
    )
  }

  const getSocialIcon = (platform: string) => {
    const p = platform.toLowerCase()
    if (p.includes('facebook')) return <Facebook className="h-5 w-5" />
    if (p.includes('instagram')) return <Instagram className="h-5 w-5" />
    if (p.includes('twitter') || p.includes('x')) return <Twitter className="h-5 w-5" />
    if (p.includes('youtube')) return <Youtube className="h-5 w-5" />
    return <Globe className="h-5 w-5" />
  }

  return (
    <footer className="bg-white border-t border-slate-100 pt-20 pb-10">
      <div className="container-custom">
        <div className="grid lg:grid-cols-4 gap-12 md:gap-20 mb-20">
          <div className="space-y-8 col-span-1 lg:col-span-1">
            <Link href="/">
              <Logo />
            </Link>
            <p className="text-slate-500 font-medium text-sm leading-relaxed max-w-xs">
              {config?.description || "Your premium destination for global technology, accessories, and flexible financing solutions across the globe."}
            </p>
            {config?.socialLinks && config.socialLinks.length > 0 && (
              <div className="flex items-center gap-4">
                {config.socialLinks.map((social, idx) => (
                  <a 
                    key={idx} 
                    href={social.url || "#"} 
                    className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all"
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 col-span-1 lg:col-span-3">
            {sections.map((section) => (
              <div key={section.id} className="space-y-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">{section.title}</h4>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.id}>
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

        <div className="pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            © {currentYear} {config?.copyrightText || "Kryros Global Tech Limited. All rights reserved."}
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