"use client"

import React, { useEffect, useState } from "react"
import { productsApi } from "@/lib/api"
import { ArrowRight, ShoppingCart, Heart, Eye, Timer } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { resolveImageUrl } from "@/lib/utils"
import { useCurrency } from "@/providers/CurrencyProvider"

interface FlashSaleSectionProps {
  section: any
}

export function FlashSaleSection({ section }: FlashSaleSectionProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number }>({ hours: 0, minutes: 0, seconds: 0 })
  const config = section.config || {}
  const { convertPrice } = useCurrency()

  useEffect(() => {
    setLoading(true)
    // Fetch products marked as flash sale
    productsApi.getAll({
      take: config.limit || 4,
      isFlashSale: true,
    }).then(res => {
      if (res.data?.data) {
        setProducts(res.data.data)
      }
      setLoading(false)
    })
  }, [config.limit])

  useEffect(() => {
    if (!config.endTime) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(config.endTime).getTime()
      const distance = end - now

      if (distance < 0) {
        clearInterval(timer)
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [config.endTime])

  if (loading) {
    return (
      <div className="container-custom py-12 md:py-24">
        <div className="h-10 w-48 bg-slate-100 animate-pulse rounded-lg mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="aspect-[3/4] bg-slate-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    // If we are in admin mode or just want to show something instead of empty
    return (
      <section className="py-12 bg-slate-50/50 border-y border-slate-100">
        <div className="container-custom text-center py-12">
          <Timer className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">{section.title || "Flash Sale"}</h2>
          <p className="text-slate-400 text-sm mt-2">No active flash sale products found. Mark products as "isFlashSale" in the admin panel to show them here.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 md:py-24 overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Live Offers
            </div>
            <h2 className="text-3xl md:text-6xl font-black text-slate-900 uppercase tracking-tight leading-none">
              {section.title || "Flash Sale"}
            </h2>
            <p className="text-slate-500 text-sm md:text-lg font-medium max-w-xl">
              {section.subtitle || "Incredible deals on top-tier tech. Grab them before they're gone!"}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {timeLeft.hours + timeLeft.minutes + timeLeft.seconds > 0 ? (
              <div className="flex items-center gap-2 bg-slate-900 text-white px-6 py-4 rounded-3xl shadow-xl">
                <Timer className="h-5 w-5 text-primary" />
                <div className="flex items-center gap-3 font-mono text-xl md:text-2xl font-black">
                  <div className="flex flex-col items-center">
                    <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] uppercase tracking-widest opacity-50 -mt-1">Hrs</span>
                  </div>
                  <span className="text-primary animate-pulse">:</span>
                  <div className="flex flex-col items-center">
                    <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] uppercase tracking-widest opacity-50 -mt-1">Min</span>
                  </div>
                  <span className="text-primary animate-pulse">:</span>
                  <div className="flex flex-col items-center">
                    <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                    <span className="text-[8px] uppercase tracking-widest opacity-50 -mt-1">Sec</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-600 text-white px-6 py-4 rounded-3xl shadow-xl font-black uppercase tracking-widest text-sm">
                Sale Ended
              </div>
            )}
            <Link href={section.link || "/flash-sales"} className="hidden md:flex h-14 w-14 items-center justify-center rounded-full border-2 border-slate-100 hover:border-primary hover:text-primary transition-all group">
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {products.map((product) => {
            const discount = product.salePrice 
              ? Math.round((1 - (parseFloat(product.salePrice) / parseFloat(product.price))) * 100)
              : Math.round((1 - (parseFloat(product.flashSalePrice || product.price) / parseFloat(product.price))) * 100);

            const isEnded = timeLeft.hours + timeLeft.minutes + timeLeft.seconds <= 0;

            return (
              <div key={product.id} className={`group relative bg-white rounded-[2.5rem] border-2 border-slate-50 overflow-hidden hover:border-primary/20 hover:shadow-2xl transition-all duration-500 ${isEnded ? 'opacity-75 grayscale-[0.5]' : ''}`}>
                <div className="aspect-square relative overflow-hidden bg-slate-50/50">
                  <img 
                    src={resolveImageUrl(product.images?.[0]?.url)} 
                    alt={product.name}
                    className="w-full h-full object-contain p-8 group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {discount > 0 && (
                    <div className="absolute top-6 left-6 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg z-10">
                      -{discount}% OFF
                    </div>
                  )}

                  <div className="absolute top-6 right-6 flex flex-col gap-2 translate-x-16 group-hover:translate-x-0 transition-transform duration-500 z-10">
                    <button className="h-10 w-10 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:scale-110 transition-all">
                      <Heart className="h-5 w-5" />
                    </button>
                    <button className="h-10 w-10 rounded-full bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-primary hover:scale-110 transition-all">
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>

                  {isEnded && (
                    <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-20">
                      <span className="bg-slate-900 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Ended</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{product.category?.name}</p>
                    <Link href={`/product/${product.slug}`} className="block">
                      <h3 className="font-bold text-slate-900 text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                  </div>

                  <div className="flex items-end justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 line-through font-bold">
                        {convertPrice(parseFloat(product.price)).formatted}
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        {convertPrice(parseFloat(product.flashSalePrice || product.salePrice || product.price)).formatted}
                      </span>
                    </div>
                    <Button 
                      disabled={isEnded}
                      size="icon" 
                      className={`h-12 w-12 rounded-2xl ${isEnded ? 'bg-slate-300' : 'bg-slate-900 hover:bg-primary shadow-lg shadow-slate-900/10'} transition-all hover:-translate-y-1`}
                    >
                      <ShoppingCart className="h-5 w-5 text-white" />
                    </Button>
                  </div>

                  {/* Stock progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tight">
                      <span className="text-slate-400">Available: {product.stockCurrent || 10}</span>
                      <span className="text-red-500">Limited Stock</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${isEnded ? 'bg-slate-300' : 'bg-red-500'} rounded-full`}
                        style={{ width: `${((product.stockCurrent || 10) / (product.stockTotal || 50)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div className="mt-12 md:hidden">
          <Link href={section.link || "/flash-sales"} className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 rounded-2xl text-slate-900 font-black uppercase tracking-widest text-xs">
            {section.linkText || "View All Offers"} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
