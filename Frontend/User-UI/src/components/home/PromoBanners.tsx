"use client"

import { useEffect, useState } from "react"
import { cmsApi } from "@/lib/api"
import Link from "next/link"
import { ArrowRight, Zap, Gift, Tag } from "lucide-react"

import { resolveImageUrl } from "@/lib/utils"

export function PromoBanners() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cmsApi.getBanners().then((res) => {
      if (res.data) {
        setBanners(res.data)
      }
      setLoading(false)
    })
  }, [])

  const defaultBanners = [
    {
      title: "Flash Sale",
      subtitle: "Up to 50% Off",
      desc: "Latest smartphones at unbeatable prices.",
      icon: <Zap className="h-10 w-10 text-primary" />,
      color: "bg-primary/5",
      href: "/flash-sales"
    },
    {
      title: "Wholesale",
      subtitle: "Bulk Orders",
      desc: "Special pricing for retailers and business owners.",
      icon: <Tag className="h-10 w-10 text-blue-500" />,
      color: "bg-blue-50",
      href: "/wholesale"
    }
  ]

  const displayBanners = banners.length > 0 ? banners : defaultBanners

  return (
    <section className="py-24">
      <div className="container-custom">
        <div className="grid md:grid-cols-2 gap-8">
          {displayBanners.map((banner, i) => (
            <Link 
              key={i} 
              href={banner.href || banner.link || "#"}
              className={`relative overflow-hidden group rounded-[3rem] border border-slate-100 p-12 md:p-16 ${banner.color || 'bg-slate-50'} hover:shadow-xl transition-all duration-500 min-h-[300px]`}
            >
              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center overflow-hidden">
                      {banner.image ? (
                        <img src={resolveImageUrl(banner.image)} alt={banner.title} className="h-full w-full object-cover" />
                      ) : (
                        banner.icon || <Gift className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{banner.subtitle}</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-slate-900 leading-[0.95]">
                    {banner.title}
                  </h3>
                  <p className="text-lg text-slate-500 font-medium max-w-xs">{banner.desc || banner.description}</p>
                </div>
                
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 group-hover:gap-4 transition-all">
                  Shop Now <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {/* Banner Image Background */}
              {banner.image && (
                <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 group-hover:opacity-20 transition-opacity">
                   <img src={resolveImageUrl(banner.image)} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              {/* Decorative elements */}
              {!banner.image && (
                <>
                  <div className="absolute top-0 right-0 h-64 w-64 bg-white/40 rounded-full -mr-32 -mt-32 blur-3xl" />
                  <div className="absolute bottom-0 left-0 h-32 w-32 bg-white/20 rounded-full -ml-16 -mb-16 blur-2xl" />
                </>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
