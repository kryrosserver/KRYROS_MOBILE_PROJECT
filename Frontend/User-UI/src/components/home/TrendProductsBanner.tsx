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
    <div className="container-custom py-16">
      <div 
        className="rounded-3xl overflow-hidden p-10 md:p-16"
        style={{ backgroundColor: config.backgroundColor || '#FFF7ED' }}
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div style={{ color: config.textColor || '#78350F' }}>
            <div className="flex flex-wrap gap-3 mb-8">
              {badges.map((badge: any, index: number) => (
                <span
                  key={index}
                  className="px-6 py-2 rounded-full font-black text-sm uppercase tracking-widest"
                  style={{ 
                    backgroundColor: badge.backgroundColor || '#FEE2E2', 
                    color: badge.color || '#991B1B' 
                  }}
                >
                  {badge.label}
                </span>
              ))}
            </div>
            <h3 className="text-3xl md:text-4xl font-black uppercase mb-8">
              {config.title}
            </h3>
            <ul className="space-y-4 mb-10">
              {featuredProducts.map((product: string, index: number) => (
                <li key={index} className="flex items-center text-xl font-bold">
                  <svg className="w-6 h-6 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {product}
                </li>
              ))}
            </ul>
            <Link
              href={config.buttonLink || '/shop'}
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-black text-lg"
              style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
            >
              {config.buttonText}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
          {config.imageUrl && (
            <div className="flex justify-center">
              <img
                src={config.imageUrl}
                alt={config.title}
                className="max-h-96 w-auto object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
