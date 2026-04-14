"use client"

import React, { useEffect, useState } from "react"
import { productsApi } from "@/lib/api"
import { ArrowRight, ShoppingCart, Heart, Eye } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { resolveImageUrl } from "@/lib/utils"
import { useCurrency } from "@/providers/CurrencyProvider"

interface ProductGridSectionProps {
  section: any
}

export function ProductGridSection({ section }: ProductGridSectionProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const config = section.config || {}
  const { convertPrice } = useCurrency()

  useEffect(() => {
    setLoading(true)
    productsApi.getAll({
      take: config.limit || 8,
      featured: config.filter === 'featured' ? true : undefined,
      categorySlug: section.type === 'FeaturedCategory' ? config.categorySlug : undefined,
    }).then(res => {
      if (res.data?.data) {
        setProducts(res.data.data)
      }
      setLoading(false)
    })
  }, [config.limit, config.filter, config.categorySlug, section.type])

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

  return (
    <section className="py-12 md:py-24">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8 md:mb-16">
          <div>
            <h2 className="text-xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">
              {section.title || "Featured Products"}
            </h2>
            {section.subtitle && <p className="text-slate-500 mt-2">{section.subtitle}</p>}
          </div>
          <Link href="/shop" className="text-primary font-black uppercase tracking-widest text-[10px] md:text-sm flex items-center gap-2 group">
            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex md:grid md:grid-cols-4 gap-4 md:gap-8 overflow-x-auto md:overflow-x-visible -mx-5 px-5 pb-6 md:mx-0 md:px-0 scroll-smooth snap-x snap-mandatory scrollbar-hide">
          {products.map((product) => (
            <div key={product.id} className="group relative min-w-[280px] md:min-w-0 flex-shrink-0 snap-start bg-white rounded-[2rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
              <div className="aspect-square relative overflow-hidden bg-slate-50">
                <img 
                  src={resolveImageUrl(product.images?.[0]?.url)} 
                  alt={product.name}
                  className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
                  <button className="h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                    <Heart className="h-5 w-5" />
                  </button>
                  <button className="h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <Link href={`/product/${product.slug}`} className="block">
                    <h3 className="font-bold text-slate-900 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-black text-primary">
                    {convertPrice(parseFloat(product.price)).formatted}
                  </span>
                  <Button size="icon" className="h-10 w-10 rounded-xl bg-slate-900 hover:bg-primary transition-colors">
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
