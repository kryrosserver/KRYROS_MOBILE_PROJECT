"use client"

import Link from "next/link"

interface DiscountBannerProps {
  section: any
}

export function DiscountBanner({ section }: DiscountBannerProps) {
  const config = section.config || {}

  return (
    <div className="container-custom py-16">
      <div 
        className="rounded-3xl overflow-hidden relative"
        style={{ backgroundColor: config.backgroundColor || '#FFF1F2' }}
      >
        {config.backgroundImageUrl && (
          <img
            src={config.backgroundImageUrl}
            alt={config.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div 
          className="relative z-10 p-12 md:p-20"
          style={{ backgroundColor: config.overlayColor || 'rgba(255, 241, 242, 0.95)' }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left">
              <h2 
                className="text-6xl md:text-8xl font-black mb-4"
                style={{ color: config.discountTextColor || '#991B1B' }}
              >
                {config.discountText}
              </h2>
              <p 
                className="text-xl md:text-2xl font-bold"
                style={{ color: config.titleColor || '#991B1B' }}
              >
                {config.title}
              </p>
            </div>
            <Link
              href={config.buttonLink || '/shop'}
              className="inline-flex items-center gap-3 px-12 py-5 rounded-full font-black text-xl transition-transform hover:scale-105"
              style={{
                backgroundColor: config.buttonColor || '#991B1B',
                color: config.buttonTextColor || '#FFFFFF',
              }}
            >
              {config.buttonText}
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
