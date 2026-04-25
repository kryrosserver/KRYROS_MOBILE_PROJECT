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
    <div className="container-custom py-12 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 md:mb-14">
        <div>
          <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tight mb-2 text-slate-900 leading-none">
            {section.title}
          </h2>
          {section.subtitle && (
            <p className="text-sm md:text-lg text-slate-500 font-medium">{section.subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href="/categories" 
            className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors flex items-center gap-2"
          >
            All Categories <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
          </Link>
          <button className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-primary hover:border-primary/20 transition-all">
            <SlidersHorizontal className="h-4 w-4 md:h-5 md:w-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 md:gap-4 mb-10 md:mb-16">
        {tags.map((tag: any, index: number) => (
          <button
            key={index}
            onClick={() => setActiveTag(tag.value || tag.label.toLowerCase())}
            className={`px-6 md:px-10 py-3 md:py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all border-2 ${
              activeTag === (tag.value || tag.label.toLowerCase())
                ? 'bg-primary border-primary text-white shadow-xl shadow-primary/20 scale-105'
                : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600'
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
