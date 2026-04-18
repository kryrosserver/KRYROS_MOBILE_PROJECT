"use client";

import Link from "next/link"

interface PromoBannerProps {
  section: any
}

export function PromoBanner({ section }: PromoBannerProps) {
  return (
    <div className="container-custom py-4 md:py-8">
      <div 
        className="rounded-2xl overflow-hidden relative"
        style={{ backgroundColor: section.backgroundColor || '#000000' }}
      >
        {section.imageUrl && (
          <img
            src={section.imageUrl}
            alt={section.title}
            className="w-full h-auto object-cover"
          />
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-between p-6 md:p-10" style={{ color: section.textColor || '#ffffff' }}>
          <div className="mt-4 md:mt-8">
            {section.subtitle && (
              <p className="text-lg md:text-2xl uppercase tracking-widest font-bold mb-2 md:mb-4">
                {section.subtitle}
              </p>
            )}
            {section.title && (
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                {section.title}
              </h2>
            )}
          </div>
          
          {section.link && section.linkText && (
            <div className="mb-4 md:mb-8">
              <Link 
                href={section.link} 
                className="inline-flex items-center gap-3 bg-yellow-400 text-black px-8 py-3 md:px-12 md:py-4 rounded-xl font-black text-lg hover:bg-yellow-300 transition-colors"
              >
                {section.linkText}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
