"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { productsApi, categoriesApi } from "@/lib/api"
import { ProductCard } from "@/components/home/ProductCard"
import { CategoryGrid } from "@/components/shop/CategoryGrid"
import { Search, ChevronDown, LayoutGrid, List, Filter, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ShopPage() {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get('category')
  
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // Fetch categories on mount
  useEffect(() => {
    categoriesApi.getAll().then(res => {
      if (res.data) setCategories(res.data)
    })
  }, [])

  // Re-fetch products when category or search changes
  useEffect(() => {
    const category = categorySlug ? categories.find(c => c.slug === categorySlug)?.id : null
    setSelectedCategory(category || null)
    fetchProducts(category || undefined)
  }, [categorySlug, categories])

  const fetchProducts = (categoryId?: string) => {
    setLoading(true)
    productsApi.getAll({ 
      categoryId: categoryId || undefined,
      search: search || undefined,
      take: 40,
      showInactive: true // Show all products from admin panel to help debug
    }).then((res) => {
      if (res.data?.data) {
        setProducts(res.data.data)
      } else if (res.error) {
        console.error('Failed to fetch products:', res.error)
        setProducts([])
      }
      setLoading(false)
    }).catch(err => {
      console.error('Fetch error:', err)
      setProducts([])
      setLoading(false)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts(selectedCategory || undefined)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Page Heading Section - Clean white background */}
      <div className="bg-white pt-16 pb-8">
        <div className="container-custom">
          {/* Main Title - ALL PRODUCTS (Centered, clean) */}
          <h1 className="text-center text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-16">
            {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "All Products"}
          </h1>

          {/* Category Cards Grid - Horizontal scroll exactly like image */}
          <div className="mb-16">
            <Suspense fallback={<div className="h-40 bg-slate-50 animate-pulse rounded-2xl" />}>
              <CategoryGrid categories={categories} />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Filters & Products Section */}
      <div className="pb-12">
        <div className="container-custom">
          {/* Fast Filters Section */}
          <div className="space-y-4 mb-8">
            <h3 className="text-[15px] font-bold text-slate-700">Fast Filters:</h3>
            <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {/* Featured */}
              <button className="flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 hover:border-blue-400 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                <span className="text-yellow-400 text-sm">⭐</span> FEATURED
              </button>

              {/* Best Sellers */}
              <button className="flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 hover:border-blue-400 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                <span className="text-orange-500 text-sm">🔥</span> BEST SELLERS
              </button>

              {/* Top Rated */}
              <button className="flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 hover:border-blue-400 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                <span className="text-pink-400 text-sm">👍</span> TOP RATED
              </button>

              {/* Select Color */}
              <button className="flex-shrink-0 px-6 py-2.5 bg-white border border-slate-200 hover:border-blue-400 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                SELECT COLOR
              </button>

              {/* Select Storage */}
              <button className="flex-shrink-0 px-6 py-2.5 bg-white border border-slate-200 hover:border-blue-400 rounded-full text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                SELECT STORAGE
              </button>
            </div>
          </div>

          {/* Toolbar Row: Filter, Sorting, Search Icon */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8">
            <div className="flex items-center gap-8">
              {/* Filter Button - Exactly like image */}
              <button className="h-11 px-6 bg-[#ebf2ff] border border-[#3b82f6]/30 text-[#3b82f6] rounded-lg font-bold flex items-center gap-3 hover:bg-[#dfe9ff] transition-colors">
                <span className="text-base">Filter</span>
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              
              {/* Sorting - Just text and chevron */}
              <div className="flex items-center gap-2 cursor-pointer group">
                <span className="text-[15px] font-medium text-slate-600 group-hover:text-slate-900">Default sorting</span>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
              </div>
            </div>

            {/* Search Icon on the right */}
            <button className="p-2 text-slate-700 hover:text-blue-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Products Grid - Keeping your original ProductCard usage */}
          <div className="pt-4">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-slate-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 mb-6">
                  <Search className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No Products Found</h3>
                <p className="text-slate-500 mb-8">Try adjusting your filters or search terms.</p>
                <Button 
                  onClick={() => {
                    setSearch("")
                    window.location.href = "/shop"
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
