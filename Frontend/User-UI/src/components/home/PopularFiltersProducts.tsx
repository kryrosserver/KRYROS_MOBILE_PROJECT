"use client"

import { useState } from "react"
import { ProductGridSection } from "./ProductGridSection"

interface PopularFiltersProductsProps {
  section: any
}

export function PopularFiltersProducts({ section }: PopularFiltersProductsProps) {
  const filters = section.config?.filters || []
  const [activeFilter, setActiveFilter] = useState(filters.find((f: any) => f.isActive)?.label || filters[0]?.label)

  return (
    <div className="container-custom py-16">
      <h2 className="text-3xl font-black uppercase tracking-tight mb-8 text-slate-900">
        {section.title}
      </h2>

      <div className="flex flex-wrap gap-3 mb-12">
        {filters.map((filter: any, index: number) => (
          <button
            key={index}
            onClick={() => setActiveFilter(filter.label)}
            className={`px-6 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all ${
              activeFilter === filter.label
                ? 'bg-kryros-green text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <ProductGridSection 
        section={{ 
          ...section, 
          type: 'ProductGrid',
          config: { limit: section.config?.limit || 8, filter: activeFilter?.toLowerCase() }
        }} 
      />
    </div>
  )
}
