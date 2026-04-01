"use client"

import { useEffect, useState } from "react"
import { productsApi, cmsApi } from "@/lib/api"
import { ProductCard } from "@/components/home/ProductCard"
import { resolveImageUrl } from "@/lib/utils"
import { CategoriesGrid } from "@/components/home/CategoriesGrid"
import { PromoBanners } from "@/components/home/PromoBanners"
import { CreditSection } from "@/components/home/CreditSection"
import { Button } from "@/components/ui/button"
import { ArrowRight, Smartphone, ShieldCheck, Truck } from "lucide-react"
import Link from "next/link"

// Import Swiper components and styles
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Parallel fetch
    Promise.all([
      productsApi.getFeatured(),
      cmsApi.getBanners()
    ]).then(([productsRes, bannersRes]) => {
      // 1. Handle Products (Actual Featured Products)
      // If getFeatured returns { products: [...] }
      if (productsRes.data && (productsRes.data as any).products) {
        setProducts((productsRes.data as any).products)
      } 
      // If getFeatured returns [...]
      else if (Array.isArray(productsRes.data)) {
        setProducts(productsRes.data)
      }

      // 2. Handle Banners
      if (bannersRes.data) {
        setBanners(bannersRes.data)
      }

      setLoading(false)
    }).catch(err => {
      console.error("Error fetching homepage data:", err)
      setLoading(false)
    })
  }, [])

  // Filter banners
  const heroBanners = banners.filter(b => b.type === 'HERO')
  const promoBanners = banners.filter(b => b.type === 'PROMOTION').slice(0, 2)

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section - Redesigned with Swiper Slider */}
      <section className="bg-slate-50 border-b border-slate-100 overflow-hidden">
        <div className="container-custom py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Hero Banner Slider - Spans 8 columns */}
            <div className="lg:col-span-8 relative min-h-[350px] md:min-h-[500px] rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-slate-900 shadow-xl group">
              {heroBanners.length > 0 ? (
                <Swiper
                  modules={[Autoplay, Pagination, EffectFade]}
                  effect="fade"
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 5000, disableOnInteraction: false }}
                  className="h-full w-full"
                >
                  {heroBanners.map((banner, index) => (
                    <SwiperSlide key={banner.id || index}>
                      <div className="relative h-full w-full flex flex-col justify-end">
                        <div className="absolute inset-0 z-0">
                          {banner.image ? (
                            <img 
                              src={resolveImageUrl(banner.image)} 
                              alt={banner.title} 
                              className="w-full h-full object-cover opacity-70"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        </div>
                        
                        <div className="relative z-10 p-8 md:p-16 space-y-4 md:space-y-6 max-w-2xl">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-primary/20">
                            {banner.subtitle || "Exclusive Deal"}
                          </div>
                          <h1 className="text-3xl md:text-6xl font-black leading-[0.95] uppercase tracking-tighter text-white">
                            {banner.title}
                          </h1>
                          <p className="text-slate-200 text-sm md:text-lg font-medium leading-relaxed line-clamp-2 max-w-md">
                            {banner.desc || banner.description}
                          </p>
                          <div className="pt-2 md:pt-4">
                            <Link href={banner.link || "/shop"}>
                              <Button className="h-12 md:h-14 px-8 md:px-10 font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl md:rounded-2xl shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                                Explore Now <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              ) : (
                <div className="h-full flex items-center justify-center p-12 text-center text-white">
                   <div className="space-y-6">
                      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">Premium Tech <br/><span className="text-primary">Experience</span></h1>
                      <Link href="/shop"><Button className="rounded-2xl h-14 px-10 font-black uppercase tracking-widest">Shop Collection</Button></Link>
                   </div>
                </div>
              )}
            </div>

            {/* Sidebar Promotion Banners - Spans 4 columns */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {promoBanners.length > 0 ? (
                promoBanners.map((promo, idx) => (
                  <div key={idx} className="flex-1 relative min-h-[180px] rounded-[2rem] overflow-hidden group bg-slate-100 border border-slate-200 shadow-sm">
                    <div className="absolute inset-0 z-0">
                      {promo.image && (
                        <img 
                          src={resolveImageUrl(promo.image)} 
                          alt={promo.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent opacity-80" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-center p-8 text-white space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">{promo.subtitle}</span>
                      <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none">{promo.title}</h3>
                      <Link href={promo.link || "/shop"} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-all pt-2">
                        View Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex-1 relative min-h-[180px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 text-white p-8 group shadow-lg">
                    <div className="relative z-10 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Featured</span>
                      <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Latest <br/>Smartphones</h3>
                      <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all pt-4">
                        Shop Now <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <Smartphone className="absolute -bottom-4 -right-4 h-28 w-28 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 relative min-h-[180px] rounded-[2rem] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 group shadow-lg">
                    <div className="relative z-10 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Special</span>
                      <h3 className="text-2xl font-black uppercase tracking-tight leading-none">Premium <br/>Accessories</h3>
                      <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all pt-4">
                        Explore <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-primary/20 rounded-full blur-2xl" />
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
    </main>
  )
}
