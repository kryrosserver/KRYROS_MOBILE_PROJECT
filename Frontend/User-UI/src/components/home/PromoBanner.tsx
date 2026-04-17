"use client"

import Link from "next/link"

interface PromoBannerProps {
  section: any
}

export function PromoBanner({ section }: PromoBannerProps) {
  return (
    <div className="container-custom py-12 md:py-20">
      <div 
        className="rounded-3xl overflow-hidden relative"
        style={{ backgroundColor: section.backgroundColor || '#1B2533' }}
      >
        {section.imageUrl && (
          <img
            src={section.imageUrl}
            alt={section.title}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
          />
        )}
        <div className="relative z-10 p-10 md:p-16 text-center" style={{ color: section.textColor || '#ffffff' }}>
          {section.subtitle && (
            <p className="text-lg md:text-xl uppercase tracking-widest font-bold opacity-80 mb-4">
              {section.subtitle}
            </p>
          )}
          {section.title && (
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
              {section.title}
            </h2>
          )}
          {section.description && (
            <p className="text-lg max-w-2xl mx-auto mb-8 opacity-90">
              {section.description}
            </p>
          )}
          {section.link && section.linkText && (
            <Link 
              href={section.link} 
              className="inline-flex items-center gap-3 bg-white text-slate-900 px-10 py-4 rounded-full font-black text-lg hover:bg-yellow-400 transition-colors"
            >
              {section.linkText}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
