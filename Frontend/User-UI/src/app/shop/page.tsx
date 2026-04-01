"use client"

import { useEffect, useState, Suspense } from "react"
import { productsApi, categoriesApi } from "@/lib/api"
import { ProductCard } from "@/components/home/ProductCard"
import { CategoryGrid } from "@/components/shop/CategoryGrid"
import { Search, ChevronDown, LayoutGrid, List, Filter } from "lucide-react"
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
      {/* Page Heading Section - Enhanced UI/UX */}
      <div className="bg-gradient-to-b from-white via-white to-slate-50/50 border-b border-slate-200">
        <div className="container-custom space-y-8 py-8 md:py-14">
          {/* Main Title - CENTERED */}
          <div className="text-center space-y-4">
            <div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 uppercase tracking-tighter">
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "Shop"}
              </h1>
              <div className="h-2 w-32 bg-primary mx-auto rounded-full mt-4"></div>
            </div>
          </div>

          {/* Subtitle - CENTERED */}
          <p className="text-center text-slate-600 font-medium text-sm md:text-base max-w-2xl mx-auto">
            {selectedCategory
              ? `Explore our premium collection. Find the perfect product that meets your needs with our expertly curated selection.`
              : "Discover our complete collection of premium electronics and devices. Browse by category to find exactly what you're looking for."}
          </p>

          {/* Category Grid */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary"></div>
              <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-500">
                Browse by Category
              </h2>
            </div>
            <div className="py-4">
              <Suspense fallback={null}>
                <CategoryGrid categories={categories} />
              </Suspense>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Left: Fast Filters */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400 inline-flex items-center whitespace-nowrap">
                  <Filter className="h-3 w-3 mr-2" /> Quick Filter:
                </span>

                {/* Featured */}
                <button className="group flex items-center gap-2 px-3 md:px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:shadow-md">
                  <span className="group-hover:scale-110 transition-transform">◆</span>
                  <span className="hidden sm:inline">Featured</span>
                </button>

                {/* Best Sellers */}
                <button className="group flex items-center gap-2 px-3 md:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:shadow-md">
                  <span className="group-hover:scale-110 transition-transform">🔥</span>
                  <span className="hidden sm:inline">Best Sellers</span>
                </button>

                {/* Top Rated */}
                <button className="group flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:shadow-md">
                  <span className="group-hover:scale-110 transition-transform">⭐</span>
                  <span className="hidden sm:inline">Top Rated</span>
                </button>
              </div>

              {/* Right: View Toggle */}
              <div className="hidden lg:flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
                <button className="h-9 px-3 rounded-lg bg-white shadow-sm text-slate-700 hover:text-primary flex items-center justify-center transition-colors">
                  <span className="text-xs font-bold">≡≡</span>
                </button>
                <button className="h-9 px-3 rounded-lg text-slate-500 hover:text-primary flex items-center justify-center transition-colors">
                  <span className="text-xs font-bold">⊞⊞</span>
                </button>
              </div>
            </div>

            {/* Secondary Filters */}
            <div className="flex flex-wrap gap-2 items-stretch">
              <button className="flex-1 sm:flex-none h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <span>🎨</span>
                <span className="hidden xs:inline">Color</span>
              </button>
              <button className="flex-1 sm:flex-none h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <span>💾</span>
                <span className="hidden xs:inline">Storage</span>
              </button>
              <button className="flex-1 sm:flex-none h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <span>🔍</span>
                <span className="hidden xs:inline">More</span>
              </button>
              <button className="flex-1 sm:flex-none h-10 px-4 bg-white border-2 border-slate-300 hover:border-primary text-slate-700 hover:text-primary rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 md:ml-auto">
                <Filter className="h-3 w-3" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - NO SIDEBAR */}
      <div className="py-8 md:py-12">
        <div className="container-custom">
          {/* Payment Plan & Shipping - TOP SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Buy on Credit Promo */}
            <div className="bg-gradient-to-br from-blue-600 to-primary p-6 rounded-2xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black uppercase">Need a Payment Plan?</h3>
                  <p className="text-sm text-blue-100 mt-1">Most items available on flexible 3-12 month installments.</p>
                </div>
                <div className="text-3xl">💳</div>
              </div>
              <button className="w-full h-10 mt-4 bg-white text-blue-600 font-black uppercase text-xs rounded-lg">Learn More</button>
            </div>

            {/* Shipping Info */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><div className="text-2xl">🚚</div><p className="text-xs font-bold">Free shipping on orders above 2,000 Tk</p></div>
                <div><div className="text-2xl">⚡</div><p className="text-xs font-bold">Fast delivery 24-48 hours</p></div>
                <div><div className="text-2xl">↩️</div><p className="text-xs font-bold">Easy returns within 7 days</p></div>
              </div>
            </div>
          </div>

          {/* Products - FULL WIDTH */}
          <div>
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
