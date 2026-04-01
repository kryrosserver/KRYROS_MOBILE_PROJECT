"use client"

import { useEffect, useState } from "react"
import { productsApi, cmsApi } from "@/lib/api"
import { ProductCard } from "@/components/home/ProductCard"
import { resolveImageUrl } from "@/lib/utils"
import { CategoriesGrid } from "@/components/home/CategoriesGrid"
import { PromoBanners } from "@/components/home/PromoBanners"
import { BlogSection } from "@/components/home/BlogSection"
import { CreditSection } from "@/components/home/CreditSection"
import { Button } from "@/components/ui/button"
import { ArrowRight, Smartphone, ShieldCheck, Truck } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Parallel fetch
    Promise.all([
      productsApi.getAll({ isFeatured: true, limit: 8 }),
      cmsApi.getBanners()
    ]).then(([productsRes, bannersRes]) => {
      if (productsRes.data?.products) {
        setProducts(productsRes.data.products)
      }
      if (bannersRes.data) {
        setBanners(bannersRes.data)
      }
      setLoading(false)
    })
  }, [])

  // Filter banners to separate Hero and Sidebar/Promotion banners
  const heroBanner = banners.find(b => b.type === 'HERO') || banners[0]
  const promoBanners = banners.filter(b => b.type === 'PROMOTION').slice(0, 2)

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-slate-50 border-b border-slate-100">
        <div className="container-custom py-8 md:py-12">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Main Hero Banner */}
            <div className="flex-1 relative min-h-[400px] md:min-h-[500px] rounded-[2.5rem] overflow-hidden bg-slate-900 text-white shadow-2xl group">
              <div className="absolute inset-0 z-0">
                {heroBanner?.image ? (
                  <img 
                    src={resolveImageUrl(heroBanner.image)} 
                    alt={heroBanner.title} 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                )}
              </div>
              
              <div className="relative z-10 h-full flex flex-col justify-center p-10 md:p-16 space-y-6 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30 w-fit">
                  {heroBanner?.subtitle || "Featured Collection"}
                </div>
                <h1 className="text-4xl md:text-7xl font-black leading-[0.95] uppercase tracking-tighter">
                  {heroBanner?.title || <>Premium <span className="text-primary">Tech</span> Experience</>}
                </h1>
                <p className="text-slate-300 text-lg font-medium leading-relaxed line-clamp-3">
                  {heroBanner?.desc || heroBanner?.description || "Explore the latest smartphones and accessories with flexible payment plans."}
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link href={heroBanner?.link || "/shop"}>
                    <Button className="h-14 px-10 font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl shadow-primary/20">
                      Shop Now <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar Promotion Banners */}
            <div className="w-full lg:w-[380px] flex flex-col gap-6">
              {promoBanners.length > 0 ? (
                promoBanners.map((promo, idx) => (
                  <div key={idx} className="flex-1 relative min-h-[200px] rounded-[2rem] overflow-hidden group bg-slate-100 border border-slate-200 shadow-sm">
                    <div className="absolute inset-0 z-0">
                      {promo.image && (
                        <img 
                          src={resolveImageUrl(promo.image)} 
                          alt={promo.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-center p-8 text-white space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">{promo.subtitle}</span>
                      <h3 className="text-2xl font-black uppercase tracking-tight leading-none">{promo.title}</h3>
                      <Link href={promo.link || "/shop"} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all">
                        Browse <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex-1 relative min-h-[200px] rounded-[2rem] overflow-hidden bg-blue-600 text-white p-8 group">
                    <div className="relative z-10 space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">New Arrival</span>
                      <h3 className="text-2xl font-black uppercase tracking-tight leading-none">iPhone 15 <br/>Series</h3>
                      <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all pt-2">
                        Shop Now <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <Smartphone className="absolute -bottom-4 -right-4 h-32 w-32 text-blue-500/30 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 relative min-h-[200px] rounded-[2rem] overflow-hidden bg-primary text-white p-8 group">
                    <div className="relative z-10 space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Special Offer</span>
                      <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Up to 20% <br/>Off Audio</h3>
                      <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all pt-2">
                        Get Deal <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-white/10 rounded-full blur-2xl" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <div className="bg-white py-10 border-b border-slate-50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary"><Truck className="h-5 w-5" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Fast Delivery</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary"><ShieldCheck className="h-5 w-5" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Genuine Tech</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary"><Smartphone className="h-5 w-5" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Verified Seller</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary"><ArrowRight className="h-5 w-5" /></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Pay on Credit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <CategoriesGrid />

      {/* Featured Products Grid */}
      <section className="py-24 bg-slate-50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                Featured <span className="text-primary">Products</span>
              </h2>
              <p className="mt-4 text-slate-500 font-medium">Carefully selected premium technology for your daily needs.</p>
            </div>
            <Link href="/shop" className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2 group hover:underline">
              Browse All Products <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-white rounded-[2.5rem] animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banners */}
      <PromoBanners />

      {/* Credit Section */}
      <CreditSection />

      {/* Blog Section */}
      <BlogSection />
    </main>
  )
}
