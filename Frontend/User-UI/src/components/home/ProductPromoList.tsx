"use client"

import Link from "next/link"

interface ProductPromoListProps {
  section: any
}

export function ProductPromoList({ section }: ProductPromoListProps) {
  const items = section.config?.items || []

  return (
    <div className="container-custom py-6 md:py-10">
      {section.title && (
        <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight mb-4 md:mb-8 text-slate-900">
          {section.title}
        </h2>
      )}
      <div className="space-y-4 md:space-y-6">
        {items.map((item: any, index: number) => (
          <Link key={index} href={item.link || '/shop'} className="block group">
            <div 
              className="rounded-2xl overflow-hidden p-6 md:p-12 transition-transform group-hover:scale-[1.01]"
              style={{ backgroundColor: item.backgroundColor || '#EEF2FF' }}
            >
              <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-center">
                <div style={{ color: item.textColor || '#4F46E5' }}>
                  <h3 className="text-xl md:text-3xl font-black uppercase mb-2 md:mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm md:text-xl opacity-80 mb-4 md:mb-6">
                    {item.subtitle}
                  </p>
                  <p className="text-sm md:text-lg font-bold flex items-center gap-2">
                    {item.linkText}
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </p>
                </div>
                {item.imageUrl && (
                  <div className="flex justify-center mt-4 md:mt-0">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="max-h-48 md:max-h-64 w-auto object-contain"
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
