"use client"

import { useEffect, useState } from "react"
import { categoriesApi } from "@/lib/api"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { resolveImageUrl } from "@/lib/utils"

export function CategoriesGrid({ section }: { section?: any }) {
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
    <section className="py-6 md:py-12 bg-white">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-10">
          <div>
            <h2 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tight leading-none">
              {section.title || "Shop By Category"}
            </h2>
            {section.subtitle && <p className="text-slate-500 mt-1 text-xs md:text-sm font-medium">{section.subtitle}</p>}
          </div>
          <Link 
            href="/categories" 
            className="text-primary font-black uppercase tracking-widest text-[9px] md:text-[11px] flex items-center gap-2 group"
          >
            View All <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex overflow-x-auto pb-6 gap-3 md:gap-6 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          {categories.map((category) => (
            <Link 
              key={category.id}
              href={`/category/${category.slug}`}
              className="min-w-[140px] w-[140px] md:min-w-[220px] md:w-[220px] snap-start group relative aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden bg-slate-900 flex flex-col transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img 
                  src={resolveImageUrl(category.imageUrl)} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
              </div>

              {/* Content Overlay */}
              <div className="relative mt-auto p-4 md:p-6 z-10">
                <h3 className="font-black text-xs md:text-base text-white uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="h-0.5 w-4 bg-primary rounded-full" />
                  <p className="text-[8px] md:text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                    {category._count?.products || 0} Items
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
