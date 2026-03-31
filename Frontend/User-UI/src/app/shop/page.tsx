"use client"

import { useEffect, useState } from "react"
import { productsApi, categoriesApi } from "@/lib/api"
import { ProductCard } from "@/components/home/ProductCard"
import { Search, Filter, ChevronDown, LayoutGrid, List } from "lucide-react"
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
      category: category || undefined,
      search: search || undefined,
      limit: 20 
    }).then((res) => {
      if (res.data?.products) {
        setProducts(res.data.products)
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
    <main className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar / Filters */}
          <aside className="w-full md:w-64 space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Categories</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleCategorySelect(null)}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${!selectedCategory ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button 
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedCategory === cat.id ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-50'}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10">
              <h3 className="text-sm font-black text-primary uppercase tracking-tight mb-2">Buy on Credit</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Most products are available with flexible 3-12 month payment plans.
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 space-y-8">
            {/* Toolbar */}
            <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <form onSubmit={handleSearch} className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder="Search products..." 
                  className="pl-11 h-12 bg-slate-50 border-none rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </form>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <button className="flex-1 md:flex-none h-12 px-4 bg-slate-50 rounded-xl flex items-center justify-between gap-4 text-sm font-bold text-slate-600">
                  Sort By: Default <ChevronDown className="h-4 w-4" />
                </button>
                <div className="hidden md:flex items-center bg-slate-50 p-1 rounded-xl">
                  <button className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-primary">
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button className="h-10 w-10 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600">
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-white rounded-3xl animate-pulse border border-slate-100" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                  <Search className="h-8 w-8 text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">No products found</h3>
                <p className="text-slate-500 font-medium mt-2">Try adjusting your search or category filters.</p>
                <Button 
                  variant="outline" 
                  className="mt-8 font-black uppercase tracking-widest"
                  onClick={() => {
                    setSearch("")
                    setSelectedCategory(null)
                    fetchProducts()
                  }}
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
