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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id}
              href={`/category/${category.slug}`}
              className="group relative aspect-[4/5] rounded-2xl md:rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 flex flex-col p-4 md:p-6 transition-all duration-500 hover:shadow-xl hover:border-primary/20"
            >
              <div className="relative flex-1 mb-4">
                <img 
                  src={resolveImageUrl(category.imageUrl)} 
                  alt={category.name}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <div className="mt-auto">
                <h3 className="font-black text-[11px] md:text-sm text-slate-900 uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-[9px] md:text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                  {category._count?.products || 0} Products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
