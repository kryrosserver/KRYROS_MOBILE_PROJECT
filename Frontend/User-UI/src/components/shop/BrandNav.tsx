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
    <div className="bg-white border-b border-slate-100 overflow-x-auto scrollbar-none sticky top-[72px] z-40">
      <div className="container-custom py-4 flex items-center justify-center gap-12 min-w-max">
        {brands.map((brand) => (
          <Link 
            key={brand.id} 
            href={`/shop?search=${brand.name}`}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors px-2"
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
