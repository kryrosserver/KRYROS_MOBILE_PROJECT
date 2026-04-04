"use client"

import { useEffect, useState } from "react"
import { categoriesApi } from "@/lib/api"
import Link from "next/link"

export function BrandNav() {
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Assuming brands are categories or have a separate endpoint
    // For now, let's use a subset of categories or static brands common to mobile
    const mockBrands = [
      { id: "apple", name: "Apple", logo: "/brands/apple.svg" },
      { id: "samsung", name: "Samsung", logo: "/brands/samsung.svg" },
      { id: "huawei", name: "Huawei", logo: "/brands/huawei.svg" },
      { id: "xiaomi", name: "Xiaomi", logo: "/brands/xiaomi.svg" },
      { id: "oppo", name: "Oppo", logo: "/brands/oppo.svg" },
      { id: "vivo", name: "Vivo", logo: "/brands/vivo.svg" }
    ]
    setBrands(mockBrands)
    setLoading(false)
  }, [])

  if (loading) return null

  return (
    <div className="bg-white border-b border-slate-100 overflow-x-auto scrollbar-hide no-scrollbar sticky top-[72px] lg:top-[80px] z-40">
      <div className="px-4 py-4 flex items-center gap-3 min-w-max md:justify-center">
        {brands.map((brand) => (
          <Link 
            key={brand.id} 
            href={`/shop?search=${brand.name}`}
            className="group flex items-center justify-center px-6 py-2.5 rounded-xl border-2 border-slate-100 bg-white text-[11px] font-black uppercase tracking-widest text-slate-500 hover:border-kryros-green hover:text-kryros-green hover:bg-kryros-green/5 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
