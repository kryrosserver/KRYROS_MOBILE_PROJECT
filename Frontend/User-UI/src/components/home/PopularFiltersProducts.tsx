"use client"

import { useState } from "react"
import { ProductGridSection } from "./ProductGridSection"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface PopularFiltersProductsProps {
  section: any
}

export function PopularFiltersProducts({ section }: PopularFiltersProductsProps) {
  const tags = section.config?.filters || []
  const [activeTag, setActiveTag] = useState(tags.find((f: any) => f.isActive)?.label || tags[0]?.label)

  return (
    <div className="container-custom py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight mb-1 text-slate-900 leading-none">
            {section.title || "Popular Filters"}
          </h2>
          {section.subtitle && (
            <p className="text-xs md:text-base text-slate-500 font-medium">{section.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/shop" 
            className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors flex items-center gap-2"
          >
            View All <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-10">
        {tags.map((tag: any, index: number) => (
          <button
            key={index}
            onClick={() => setActiveTag(tag.label)}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] transition-all border-2 ${
              activeTag === tag.label
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/10 scale-105'
                : 'bg-white border-slate-100 text-[#2A3A4A] hover:border-slate-200 hover:text-slate-900'
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>

      <ProductGridSection 
        section={{ 
          ...section, 
          type: 'ProductGrid',
          config: { limit: section.config?.limit || 12, filter: activeTag?.toLowerCase() }
        }} 
      />
    </div>
  )
}
