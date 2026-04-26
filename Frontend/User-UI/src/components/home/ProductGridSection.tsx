"use client"

import React, { useEffect, useState, useRef } from "react"
import { productsApi } from "@/lib/api"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { ProductCard } from "./ProductCard"

interface ProductGridSectionProps {
  section: any
}

export function ProductGridSection({ section }: ProductGridSectionProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const config = section.config || {}
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    productsApi.getAll({
      take: config.limit || 8,
      featured: config.filter === 'featured' ? true : undefined,
      popularity: config.popularity,
      categorySlug: section.type === 'FeaturedCategory' ? config.categorySlug : undefined,
    }).then(res => {
      if (res.data?.data) {
        setProducts(res.data.data)
      }
      setLoading(false)
    })
  }, [config.limit, config.filter, config.popularity, config.categorySlug, section.type])

  if (loading) {
    return (
      <div className="container-custom py-4 md:py-8">
        <div className="h-8 w-48 bg-slate-100 animate-pulse rounded-lg mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="aspect-[3/4] bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  // If this is called from PopularTagsProducts, it might not need its own title/header
  const isSubSection = section.type === 'ProductGrid' && !section.title;

  return (
    <section className={isSubSection ? "" : "py-4 md:py-8"}>
      <div className={isSubSection ? "" : "container-custom"}>
        {!isSubSection && (
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <div>
              <h2 className="text-lg md:text-3xl font-black text-slate-900 uppercase tracking-tight">
                {section.title || "Featured Products"}
              </h2>
              {section.subtitle && <p className="text-slate-500 mt-1 text-xs md:text-sm">{section.subtitle}</p>}
            </div>
            <Link 
              href={config.filter === 'featured' ? '/featured' : section.link || '/shop'} 
              className="text-primary font-black uppercase tracking-widest text-[9px] md:text-[11px] flex items-center gap-2 group"
            >
              View All <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        <div 
          ref={scrollRef}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6"
        >
          {products.map((product) => (
            <div key={product.id} className="flex flex-col h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
