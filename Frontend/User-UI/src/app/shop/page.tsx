"use client"

import { useEffect, useState } from "react"
import { productsApi, categoriesApi } from "@/lib/api"
import { ProductCard } from "@/components/home/ProductCard"
import { ShopHeading } from "@/components/shop/ShopHeading"
import { Search, ChevronDown, LayoutGrid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    // Fetch categories
    categoriesApi.getAll().then(res => {
      if (res.data) setCategories(res.data)
    })

    // Fetch products
    fetchProducts()
  }, [])

  const fetchProducts = (category?: string) => {
    setLoading(true)
    productsApi.getAll({ 
      categoryId: category || undefined,
      search: search || undefined,
      take: 20 
    }).then((res) => {
      if (res.data?.data) {
        setProducts(res.data.data)
      } else if (res.error) {
        console.error('Failed to fetch products:', res.error)
        setProducts([])
      }
      setLoading(false)
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProducts(selectedCategory || undefined)
  }

  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    fetchProducts(categoryId || undefined)
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Enhanced Shop Heading with Categories */}
      <ShopHeading categories={categories} selectedCategory={selectedCategory} />

      {/* Main Content */}
      <div className="py-8 md:py-12">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Credit & Advanced Filters (Optional) */}
            <aside className="w-full lg:w-72 space-y-6 flex-shrink-0 order-2 lg:order-1">
              {/* Buy on Credit Promo */}
              <div className="bg-gradient-to-br from-blue-600 to-primary p-6 md:p-8 rounded-2xl text-white relative overflow-hidden group hover:shadow-lg transition-shadow">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg md:text-xl font-black uppercase tracking-tight leading-tight">
                        Need a Payment Plan?
                      </h3>
                      <p className="text-xs md:text-sm text-blue-100 font-medium mt-2 leading-relaxed">
                        Most items available on flexible 3-12 month installments.
                      </p>
                    </div>
                    <div className="text-3xl">💳</div>
                  </div>
                  <button className="w-full h-10 bg-white text-blue-600 font-black uppercase tracking-widest text-xs rounded-lg hover:bg-blue-50 transition-colors">
                    Learn More
                  </button>
                </div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -top-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
              </div>

              {/* Shipping Info */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <span className="text-lg">🚚</span> Shipping Info
                </h4>
                <div className="space-y-3 text-xs md:text-sm">
                  <div className="flex gap-3">
                    <span className="text-lg">✓</span>
                    <span className="text-slate-600 font-medium"><span className="font-black text-slate-900">Free shipping</span> on orders above 2,000 Tk</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-lg">✓</span>
                    <span className="text-slate-600 font-medium"><span className="font-black text-slate-900">Fast delivery</span> within 24-48 hours</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-lg">✓</span>
                    <span className="text-slate-600 font-medium"><span className="font-black text-slate-900">Easy returns</span> within 7 days</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 order-1 lg:order-2 space-y-6">
              {/* Search & Sort Toolbar */}
              <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="relative w-full md:flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Search products..." 
                    className="pl-12 h-11 bg-slate-50 border-slate-200 rounded-lg font-medium text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </form>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button className="flex-1 md:flex-none h-11 px-4 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-between gap-2 text-xs font-bold text-slate-700 transition-colors">
                    <span>Sort</span> <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg">
                    <button className="h-9 w-9 rounded-md bg-white shadow-sm flex items-center justify-center text-primary hover:text-blue-700 transition-colors">
                      <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button className="h-9 w-9 rounded-md flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors">
                      <List className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] bg-white rounded-xl animate-pulse border border-slate-100" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-500">
                      Showing <span className="text-primary">{products.length}</span> products
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-white p-12 md:p-20 rounded-2xl border border-slate-200 text-center space-y-6 col-span-full">
                  <div className="h-24 w-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto">
                    <Search className="h-12 w-12 text-slate-200" />
                  </div>
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">No Products Found</h3>
                    <p className="text-slate-500 font-medium mt-2 max-w-md mx-auto">We couldn't find any products matching your search. Try adjusting your filters or browse other categories.</p>
                  </div>
                  <button 
                    className="h-12 px-8 bg-primary text-white font-black uppercase tracking-widest text-sm rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    onClick={() => {
                      setSearch("")
                      setSelectedCategory(null)
                      fetchProducts()
                    }}
                  >
                    ← Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
