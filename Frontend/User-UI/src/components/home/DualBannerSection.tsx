"use client"

import Link from "next/link"

interface DualBannerSectionProps {
  section: any
}

export function DualBannerSection({ section }: DualBannerSectionProps) {
  const banners = section.config?.banners || []

  return (
    <div className="container-custom py-16">
      <div className="grid md:grid-cols-2 gap-8">
        {banners.map((banner: any, index: number) => (
          <Link key={index} href={banner.link || '/shop'} className="block group">
            <div 
              className="rounded-3xl overflow-hidden p-10 transition-transform group-hover:scale-[1.02]"
              style={{ backgroundColor: banner.backgroundColor || '#FFF1F2' }}
            >
              <div className="flex flex-col items-start h-full">
                {banner.badge && (
                  <span
                    className="px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest mb-6"
                    style={{ backgroundColor: banner.badgeColor, color: '#ffffff' }}
                  >
                    {banner.badge}
                  </span>
                )}
                <div className="flex-1">
                  <h3 
                    className="text-2xl md:text-3xl font-black uppercase mb-4"
                    style={{ color: banner.textColor }}
                  >
                    {banner.title}
                  </h3>
                  <p 
                    className="text-lg opacity-80 mb-6"
                    style={{ color: banner.textColor }}
                  >
                    {banner.subtitle}
                  </p>
                </div>
                <p 
                  className="text-lg font-bold flex items-center gap-2"
                  style={{ color: banner.textColor }}
                >
                  {banner.linkText}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </p>
                {banner.imageUrl && (
                  <div className="mt-8 w-full">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-auto object-cover rounded-2xl"
                    />
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
