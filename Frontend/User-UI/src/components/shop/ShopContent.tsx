"use client"

import { useEffect, useState } from "react"
import { productsApi, categoriesApi } from "@/lib/api"
import { ProductCard } from "@/components/home/ProductCard"
import { Search, ChevronDown, LayoutGrid, List, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useSearchParams, useRouter } from "next/navigation"

export function ShopContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  const currentCategory = searchParams.get("category")
  const currentSearch = searchParams.get("search")

  useEffect(() => {
    categoriesApi.getAll().then(res => {
      if (res.data) setCategories(res.data)
    })
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [currentCategory, currentSearch])

  const fetchProducts = () => {
    setLoading(true)
    productsApi.getAll({ 
      category: currentCategory || undefined,
      search: currentSearch || undefined,
      limit: 24 
    }).then((res) => {
      if (res.data?.products) {
        setProducts(res.data.products)
      }
      setLoading(false)
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-8 shrink-0">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-8">
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
              <Filter className="h-3 w-3" /> Categories
            </h3>
            <div className="space-y-2">
              <button 
                onClick={() => router.push("/shop")}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${!currentCategory ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => router.push(`/shop?category=${cat.id}`)}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${currentCategory === cat.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h3 className="text-xl font-black uppercase tracking-tight leading-tight">Need a Credit Plan?</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">Most items available on 3-12 months flexible payments.</p>
            <Link href="/credit">
              <Button size="sm" className="w-full h-10 font-black uppercase tracking-widest text-[10px] mt-4">Learn More</Button>
            </Link>
          </div>
          <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-primary/20 rounded-full blur-2xl" />
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 space-y-8">
        {/* Toolbar */}
        <div className="bg-white p-4 md:p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search products..." 
              className="pl-11 h-12 bg-slate-50 border-none rounded-xl font-medium"
              defaultValue={currentSearch || ""}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  router.push(`/shop?search=${(e.target as HTMLInputElement).value}${currentCategory ? `&category=${currentCategory}` : ''}`)
                }
              }}
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button className="flex-1 md:flex-none h-12 px-6 bg-slate-50 rounded-xl flex items-center justify-between gap-4 text-xs font-black uppercase tracking-widest text-slate-600">
              Sort By <ChevronDown className="h-4 w-4" />
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

        {/* Results Info */}
        {(currentCategory || currentSearch) && (
          <div className="flex items-center gap-2">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Results for:</p>
            <div className="flex flex-wrap gap-2">
              {currentCategory && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  Category: {categories.find(c => c.id === currentCategory)?.name || '...'}
                  <button onClick={() => router.push('/shop')} className="hover:text-slate-900">×</button>
                </span>
              )}
              {currentSearch && (
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  Search: {currentSearch}
                  <button onClick={() => router.push('/shop')} className="hover:text-slate-900">×</button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[3rem] border border-slate-100 text-center space-y-6">
            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Search className="h-10 w-10 text-slate-200" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">No products found</h3>
            <p className="text-slate-500 font-medium max-w-xs mx-auto">We couldn't find any products matching your current filters.</p>
            <Button 
              variant="outline" 
              className="h-12 px-8 font-black uppercase tracking-widest border-2"
              onClick={() => router.push('/shop')}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
import Link from "next/link"
