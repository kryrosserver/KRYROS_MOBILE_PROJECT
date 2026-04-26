"use client"

import React from "react"
import Link from "next/link"
import { motion } from "framer-motion"

interface BannerGridProps {
  section: any
}

export function BannerGrid({ section }: BannerGridProps) {
  const config = section.config || {}
  const items = config.items || []
  const layout = config.layout || '2-cols'
  const gap = config.gap || '4'

  const getGridClass = () => {
    switch (layout) {
      case '2-cols': return 'grid-cols-1 md:grid-cols-2'
      case '3-cols': return 'grid-cols-1 md:grid-cols-3'
      case '1-2-split': return 'grid-cols-1 md:grid-cols-3'
      default: return 'grid-cols-1 md:grid-cols-2'
    }
  }

  const getGapClass = () => {
    switch (gap) {
      case '2': return 'gap-2'
      case '4': return 'gap-4'
      case '8': return 'gap-8'
      default: return 'gap-4'
    }
  }

  return (
    <div className="container-custom py-6 md:py-10">
      {(section.title || section.subtitle) && (
        <div className="mb-6 text-center">
          {section.title && <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight mb-1">{section.title}</h2>}
          {section.subtitle && <p className="text-sm md:text-base text-slate-500 font-medium">{section.subtitle}</p>}
        </div>
      )}
      
      <div className={`grid ${getGridClass()} ${getGapClass()}`}>
        {items.map((item: any, idx: number) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className={`relative aspect-[16/9] md:aspect-auto md:h-64 rounded-3xl overflow-hidden group border-2 border-slate-50 ${
              layout === '1-2-split' && idx === 0 ? 'md:col-span-2' : ''
            }`}
          >
            <Link href={item.link || '#'}>
              <img 
                src={item.imageUrl} 
                alt={`Promo ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
