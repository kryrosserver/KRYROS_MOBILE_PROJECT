"use client"

import { useEffect, useState } from "react"
import { productsApi } from "@/lib/api"
import { ProductCard } from "@/components/home/ProductCard"
import { CMSection } from "@/types"

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    productsApi.getAll({ limit: 8 }).then((res) => {
      if (res.data?.products) {
        setProducts(res.data.products)
      }
      setLoading(false)
    })
  }, [])

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section Placeholder */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="container-custom">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight uppercase tracking-tight">
              Premium <span className="text-primary">Mobile</span> Technology
            </h1>
            <p className="mt-6 text-lg text-slate-500 font-medium">
              Discover the latest in mobile innovation with flexible payment plans and wholesale opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products Grid - (Matches Client Request: 2 columns on mobile) */}
      <section className="py-12 md:py-20">
        <div className="container-custom">
          <div className="flex items-center justify-between mb-8 md:mb-12">
            <div>
              <h2 className="text-xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Featured Products</h2>
              <div className="h-1.5 w-12 bg-primary rounded-full mt-2"></div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/5] bg-white rounded-xl animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {products.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
