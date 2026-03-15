'use client';

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Heart, Shield, Truck, Clock, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend.onrender.com/api'

async function getProduct(slug: string) {
  // Try slug first
  let res = await fetch(`${API_URL}/products/slug/${slug}`, { cache: 'no-store' })
  if (res.ok) {
    return res.json()
  }
  // Fallback: treat slug as id
  res = await fetch(`${API_URL}/products/${slug}`, { cache: 'no-store' })
  if (res.ok) {
    return res.json()
  }
  return null
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIdx, setActiveImageIdx] = useState(0)

  useEffect(() => {
    getProduct(params.slug).then(data => {
      setProduct(data)
      setLoading(false)
    })
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    )
  }

  if (!product) {
    notFound()
  }

  const p = product
  const specifications = typeof p.specifications === 'string' 
    ? JSON.parse(p.specifications) 
    : (Array.isArray(p.specifications) ? p.specifications : [])

  const images = p.images?.length > 0 ? p.images : [{ url: '/placeholder.jpg' }]
  const mainImage = images[activeImageIdx]?.url || '/placeholder.jpg'

  const nextImage = () => setActiveImageIdx((prev) => (prev + 1) % images.length)
  const prevImage = () => setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length)

  return (
    <div className="min-h-screen bg-slate-50 py-8 md:py-12">
      <div className="container-custom">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          {/* Left: Images */}
          <div className="space-y-4">
            <div className="group relative aspect-square overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <Image
                src={mainImage}
                alt={p.name}
                fill
                className="object-contain p-4 transition-transform duration-500"
                priority
                unoptimized={mainImage.startsWith('data:')}
              />
              
              {images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-800 shadow-md transition-all hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-slate-800 shadow-md transition-all hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {images.map((_: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all ${idx === activeImageIdx ? 'w-6 bg-green-500' : 'w-1.5 bg-slate-300'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-4">
                {images.map((img: any, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative aspect-square overflow-hidden rounded-lg bg-white shadow-sm ring-2 transition-all ${idx === activeImageIdx ? 'ring-green-500 scale-105' : 'ring-slate-200 hover:ring-slate-300'}`}
                  >
                    <Image 
                      src={img.url} 
                      alt={p.name} 
                      fill 
                      className="object-contain p-2" 
                      unoptimized={img.url.startsWith('data:')}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:p-8">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-green-700">
                  {p.category?.name || 'General'}
                </span>
                {p.brand?.name && (
                  <span className="text-sm font-medium text-slate-500">{p.brand.name}</span>
                )}
              </div>
              
              <h1 className="mt-4 text-2xl font-bold text-slate-900 md:text-3xl">{p.name}</h1>
              <p className="mt-2 text-sm text-slate-500 font-mono">SKU: {p.sku}</p>

              <div className="mt-6 flex items-baseline gap-4">
                <span className="text-3xl font-bold text-slate-900">{formatPrice(Number(p.price))}</span>
                {p.originalPrice && (
                  <span className="text-lg text-slate-400 line-through">{formatPrice(Number(p.originalPrice))}</span>
                )}
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="flex-1 bg-green-500 hover:bg-green-600">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button size="lg" variant="outline" className="flex-1 border-slate-200">
                  <Heart className="mr-2 h-5 w-5" />
                  Wishlist
                </Button>
              </div>
            </div>

            {/* Specifications & Description */}
            <div className="mt-8 space-y-8">
              {specifications.length > 0 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h3 className="text-lg font-bold text-slate-900">Specifications</h3>
                  <div className="mt-4 grid gap-y-3">
                    {specifications.map((spec: any, idx: number) => (
                      <div key={idx} className="flex border-b border-slate-100 pb-2 last:border-0">
                        <span className="w-1/3 text-sm font-medium text-slate-500">{spec.key}</span>
                        <span className="w-2/3 text-sm font-bold text-slate-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-lg font-bold text-slate-900">Description</h3>
                <div className="mt-4 text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                  {p.description}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
