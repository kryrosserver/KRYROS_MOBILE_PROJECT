"use client"

import Link from "next/link"

interface TrendProductsBannerProps {
  section: any
}

export function TrendProductsBanner({ section }: TrendProductsBannerProps) {
  const config = section.config || {}
  const badges = config.badges || []
  const featuredProducts = config.featuredProducts || []

  return (
    <div className="container-custom py-6 md:py-10">
      <div 
        className="rounded-2xl md:rounded-3xl overflow-hidden p-6 md:p-12"
        style={{ backgroundColor: config.backgroundColor || '#FFF7ED' }}
      >
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div style={{ color: config.textColor || '#78350F' }}>
            <div className="flex flex-wrap gap-2 mb-4">
              {badges.map((badge: any, index: number) => (
                <span
                  key={index}
                  className="px-4 py-1.5 rounded-full font-black text-[10px] md:text-xs uppercase tracking-widest"
                  style={{ 
                    backgroundColor: badge.backgroundColor || '#FEE2E2', 
                    color: badge.color || '#991B1B' 
                  }}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            <h3 className="text-2xl md:text-4xl font-black uppercase mb-4 leading-tight">
              {config.title}
            </h3>
            <ul className="space-y-2 mb-6">
              {featuredProducts.map((product: string, index: number) => (
                <li key={index} className="flex items-center text-sm md:text-lg font-bold">
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {product}
                </li>
              ))}
            </ul>
            <Link
              href={config.buttonLink || '/shop'}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-black text-sm md:text-base"
              style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
            >
              {config.buttonText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          {config.imageUrl && (
            <div className="flex justify-center">
              <img
                src={config.imageUrl}
                alt={config.title}
                className="max-h-64 md:max-h-96 w-auto object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
