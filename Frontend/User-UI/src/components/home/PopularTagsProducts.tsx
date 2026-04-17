"use client"

import { useState } from "react"
import { ProductGridSection } from "./ProductGridSection"

interface PopularTagsProductsProps {
  section: any
}

export function PopularTagsProducts({ section }: PopularTagsProductsProps) {
  const tags = section.config?.tags || []
  const [activeTag, setActiveTag] = useState(tags.find((t: any) => t.isActive)?.label || tags[0]?.label)

  return (
    <div className="container-custom py-16">
      <div className="mb-12">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-2 text-slate-900">
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="text-lg text-slate-600">{section.subtitle}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 mb-12">
        {tags.map((tag: any, index: number) => (
          <button
            key={index}
            onClick={() => setActiveTag(tag.label)}
            className={`px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all ${
              activeTag === tag.label
                ? 'bg-kryros-dark text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
          config: { limit: section.config?.limit || 10, filter: activeTag?.toLowerCase() }
        }} 
      />
    </div>
  )
}
