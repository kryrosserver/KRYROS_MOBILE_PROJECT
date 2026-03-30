"use client"

import { useEffect, useState } from "react"
import { productsApi } from "@/lib/api"
import { ProductCard } from "@/components/home/ProductCard"

export default function WholesalePage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch wholesale products
    productsApi.getAll({ isWholesaleOnly: true, limit: 12 }).then((res) => {
      if (res.data?.products) {
        setProducts(res.data.products)
      }
      setLoading(false)
    })
  }, [])

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="container-custom">
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">Wholesale Deals</h1>
          <div className="h-2 w-20 bg-primary rounded-full mt-4"></div>
          <p className="mt-6 text-slate-500 font-medium max-w-2xl">
            Special bulk pricing for our business partners and retailers. Minimum order quantities apply.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white rounded-xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
