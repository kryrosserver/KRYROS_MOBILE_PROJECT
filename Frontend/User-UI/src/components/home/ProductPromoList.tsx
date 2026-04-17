"use client"

import Link from "next/link"

interface ProductPromoListProps {
  section: any
}

export function ProductPromoList({ section }: ProductPromoListProps) {
  const items = section.config?.items || []

  return (
    <div className="container-custom py-12">
      {section.title && (
        <h2 className="text-3xl font-black uppercase tracking-tight mb-8 text-slate-900">
          {section.title}
        </h2>
      )}
      <div className="space-y-6">
        {items.map((item: any, index: number) => (
          <Link key={index} href={item.link || '/shop'} className="block group">
            <div 
              className="rounded-2xl overflow-hidden p-8 md:p-12 transition-transform group-hover:scale-[1.01]"
              style={{ backgroundColor: item.backgroundColor || '#EEF2FF' }}
            >
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div style={{ color: item.textColor || '#4F46E5' }}>
                  <h3 className="text-2xl md:text-3xl font-black uppercase mb-3">
                    {item.title}
                  </h3>
                  <p className="text-lg md:text-xl opacity-80 mb-6">
                    {item.subtitle}
                  </p>
                  <p className="text-lg font-bold flex items-center gap-2">
                    {item.linkText}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </p>
                </div>
                {item.imageUrl && (
                  <div className="flex justify-center">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="max-h-64 w-auto object-contain"
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
