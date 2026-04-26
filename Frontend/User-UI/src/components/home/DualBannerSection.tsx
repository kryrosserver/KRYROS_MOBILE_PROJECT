"use client"

import Link from "next/link"

interface DualBannerSectionProps {
  section: any
}

export function DualBannerSection({ section }: DualBannerSectionProps) {
  const banners = section.config?.banners || []

  return (
    <div className="container-custom py-6 md:py-10">
      <div className="grid md:grid-cols-2 gap-4 md:gap-8">
        {banners.map((banner: any, index: number) => (
          <Link key={index} href={banner.link || '/shop'} className="block group">
            <div 
              className="rounded-2xl md:rounded-3xl overflow-hidden p-6 md:p-10 transition-transform group-hover:scale-[1.02]"
              style={{ backgroundColor: banner.backgroundColor || '#FFF1F2' }}
            >
              <div className="flex flex-col items-start h-full">
                {banner.badge && (
                  <span
                    className="px-4 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest mb-4 md:mb-6"
                    style={{ backgroundColor: banner.badgeColor, color: '#ffffff' }}
                  >
                    {banner.badge}
                  </span>
                )}
                <div className="flex-1">
                  <h3 
                    className="text-xl md:text-3xl font-black uppercase mb-2 md:mb-4"
                    style={{ color: banner.textColor }}
                  >
                    {banner.title}
                  </h3>
                  <p 
                    className="text-sm md:text-lg opacity-80 mb-4 md:mb-6"
                    style={{ color: banner.textColor }}
                  >
                    {banner.subtitle}
                  </p>
                </div>
                <p 
                  className="text-sm md:text-lg font-bold flex items-center gap-2"
                  style={{ color: banner.textColor }}
                >
                  {banner.linkText}
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </p>
                {banner.imageUrl && (
                  <div className="mt-4 md:mt-8 w-full">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-auto object-cover rounded-xl md:rounded-2xl"
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
