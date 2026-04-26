"use client"

import React, { useEffect, useState, useRef } from "react"
import { productsApi } from "@/lib/api"
import { ArrowRight, Timer } from "lucide-react"
import Link from "next/link"
import { ProductCard } from "./ProductCard"

interface FlashSaleSectionProps {
  section: any
}

export function FlashSaleSection({ section }: FlashSaleSectionProps) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number }>({ hours: 0, minutes: 0, seconds: 0 })
  const config = section.config || {}
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
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
      <div className="container-custom py-4 md:py-8">
        <div className="h-8 w-48 bg-slate-100 animate-pulse rounded-lg mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="min-w-[160px] md:min-w-[280px] aspect-[3/4] bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <section className="py-6 bg-slate-50/50 border-y border-slate-100">
        <div className="container-custom text-center py-6">
          <Timer className="h-10 w-10 text-slate-200 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-slate-400 uppercase tracking-widest">{section.title || "Flash Sale"}</h2>
          <p className="text-slate-400 text-xs mt-1">No active flash sale products found.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-6 md:py-12 overflow-hidden">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[9px] font-black uppercase tracking-widest">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
              </span>
              Live Offers
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tight leading-none">
              {section.title || "Flash Sale"}
            </h2>
            <p className="text-slate-500 text-xs md:text-base font-medium max-w-xl">
              {section.subtitle || "Incredible deals on top-tier tech. Grab them before they're gone!"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {timeLeft.hours + timeLeft.minutes + timeLeft.seconds > 0 ? (
              <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-lg">
                <Timer className="h-4 w-4 text-primary" />
                <div className="flex items-center gap-2 font-mono text-base md:text-lg font-black">
                  <div className="flex flex-col items-center">
                    <span>{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className="text-[7px] uppercase tracking-widest opacity-50 -mt-0.5">Hrs</span>
                  </div>
                  <span className="text-primary animate-pulse">:</span>
                  <div className="flex flex-col items-center">
                    <span>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className="text-[7px] uppercase tracking-widest opacity-50 -mt-0.5">Min</span>
                  </div>
                  <span className="text-primary animate-pulse">:</span>
                  <div className="flex flex-col items-center">
                    <span>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                    <span className="text-[7px] uppercase tracking-widest opacity-50 -mt-0.5">Sec</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-600 text-white px-4 py-3 rounded-2xl shadow-lg font-black uppercase tracking-widest text-[10px]">
                Sale Ended
              </div>
            )}
            <Link href={section.link || "/flash-sales"} className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-slate-100 hover:border-primary hover:text-primary transition-all group">
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto pb-6 gap-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-[160px] w-[160px] md:min-w-[280px] md:w-[280px] snap-start flex flex-col h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
