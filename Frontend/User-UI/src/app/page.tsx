'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Flashlight, Star, Heart, ShoppingCart, ArrowRight, Clock, Tag, Zap, Shield, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ComingSoon from '@/components/common/ComingSoon'
import { Input } from '@/components/ui/input'
import { useCart } from '@/providers/CartProvider'
import { formatPrice, getTimeRemaining, calculateDiscount } from '@/lib/utils'
import { cmsApi, productsApi } from '@/lib/api'
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
function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [heroBanners, setHeroBanners] = useState<any[]>([])

  useEffect(() => {
    let isMounted = true
    cmsApi.getBanners()
      .then((res) => {
        if (isMounted && res.data && Array.isArray(res.data)) {
          const mapped = res.data
            .filter((b: any) => b?.isActive)
            .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
            .map((b: any) => ({
              id: b.id,
              title: b.title,
              subtitle: b.subtitle || '',
              image: b.image,
              link: b.link || '/shop',
              linkText: b.linkText || 'Shop Now',
              isActive: b.isActive,
              position: b.position || 0,
            }))
          setHeroBanners(mapped)
        }
      })
      .catch(() => {
        setHeroBanners([])
      })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!heroBanners.length) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBanners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [heroBanners.length])

  if (!heroBanners.length) {
    return <ComingSoon title="Homepage Banners Coming Soon" message="Our latest promotions will appear here." />
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
          <Image
            src={heroBanners[currentSlide]?.image}
            alt={heroBanners[currentSlide]?.title}
            fill
            className="object-cover"
            priority
          />
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

// Flash Sales Component
function FlashSales() {
  const [flash, setFlash] = useState<any[]>([])
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    let active = true
    productsApi.getFlashSales().then(res => {
      if (active && Array.isArray(res.data)) setFlash(res.data)
    })
    setIsMounted(true)
    const timer = setInterval(() => {
      if (flash.length && flash[0].flashSaleEnd) {
        setTimeLeft(getTimeRemaining(flash[0].flashSaleEnd))
      }
    }, 1000)
    return () => { active = false; clearInterval(timer) }
  }, [])

  if (!flash.length) return null
  const flashProducts = flash

  return (
    <section className="section-padding bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-kryros-orange text-white px-4 py-2 rounded-lg">
              <Flashlight className="h-5 w-5" />
              <span className="font-bold">Flash Sales</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              Ends in:
            </div>
            <div className="flex gap-1">
              {['days', 'hours', 'minutes', 'seconds'].map((unit) => (
                <div key={unit} className="bg-kryros-primary text-white px-2 py-1 rounded text-sm font-bold min-w-[40px] text-center">
                  {isMounted ? String(timeLeft[unit as keyof typeof timeLeft]).padStart(2, '0') : '--'}
                </div>
              ))}
            </div>
          </div>
          <Link href="/flash-sales" className="text-kryros-orange font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {flashProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Product Card Component
function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart()
  const [isWishlisted, setIsWishlisted] = useState(false)

  const discount = product.salePrice
    ? calculateDiscount(product.price, product.salePrice)
    : product.flashSalePrice
    ? calculateDiscount(product.price, product.flashSalePrice)
    : 0

  const displayPrice = product.flashSalePrice || product.salePrice || product.price

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <Image
          src={product.images[0].url}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {discount > 0 && (
            <span className="bg-kryros-orange text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </span>
          )}
          {product.isFlashSale && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
              <Zap className="h-3 w-3" /> Flash
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white shadow-md hover:bg-gray-100"
            onClick={() => setIsWishlisted(!isWishlisted)}
          >
            <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
        </div>

        {/* Quick Add */}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            className="w-full bg-kryros-accent hover:bg-kryros-accent-hover"
            onClick={() => addItem(product)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-medium text-sm line-clamp-2 hover:text-kryros-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center gap-1 mt-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-sm text-slate-600">({product.reviewCount})</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-lg text-kryros-primary">
            {formatPrice(displayPrice)}
          </span>
          {product.salePrice && (
            <span className="text-base text-slate-500 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        {product.allowCredit && (
          <div className="mt-2 text-xs text-kryros-accent flex items-center gap-1">
            <CreditCard className="h-3 w-3" />
            Buy from {formatPrice(product.creditMinimum || 500)}/mo
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Featured Products Section
function FeaturedProducts() {
  const [featuredProducts, setFeatured] = useState<any[]>([])
  useEffect(() => {
    let active = true
    productsApi.getFeatured().then(res => {
      if (active && Array.isArray(res.data)) setFeatured(res.data.slice(0, 8))
    })
    return () => { active = false }
  }, [])
  if (!featuredProducts.length) return null

  return (
    <section className="section-padding bg-gray-50">
      <div className="container-custom">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-heading font-bold">Featured Products</h2>
          <Link href="/shop?featured=true" className="text-kryros-accent font-medium hover:underline flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
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
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend.onrender.com/api'}/services`, { cache: 'no-store' })
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
function TestimonialsSection() {
  return (
    <section className="section-padding">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">What Our Customers Say</h2>
          <p className="text-gray-600">Join thousands of satisfied customers</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
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
                    className={`h-5 w-5 ${i < testimonial.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <p className="text-gray-600 mb-4">"{testimonial.comment}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                </div>
                <div>
                  <p className="font-medium">{testimonial.name}</p>
                  <p className="text-base font-medium text-slate-600">{testimonial.location}</p>
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

// Main Page Component
export default function HomePage() {
  return (
    <div className="pt-0">
      <HeroSlider />
      <FeaturedProducts />
      <FlashSales />
      <ServicesSection />
      <NewsletterSection />
      <ComingSoon title="Storefront Coming Soon" message="Product listings, categories, and more will appear here once posted." />
    </div>
  )
}
