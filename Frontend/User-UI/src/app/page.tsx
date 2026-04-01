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
    setLoading(true)
    // Parallel fetch
    Promise.all([
      productsApi.getFeatured(),
      cmsApi.getBanners(),
      cmsApi.getSections()
    ]).then(([productsRes, bannersRes, sectionsRes]) => {
      // 1. Handle Banners (Fetch first to know what we have)
      const allBanners = bannersRes.data || []
      setBanners(allBanners)

      // 2. Handle Products (Featured Products)
      let featuredItems: any[] = []

      // Check direct productsRes first
      if (Array.isArray(productsRes.data)) {
        featuredItems = productsRes.data
      } else if ((productsRes.data as any)?.products) {
        featuredItems = (productsRes.data as any).products
      }

      // If featuredItems is empty or contains things that look like banners (have "link" but no "price")
      // then we look into CMS sections for actual products
      const looksLikeBanners = featuredItems.length > 0 && featuredItems.every(item => item.link && !item.price)
      
      if (featuredItems.length === 0 || looksLikeBanners) {
        if (sectionsRes.data) {
          const featuredSection = sectionsRes.data.find((s: any) => 
            s.type === 'FEATURED_PRODUCTS' || 
            s.name?.toLowerCase().includes('featured')
          )
          if (featuredSection?.items && Array.isArray(featuredSection.items)) {
            // Ensure these are products (have prices)
            featuredItems = featuredSection.items.filter((item: any) => item.price || item.name)
          }
        }
      }

      // Final check: if we still have banners in products, clear them
      // We only want products in the products grid
      setProducts(featuredItems.filter(item => item.price !== undefined))

      setLoading(false)
    }).catch(err => {
      console.error("Error fetching homepage data:", err)
      setLoading(false)
    })
  }, [])

  // Filter banners for the Hero Slider - BE VERY FLEXIBLE
  // We look for HERO type, hero position, or just anything that isn't a sidebar promo
  const heroBanners = banners.filter(b => 
    b.type === 'HERO' || 
    b.type === 'hero' || 
    b.position === 'top' || 
    b.position === 'hero' ||
    b.isMain === true
  )

  // Fallback: If no HERO banners found, but we have banners, use the first few for the slider
  const sliderBanners = heroBanners.length > 0 ? heroBanners : banners.slice(0, 3)
  
  // Promotion banners for the sidebar (anything specifically marked or just the rest)
  const promoBanners = banners.filter(b => b.type === 'PROMOTION' || b.position === 'sidebar').slice(0, 2)

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-slate-50 border-b border-slate-100 overflow-hidden">
        <div className="container-custom py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Hero Banner Slider */}
            <div className="lg:col-span-8 relative min-h-[400px] md:min-h-[550px] rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden bg-slate-900 shadow-2xl group">
              {sliderBanners.length > 0 ? (
                <Swiper
                  modules={[Autoplay, Pagination, EffectFade]}
                  effect="fade"
                  pagination={{ 
                    clickable: true,
                    bulletActiveClass: 'swiper-pagination-bullet-active bg-primary w-8 rounded-full'
                  }}
                  autoplay={{ delay: 6000, disableOnInteraction: false }}
                  className="h-full w-full"
                >
                  {sliderBanners.map((banner, index) => (
                    <SwiperSlide key={banner.id || index}>
                      <div className="relative h-full w-full flex flex-col justify-end">
                        <div className="absolute inset-0 z-0">
                          {banner.image ? (
                            <img 
                              src={resolveImageUrl(banner.image)} 
                              alt={banner.title} 
                              className="w-full h-full object-cover opacity-80"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        </div>
                        
                        <div className="relative z-10 p-10 md:p-20 space-y-6 max-w-2xl">
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest w-fit shadow-lg shadow-primary/20">
                            {banner.subtitle || "New Arrival"}
                          </div>
                          <h1 className="text-4xl md:text-7xl font-black leading-[0.9] uppercase tracking-tighter text-white drop-shadow-sm">
                            {banner.title}
                          </h1>
                          <p className="text-slate-200 text-base md:text-xl font-medium leading-relaxed line-clamp-2 max-w-lg opacity-90">
                            {banner.desc || banner.description}
                          </p>
                          <div className="pt-4">
                            <Link href={banner.link || "/shop"}>
                              <Button className="h-14 md:h-16 px-10 md:px-12 font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 transition-all">
                                Shop Now <ArrowRight className="h-5 w-5 ml-2" />
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
                   <div className="space-y-8 animate-pulse">
                      <div className="h-8 w-32 bg-white/10 rounded-full mx-auto" />
                      <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter opacity-20">KRYROS</h1>
                      <div className="h-16 w-48 bg-white/10 rounded-2xl mx-auto" />
                   </div>
                </div>
              )}
            </div>

            {/* Sidebar Promotion Banners */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {promoBanners.length > 0 ? (
                promoBanners.map((promo, idx) => (
                  <div key={idx} className="flex-1 relative min-h-[190px] rounded-[2.5rem] overflow-hidden group bg-slate-100 border border-slate-200 shadow-md">
                    <div className="absolute inset-0 z-0">
                      {promo.image && (
                        <img 
                          src={resolveImageUrl(promo.image)} 
                          alt={promo.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-center p-10 text-white space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">{promo.subtitle}</span>
                      <h3 className="text-2xl font-black uppercase tracking-tight leading-none drop-shadow-sm">{promo.title}</h3>
                      <Link href={promo.link || "/shop"} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-all pt-2 group/link">
                        Explore <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex-1 relative min-h-[190px] rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 text-white p-10 group shadow-xl">
                    <div className="relative z-10 space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-200">Featured</span>
                      <h3 className="text-3xl font-black uppercase tracking-tight leading-none">Smartphones</h3>
                      <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all pt-4">
                        Browse Now <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <Smartphone className="absolute -bottom-4 -right-4 h-32 w-32 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                  </div>
                  <div className="flex-1 relative min-h-[190px] rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 text-white p-10 group shadow-xl">
                    <div className="relative z-10 space-y-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Limited</span>
                      <h3 className="text-3xl font-black uppercase tracking-tight leading-none">Accessories</h3>
                      <Link href="/shop" className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:gap-4 transition-all pt-4">
                        Discover <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                    <div className="absolute -bottom-10 -right-10 h-40 w-40 bg-primary/20 rounded-full blur-2xl" />
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
