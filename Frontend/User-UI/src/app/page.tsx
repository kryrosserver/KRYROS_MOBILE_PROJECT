'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Flashlight, Star, Heart, ShoppingCart, ArrowRight, Clock, Tag, Zap, Shield, CreditCard, Smartphone, Laptop, Tablet, Headphones, Watch, Code2, Music, Gamepad2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreditSection } from '@/components/home/CreditSection'
import ComingSoon from '@/components/common/ComingSoon'
import { Input } from '@/components/ui/input'
import { ProductCard } from '@/components/home/ProductCard'
import { CategoryGrid } from '@/components/shop/CategoryGrid'
import { useCart } from '@/providers/CartProvider'
import { useAuth } from '@/providers/AuthProvider'
import { wishlistApi } from '@/lib/api'
import { useToast } from '@/components/ui/use-toast'
import { formatPrice, getTimeRemaining, calculateDiscount, resolveImageUrl } from '@/lib/utils'
import { cmsApi, productsApi, categoriesApi } from '@/lib/api'
import type { Product } from '@/types'

// Remove placeholders by using empty arrays until real data exists
const products: any[] = []
const services: any[] = []
const testimonials: any[] = []

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

// Hero Slider Component
function HeroSlider({ banners, loading = false }: { banners: any[], loading?: boolean }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroBanners, setHeroBanners] = useState<any[]>([])

  useEffect(() => {
    if (banners && Array.isArray(banners) && banners.length > 0) {
      const mapped = banners
        .filter((b: any) => b?.isActive)
        .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
        .map((b: any) => ({
          id: b.id,
          title: b.title,
          subtitle: b.subtitle || '',
          mediaType: b.mediaType || 'image',
          image: b.image,
          videoUrl: b.videoUrl,
          link: b.link || '/shop',
          linkText: b.linkText || 'Shop Now',
          isActive: b.isActive,
          position: b.position || 0,
        }))
      setHeroBanners(mapped)
    }
  }, [banners])

  useEffect(() => {
    if (!heroBanners.length) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroBanners.length])

  if (loading || !heroBanners.length) {
    return (
      <div className="relative h-[500px] md:h-[600px] overflow-hidden bg-slate-900 flex items-center justify-center">
        <div className="container-custom">
          <div className="max-w-xl space-y-6">
            <div className="h-8 w-32 bg-white/10 rounded-full animate-pulse" />
            <div className="h-16 w-full bg-white/10 rounded-xl animate-pulse" />
            <div className="h-16 w-3/4 bg-white/10 rounded-xl animate-pulse" />
            <div className="h-24 w-full bg-white/5 rounded-lg animate-pulse" />
            <div className="h-12 w-48 bg-white/20 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[500px] md:h-[600px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          {heroBanners[currentSlide]?.mediaType === 'video' ? (
            <div className="relative w-full h-full">
              <video
                src={resolveImageUrl(heroBanners[currentSlide]?.videoUrl)}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ) : heroBanners[currentSlide]?.image ? (
            <img
              src={resolveImageUrl(heroBanners[currentSlide]?.image)}
              alt={heroBanners[currentSlide]?.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/1200x600?text=KRYROS+MOBILE+TECH';
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-kryros-primary flex items-center justify-center">
              <span className="text-white/20 text-4xl font-black uppercase tracking-widest">KRYROS</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full container-custom">
        <div className="h-full flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl"
            >
              <span className="inline-block px-4 py-1 bg-kryros-accent text-white text-sm font-medium rounded-full mb-4">
                {heroBanners[currentSlide]?.subtitle}
              </span>
              <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-4">
                {heroBanners[currentSlide]?.title}
              </h1>
              <p className="text-lg text-gray-200 mb-8">
                Discover the latest technology and electronics at unbeatable prices.
              </p>
              <Link href={heroBanners[currentSlide]?.link || "/shop"}>
                <Button size="lg" className="bg-kryros-orange hover:bg-kryros-orange/90 text-lg px-8">
                  {heroBanners[currentSlide]?.linkText}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {heroBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>

      {/* Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={() => setCurrentSlide((prev) => (prev - 1 + heroBanners.length) % heroBanners.length)}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % heroBanners.length)}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  )
}

function WholesaleCreditHighlights() {
  return (
    <section className="section-padding bg-white">
      <div className="container-custom">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-900 text-white p-8 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-300">
                <Package className="h-4 w-4" /> Wholesale
              </span>
              <h3 className="mt-4 text-2xl font-bold">Bulk Orders, Better Prices</h3>
              <p className="mt-2 text-slate-300">Save up to 40% on bulk orders. Perfect for businesses and resellers.</p>
            </div>
            <Link href="/wholesale" className="mt-6 inline-flex items-center gap-2 text-green-400 hover:text-green-300">
              Explore Wholesale <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="rounded-2xl bg-green-500 text-white p-8 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white">
                Credit Plans
              </span>
              <h3 className="mt-4 text-2xl font-bold">Buy Now, Pay Later</h3>
              <p className="mt-2 text-white/90">0% interest for the first 3 months. Flexible monthly payments up to 24 months.</p>
            </div>
            <Link href="/credit" className="mt-6 inline-flex items-center gap-2 text-white hover:text-white/90">
              Apply for Credit <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Free Shipping</div>
              <div className="text-sm text-slate-500">On orders over $500</div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Secure Payments</div>
              <div className="text-sm text-slate-500">100% protected checkout</div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <CreditCard className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="font-medium text-slate-900">Easy Installments</div>
              <div className="text-sm text-slate-500">Up to 24 months</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function CategoriesGridSection({ categories, sections, loading: externalLoading = false }: { categories: any[], sections: any[], loading?: boolean }) {
  const [cmsConfig, setCmsConfig] = useState<any>(null)

  useEffect(() => {
    if (sections && Array.isArray(sections)) {
      const sect = sections.find((s:any) => s.type === 'categories' && s.isActive)
      if (sect) setCmsConfig(sect)
    }
  }, [sections])

  // Prioritize categories with showOnHome flag set to true
  const displayCategories = useMemo(() => {
    // Return empty array while loading
    if (!categories || categories.length === 0) return []

    const homepageCats = categories.filter(c => c.showOnHome && c.isActive !== false)
    if (homepageCats.length > 0) {
      return homepageCats.map(c => ({
        ...c,
        productCount: c._count?.products ?? 0
      }))
    }
    
    return categories.slice(0, 8).map(c => ({
      ...c,
      productCount: c._count?.products ?? 0
    }))
  }, [categories])

  const iconFor = (name: string) => {
    const n = (name || '').toLowerCase()
    if (n.includes('phone')) return Smartphone
    if (n.includes('laptop')) return Laptop
    if (n.includes('tablet')) return Tablet
    if (n.includes('access')) return Headphones
    if (n.includes('wear')) return Watch
    if (n.includes('soft')) return Code2
    if (n.includes('audio')) return Music
    if (n.includes('game')) return Gamepad2
    return Tag
  }

  if (externalLoading || !displayCategories.length) return null

  return (
    <section className="section-padding bg-slate-50">
      <div className="container-custom">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-display font-bold">{cmsConfig?.title || "Shop by Category"}</h2>
          <p className="text-slate-600">{cmsConfig?.subtitle || "Browse our wide range of tech products"}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {externalLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm ring-1 ring-slate-200 animate-pulse">
                <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-slate-100" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto" />
                <div className="h-3 bg-slate-100 rounded w-1/3 mx-auto mt-2" />
              </div>
            ))
          ) : (
            displayCategories.map((cat:any, idx:number) => {
              const Icon = iconFor(cat?.name || '')
              const count = cat?.productCount || 0
              return (
                <Link key={cat?.id ?? idx} href={`/shop?category=${cat.slug}`} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                    <Icon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-slate-900">{cat?.name || 'Category'}</div>
                    <div className="text-sm text-slate-500">{count} products</div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

// Flash Sales Component
function FlashSales({ products, loading = false }: { products: any[], loading?: boolean }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const timer = setInterval(() => {
      if (products.length && products[0].flashSaleEnd) {
        setTimeLeft(getTimeRemaining(products[0].flashSaleEnd))
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [products])

  if (loading || !products.length) return null
  const flashProducts = products

  return (
    <section className="py-8 md:py-16 bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-kryros-orange text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg">
              <Flashlight className="h-4 w-4 md:h-5 md:w-5" />
              <span className="font-bold text-sm md:text-base">Flash Sales</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] md:text-sm text-gray-600">
              <Clock className="h-3.5 w-3.5" />
              Ends in:
            </div>
            <div className="flex gap-1">
              {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
                <div key={unit} className="bg-kryros-primary text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[10px] md:text-sm font-bold min-w-[30px] md:min-w-[40px] text-center">
                  {isMounted ? String(timeLeft[unit as keyof typeof timeLeft]).padStart(2, '0') : '--'}
                </div>
              ))}
            </div>
          </div>
          <Link href="/flash-sales" className="text-kryros-orange text-sm font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {flashProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Featured Products Section
function FeaturedProducts({ products, loading = false }: { products: any[], loading?: boolean }) {
  if (loading || !products.length) return null
  const featuredProducts = products

  return (
    <section className="py-8 md:py-16 bg-gray-50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-3xl font-heading font-bold">Featured Products</h2>
          <Link href="/shop?featured=true" className="text-kryros-accent text-sm font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-[350px] animate-pulse">
                <div className="aspect-square bg-slate-100 rounded-t-xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-4 bg-slate-100 rounded w-1/2" />
                  <div className="h-6 bg-slate-100 rounded w-1/3 mt-4" />
                </div>
              </div>
            ))
          ) : (
            featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>
      </div>
    </section>
  )
}

// Services Section
function ServicesSection() {
  const [items, setItems] = useState<any[]>([])
  useEffect(() => {
    let active = true
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-hxfp.onrender.com/api'}/services`, { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (active && Array.isArray(d)) setItems(d) })
      .catch(() => setItems([]))
    return () => { active = false }
  }, [])
  if (!items.length) return null
  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">Our Services</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Professional technology services including repairs, installations, and technical support
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((service: any, index: number) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
            >
              <div className="relative h-40 bg-gray-200">
                <Image
                  src={service.image || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop'}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2">{service.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description || ''}</p>
                <div className="flex items-center justify-between">
                  <span className="text-kryros-accent font-bold">{service.price ? `From ${formatPrice(service.price)}` : 'Contact for price'}</span>
                  <Link href={`/services`}>
                    <Button variant="ghost" size="sm">Book</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Testimonials Section
function TestimonialsSection({ sections }: { sections: any[] }) {
  const [items, setItems] = useState<any[]>([])
  const [title, setTitle] = useState<string>("What Our Customers Say")
  
  useEffect(() => {
    if (sections && Array.isArray(sections)) {
      const sect = sections.find((s:any) => s.type === 'testimonials' && s.isActive)
      if (sect && Array.isArray(sect.config?.items)) {
        setItems(sect.config.items)
        if (sect.title) setTitle(sect.title)
      }
    }
  }, [sections])
  if (!items.length) return null
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">{title}</h2>
          <p className="text-gray-600">Join thousands of satisfied customers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((testimonial: any, index: number) => (
            <motion.div
              key={`${testimonial.name}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(testimonial.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Image
                    src={testimonial.avatar || 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=80&h=80&fit=crop'}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-base font-medium text-slate-600">{testimonial.location || ''}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Newsletter Section
function NewsletterSection() {
  return (
    <section className="py-16 bg-gray-100">
      <div className="container-custom">
        <div className="bg-kryros-primary rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-4">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Get the latest deals, new arrivals, and tech news delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              className="flex-1 h-12 bg-white"
            />
            <Button className="h-12 bg-kryros-accent hover:bg-kryros-accent-hover px-8">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

// Types for the homepage
interface HomePageData {
  banners: any[];
  featured: any[];
  flashSales: any[];
  categories: any[];
  sections: any[];
}

// Separate components for better performance and clear server/client boundaries
async function getHomePageData(): Promise<HomePageData> {
  const [banners, featured, flashSales, categories, sections] = await Promise.all([
    cmsApi.getBanners(),
    productsApi.getFeatured(),
    productsApi.getFlashSales(),
    categoriesApi.getAll(),
    cmsApi.getSections(),
  ]);

  return {
    banners: banners.data || [],
    featured: featured.data || [],
    flashSales: flashSales.data || [],
    categories: categories.data || [],
    sections: sections.data || [],
  };
}

export default function HomePage() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHomePageData().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="pt-0">
        <HeroSlider banners={[]} loading={true} />
        <div className="container-custom py-12 space-y-12">
          <div className="h-64 w-full bg-slate-100 animate-pulse rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-100 animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-0">
      <HeroSlider banners={data?.banners || []} />
      
      <FlashSales products={data?.flashSales || []} />
      <FeaturedProducts products={data?.featured || []} />
      <WholesaleCreditHighlights />
      <CreditSection />
      <ServicesSection />
      <TestimonialsSection sections={data?.sections || []} />
      <NewsletterSection />
    </div>
  )
}
