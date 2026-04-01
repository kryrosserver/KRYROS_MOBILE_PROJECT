"use client"

import { useEffect, useState } from "react"
import { categoriesApi } from "@/lib/api"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { resolveImageUrl } from "@/lib/utils"

export function CategoriesGrid() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    categoriesApi.getAll().then((res) => {
      if (res.data) {
        setCategories(res.data.slice(0, 6))
      }
      setLoading(false)
    })
  }, [])

  if (loading) return null

  return (
    <section className="py-8 md:py-24">
      <div className="container-custom">
        <div className="flex items-center justify-between gap-4 mb-6 md:mb-16">
          <div>
            <h2 className="text-xl md:text-5xl font-black text-slate-900 uppercase tracking-tight leading-tight">
              Featured <span className="text-primary">Categories</span>
            </h2>
          </div>
          <Link href="/shop" className="text-[10px] md:text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 group hover:underline">
            View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Mobile Horizontal Scroll Carousel */}
        <div className="md:hidden -mx-5 flex overflow-x-auto gap-3 px-5 pb-4 scroll-smooth snap-x snap-mandatory scrollbar-hide">
          {categories.map((category, idx) => {
            // Assign different gradients/labels based on index or category name
            const designs = [
              { label: "Featured", gradient: "from-blue-600 to-blue-400" },
              { label: "Limited", gradient: "from-slate-800 to-slate-600" },
              { label: "New Arrival", gradient: "from-indigo-700 to-indigo-500" },
              { label: "Trending", gradient: "from-orange-600 to-orange-400" },
              { label: "Premium", gradient: "from-slate-900 to-slate-700" }
            ];
            const design = designs[idx % designs.length];

            return (
              <Link 
                key={category.id} 
                href={`/shop?category=${category.id}`}
                className={`min-w-[280px] h-[180px] flex-shrink-0 relative overflow-hidden rounded-[1.5rem] p-8 snap-start shadow-xl shadow-slate-200/50 bg-gradient-to-br ${design.gradient} text-white group`}
              >
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-80">{design.label}</span>
                    <h3 className="text-2xl font-black uppercase tracking-tight leading-none">{category.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                    Browse Now <ArrowRight className="h-3 w-3" />
                  </div>
                </div>
                {/* Category Icon/Image Backdrop */}
                <div className="absolute right-0 bottom-0 w-32 h-32 opacity-20 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                  {category.image || category.icon ? (
                    <img 
                      src={resolveImageUrl(category.image || category.icon)} 
                      alt={category.name} 
                      className="w-full h-full object-contain translate-x-4 translate-y-4" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl font-black">
                      {category.name[0]}
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Desktop Grid Layout */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-6 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/shop?category=${category.id}`}
              className="group relative aspect-square bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center p-10 hover:border-primary/20 hover:shadow-xl transition-all overflow-hidden"
            >
              <div className="relative z-10 text-center space-y-6">
                <div className="h-20 w-20 md:h-24 md:w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-white transition-all overflow-hidden shadow-inner">
                  {category.image || category.icon ? (
                    <img 
                      src={resolveImageUrl(category.image || category.icon)} 
                      alt={category.name} 
                      className="h-full w-full object-contain p-4 group-hover:scale-110 transition-transform" 
                    />
                  ) : (
                    <span className="text-2xl font-black">{category.name[0]}</span>
                  )}
                </div>
                <h3 className="text-xs md:text-sm font-black uppercase tracking-tight text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{category.name}</h3>
              </div>
              <div className="absolute -bottom-4 -right-4 h-12 w-12 bg-slate-50 rounded-full group-hover:bg-primary/5 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
