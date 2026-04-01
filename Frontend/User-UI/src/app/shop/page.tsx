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
      <div className="bg-white border-b border-slate-200">
        <div className="container-custom space-y-8 py-8 md:py-14">
          {/* Main Title */}
          <div className="space-y-4">
            <div>
              <h1 className="text-center text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "Shop"}
              </h1>
              <div className="h-2 w-32 bg-primary mx-auto rounded-full mt-4"></div>
            </div>
          </div>

          

          {/* Category Grid - CENTERED */}
          <div className="space-y-4 text-center">
            
            <div className="py-4">
              <Suspense fallback={null}>
                <CategoryGrid categories={categories} />
              </Suspense>
            </div>
          </div>

          
            
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="py-6">
        <div className="relative max-w-md mx-auto">
          <input type="text" placeholder="Search for products..." className="w-full px-4 py-3 pl-12 border border-slate-300 rounded-lg" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8 md:py-12">
        <div className="container-custom">
          

          {/* Products */}
          <div>
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
    </main>
  )
}
