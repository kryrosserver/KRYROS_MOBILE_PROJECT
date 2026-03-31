"use client"

import { useEffect, useState } from "react"
import { categoriesApi } from "@/lib/api"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

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
    <section className="py-24">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight leading-tight">
              Shop by <span className="text-primary">Category</span>
            </h2>
            <p className="mt-4 text-slate-500 font-medium">Explore our wide range of premium mobile tech organized for you.</p>
          </div>
          <Link href="/shop" className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 group hover:underline">
            View All Categories <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/shop?category=${category.id}`}
              className="group relative aspect-square bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center p-8 hover:border-primary/20 hover:shadow-md transition-all overflow-hidden"
            >
              <div className="relative z-10 text-center space-y-4">
                <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto group-hover:bg-primary group-hover:text-white transition-colors">
                  {category.icon ? (
                    <img src={category.icon} alt={category.name} className="h-8 w-8 object-contain" />
                  ) : (
                    <span className="text-xl font-black">{category.name[0]}</span>
                  )}
                </div>
                <h3 className="text-xs font-black uppercase tracking-tight text-slate-900 group-hover:text-primary transition-colors">{category.name}</h3>
              </div>
              {/* Decoration */}
              <div className="absolute -bottom-4 -right-4 h-12 w-12 bg-slate-50 rounded-full group-hover:bg-primary/5 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
