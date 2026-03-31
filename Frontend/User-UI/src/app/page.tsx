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

  // Use the first banner for hero if available
  const heroBanner = banners[0]

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden bg-slate-50">
        <div className="container-custom relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20 animate-in fade-in slide-in-from-left-4 duration-500">
                Premium Tech Hub
              </div>
              <h1 className="text-5xl md:text-8xl font-black text-slate-900 leading-[0.9] uppercase tracking-tighter animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                {heroBanner?.title || <>Upgrade Your <span className="text-primary">Digital</span> Lifestyle</>}
              </h1>
              <p className="max-w-md text-lg md:text-xl text-slate-500 font-medium leading-relaxed animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                {heroBanner?.desc || heroBanner?.description || "Experience the future of mobile technology with Zambia's most trusted provider of premium devices and flexible credit plans."}
              </p>
              <div className="flex flex-wrap gap-4 pt-4 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                <Link href="/shop">
                  <Button className="h-16 px-10 font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/20 rounded-2xl">
                    Shop Collection <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/credit">
                  <Button variant="outline" className="h-16 px-10 font-black uppercase tracking-widest text-sm border-2 rounded-2xl">
                    Buy on Credit
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block animate-in fade-in zoom-in duration-1000">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse" />
              <div className="relative aspect-square bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-4 rotate-3">
                 <div className="h-full w-full bg-slate-50 rounded-[3.5rem] overflow-hidden">
                    {heroBanner?.image ? (
                      <img src={resolveImageUrl(heroBanner.image)} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                         <Smartphone className="h-32 w-32 text-slate-200" />
                      </div>
                    )}
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 -skew-x-12 translate-x-1/2" />
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
