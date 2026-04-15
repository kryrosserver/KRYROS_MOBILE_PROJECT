"use client"

import React, { useEffect, useState, useRef } from "react"
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
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-slide effect for mobile
  useEffect(() => {
    if (products.length <= 1) return;

    const interval = setInterval(() => {
      if (scrollRef.current && window.innerWidth < 768) {
        const container = scrollRef.current;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        if (container.scrollLeft >= maxScroll - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: 300, behavior: 'smooth' });
        }
      }
    }, 5000); // 5 seconds for featured products

    return () => clearInterval(interval);
  }, [products.length]);

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
          <Link 
            href={config.filter === 'featured' ? '/featured' : section.link || '/shop'} 
            className="text-primary font-black uppercase tracking-widest text-[10px] md:text-sm flex items-center gap-2 group"
          >
            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div 
          ref={scrollRef}
          className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 overflow-x-auto md:overflow-x-visible -mx-5 px-5 pb-8 md:mx-0 md:px-0 scroll-smooth snap-x snap-mandatory scrollbar-hide items-stretch"
        >
          {products.map((product) => (
            <div key={product.id} className="group relative w-[75vw] max-w-[300px] md:w-auto md:max-w-none flex-shrink-0 snap-start bg-white rounded-3xl border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-500 flex flex-col">
              <div className="aspect-square relative overflow-hidden bg-slate-50/30">
                <img 
                  src={resolveImageUrl(product.images?.[0]?.url)} 
                  alt={product.name}
                  className="w-full h-full object-contain p-4 md:p-8 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
                  <button className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                    <Heart className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                  <button className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-400 hover:text-primary transition-colors">
                    <Eye className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 md:p-6 space-y-3 md:space-y-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start">
                  <Link href={`/product/${product.slug}`} className="block">
                    <h3 className="font-bold text-slate-900 text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors leading-tight h-10 md:h-12">{product.name}</h3>
                  </Link>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
                  <span className="text-lg md:text-xl font-black text-primary">
                    {convertPrice(parseFloat(product.price)).formatted}
                  </span>
                  <Button size="icon" className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-slate-900 hover:bg-primary transition-colors shadow-lg shadow-slate-900/10">
                    <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-white" />
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
