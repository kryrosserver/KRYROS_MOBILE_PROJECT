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
      <div className="container-custom py-12 md:py-24">
        <div className="h-10 w-48 bg-slate-100 animate-pulse rounded-lg mb-8" />
        <div className="flex md:grid md:grid-cols-4 gap-6 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[280px] md:min-w-0 flex-shrink-0 aspect-[3/4] bg-slate-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  // If this is called from PopularTagsProducts, it might not need its own title/header
  const isSubSection = section.type === 'ProductGrid' && !section.title;

  return (
    <section className={isSubSection ? "" : "py-12 md:py-24"}>
      <div className={isSubSection ? "" : "container-custom"}>
        {!isSubSection && (
          <div className="flex items-center justify-between mb-8 md:mb-16">
            <div>
              <h2 className="text-xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">
                {section.title || "Featured Products"}
              </h2>
              {section.subtitle && <p className="text-slate-500 mt-2">{section.subtitle}</p>}
            </div>
            <Link 
              href={config.filter === 'featured' ? '/featured' : section.link || '/shop'} 
              className="text-primary font-black uppercase tracking-widest text-[10px] md:text-sm flex items-center gap-2 group"
            >
              View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        )}

        <div 
          ref={scrollRef}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 overflow-x-auto md:overflow-x-visible -mx-5 px-5 pb-8 md:mx-0 md:px-0 scroll-smooth snap-x snap-mandatory scrollbar-hide items-stretch"
        >
          {products.map((product) => (
            <div key={product.id} className="w-[75vw] max-w-[300px] md:w-auto md:max-w-none flex-shrink-0 snap-start flex flex-col">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
