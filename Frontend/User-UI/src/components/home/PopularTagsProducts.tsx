"use client"

import { useState } from "react"
import { ProductGridSection } from "./ProductGridSection"
import { ArrowRight, SlidersHorizontal } from "lucide-react"
import Link from "next/link"

interface PopularTagsProductsProps {
  section: any
}

export function PopularTagsProducts({ section }: PopularTagsProductsProps) {
  const tags = section.config?.tags || [
    { label: 'BESTSELLER', isActive: true, value: 'bestseller' },
    { label: 'HOT', isActive: false, value: 'hot' },
    { label: 'NEW', isActive: false, value: 'new' },
    { label: 'SALE', isActive: false, value: 'sale' },
  ]
  const [activeTag, setActiveTag] = useState(tags.find((t: any) => t.isActive)?.value || tags[0]?.value)

  return (
    <div className="container-custom py-6 md:py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight mb-1 text-slate-900 leading-none">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-xs md:text-base text-slate-500 font-medium">{section.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href="/categories" 
            className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors flex items-center gap-2"
          >
            All Categories <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
          </Link>
          <button className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all">
            <SlidersHorizontal className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-3 mb-6 md:mb-10">
        {tags.map((tag: any, index: number) => (
          <button
            key={index}
            onClick={() => setActiveTag(tag.value || tag.label.toLowerCase())}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-lg font-black text-[9px] md:text-[11px] uppercase tracking-[0.15em] transition-all border-2 ${
              activeTag === (tag.value || tag.label.toLowerCase())
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
          config: { 
            limit: section.config?.limit || 12, 
            popularity: activeTag 
          }
        }} 
      />
    </div>
  )
}
