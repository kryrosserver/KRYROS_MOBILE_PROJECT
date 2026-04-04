"use client"

import { useEffect, useState, Suspense, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { productsApi, categoriesApi, brandsApi } from "@/lib/api"
import { ProductCard } from "@/components/home/ProductCard"
import { CategoryGrid } from "@/components/shop/CategoryGrid"
import { Search, ChevronDown, LayoutGrid, List, Filter, SlidersHorizontal, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { resolveImageUrl } from "@/lib/utils"

function ShopContent() {
  const searchParams = useSearchParams()
  const categorySlug = searchParams.get('category')
  
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showSearchInput, setShowSearchInput] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Fetch categories and brands on mount
  useEffect(() => {
    Promise.all([
      categoriesApi.getAll(),
      brandsApi.getAll()
    ]).then(([catRes, brandRes]) => {
      if (catRes.data) {
        setCategories(catRes.data as any[])
      }
      if (brandRes.data) {
        setBrands(brandRes.data as any[])
      }
    })
  }, [])

  // Handle search parameter from mobile bottom nav
  useEffect(() => {
    if (searchParams.get('search') === 'true') {
      setShowSearchInput(true)
      setTimeout(() => searchInputRef.current?.focus(), 100)
    }
  }, [searchParams])

  const scrollToBrand = (brandSlug: string) => {
    const element = document.getElementById(`brand-${brandSlug}`)
    if (element) {
      const headerOffset = window.innerWidth < 768 ? 130 : 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerOffset
      window.scrollTo({ top: offsetPosition, behavior: "smooth" })
    }
  }

  // Group products by brand if needed, or just filter
  const groupedProducts = brands.map(brand => ({
    ...brand,
    products: products.filter(p => p.brandId === brand.id)
  })).filter(b => b.products.length > 0)

  const otherProducts = products.filter(p => !p.brandId || !brands.find(b => b.id === p.brandId))

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
      isWholesaleOnly: false,
      allowCredit: false,
      showInactive: false
    }).then((res) => {
      // Handle different possible response structures for robustness
      if (res.data) {
        const productList = (res.data as any).data || (Array.isArray(res.data) ? res.data : null);
        if (productList) {
          setProducts(productList)
        } else {
          console.warn('Could not find product list in API response:', res.data)
          setProducts([])
        }
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
    <main className="min-h-screen bg-white pb-24">
      {/* Page Heading Section - Clean white background */}
      <div className="bg-white pt-24 md:pt-32 pb-8">
        <div className="container-custom">
          {/* Main Title - ALL PRODUCTS (Centered, clean) */}
          <h1 className="text-center text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight mb-12">
            {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : "All Products"}
          </h1>

          {/* Category Cards Grid - Horizontal scroll exactly like image */}
          <div className="mb-8">
            <Suspense fallback={<div className="h-40 bg-slate-50 animate-pulse rounded-2xl" />}>
              <CategoryGrid categories={categories} />
            </Suspense>
          </div>

          {/* Brand Quick Links - Updated to Brand Teal (#1FA89A) */}
          {brands.length > 0 && (
            <div className="mb-12">
              <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => scrollToBrand(brand.slug)}
                    className="flex-shrink-0 min-w-[120px] h-14 bg-white border-2 border-[#1FA89A]/30 rounded-lg flex items-center justify-center px-4 hover:bg-[#1FA89A]/5 hover:border-[#1FA89A] transition-all shadow-sm group"
                  >
                    {brand.logo ? (
                      <img 
                        src={resolveImageUrl(brand.logo)} 
                        alt={brand.name} 
                        className="h-8 object-contain group-hover:scale-110 transition-transform" 
                      />
                    ) : (
                      <span className="text-xs font-black text-[#1FA89A] uppercase tracking-widest">{brand.name}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filters & Products Section */}
      <div className="pb-12">
        <div className="container-custom">
          {/* Fast Filters Section - Updated to Teal */}
          <div className="space-y-4 mb-8">
            <h3 className="text-[15px] font-bold text-slate-700">Fast Filters:</h3>
            <div className="flex overflow-x-auto pb-4 gap-3 scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
              {/* Featured */}
              <button className="flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 hover:border-[#1FA89A] hover:text-[#1FA89A] rounded-full text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                <span className="text-yellow-400 text-sm">⭐</span> FEATURED
              </button>

              {/* Best Sellers */}
              <button className="flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 hover:border-[#1FA89A] hover:text-[#1FA89A] rounded-full text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                <span className="text-orange-500 text-sm">🔥</span> BEST SELLERS
              </button>

              {/* Top Rated */}
              <button className="flex-shrink-0 flex items-center gap-2.5 px-5 py-2.5 bg-white border border-slate-200 hover:border-[#1FA89A] hover:text-[#1FA89A] rounded-full text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                <span className="text-pink-400 text-sm">👍</span> TOP RATED
              </button>

              {/* Select Color */}
              <button className="flex-shrink-0 px-6 py-2.5 bg-white border border-slate-200 hover:border-[#1FA89A] hover:text-[#1FA89A] rounded-full text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                SELECT COLOR
              </button>

              {/* Select Storage */}
              <button className="flex-shrink-0 px-6 py-2.5 bg-white border border-slate-200 hover:border-[#1FA89A] hover:text-[#1FA89A] rounded-full text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all shadow-sm">
                SELECT STORAGE
              </button>
            </div>
          </div>

          {/* Toolbar Row: Filter, Sorting, Search Icon */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8 gap-4">
            <div className={`flex items-center gap-8 transition-all duration-300 ${showSearchInput ? 'opacity-0 invisible w-0 overflow-hidden' : 'opacity-100 visible'}`}>
              {/* Filter Button - Updated to Teal */}
              <button className="h-11 px-6 bg-[#1FA89A]/10 border border-[#1FA89A]/30 text-[#1FA89A] rounded-lg font-bold flex items-center gap-3 hover:bg-[#1FA89A]/20 transition-colors">
                <span className="text-base">Filter</span>
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              
              {/* Sorting - Just text and chevron */}
              <div className="hidden sm:flex items-center gap-2 cursor-pointer group">
                <span className="text-[15px] font-medium text-slate-600 group-hover:text-slate-900">Default sorting</span>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600" />
              </div>
            </div>

            {/* Search Input Area */}
            <div className={`flex-1 flex items-center gap-2 transition-all duration-300 ${showSearchInput ? 'opacity-100 visible' : 'hidden'}`}>
              <form onSubmit={handleSearch} className="flex-1 relative">
                <Input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 w-full bg-slate-50 border-slate-200 rounded-lg pl-10 pr-4 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </form>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setShowSearchInput(false)
                  setSearch("")
                  fetchProducts(selectedCategory || undefined)
                }}
                className="text-slate-500 font-bold text-xs uppercase tracking-widest"
              >
                Cancel
              </Button>
            </div>

            {/* Search Icon on the right */}
            <button 
              onClick={() => {
                setShowSearchInput(true)
                setTimeout(() => searchInputRef.current?.focus(), 100)
              }}
              className={`p-2 text-slate-700 hover:text-blue-600 transition-colors ${showSearchInput ? 'hidden' : 'block'}`}
            >
              <Search className="h-5 w-5" />
            </button>
          </div>

          {/* Products Grid */}
          <div className="pt-2">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-slate-50 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="space-y-16">
                {/* Brand Grouped Sections */}
                {groupedProducts.map((brand: any) => (
                  <section key={brand.id} id={`brand-${brand.slug}`} className="scroll-mt-24 animate-in fade-in duration-700">
                    <div className="flex items-center justify-between mb-8 border-l-4 border-primary pl-4 bg-slate-50/50 py-3 pr-4 rounded-r-xl">
                      <div className="flex items-center gap-4">
                        {brand.logo ? (
                          <div className="bg-white p-1.5 rounded-lg border border-slate-100 shadow-sm">
                            <img src={resolveImageUrl(brand.logo)} alt={brand.name} className="h-6 md:h-8 object-contain" />
                          </div>
                        ) : (
                          <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900">{brand.name}</h2>
                        )}
                        <span className="bg-primary/10 text-[10px] font-black px-2.5 py-1 rounded-full text-primary uppercase tracking-widest">
                          {brand.products.length} Items
                        </span>
                      </div>
                      <Link href={`/shop?brand=${brand.slug}`} className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 hover:gap-2.5 transition-all bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
                        Explore <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                      {brand.products.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                ))}

                {/* Other Products Section */}
                {otherProducts.length > 0 && (
                  <section className="animate-in fade-in duration-700">
                    <div className="flex items-center gap-4 mb-8 border-l-4 border-slate-200 pl-4">
                      <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                        {groupedProducts.length > 0 ? "Other Products" : "Available Products"}
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
                      {otherProducts.map((product: any) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>
                  </section>
                )}
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

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <ShopContent />
    </Suspense>
  )
}
