"use client"

import React from "react"
import { motion } from "framer-motion"
import { HeroSlider } from "./HeroSlider"
import { TrustBadges } from "./TrustBadges"
import { CategoriesGrid } from "./CategoriesGrid"
import { ProductGridSection } from "./ProductGridSection"
import { FlashSaleSection } from "./FlashSaleSection"
import { CreditSection } from "./CreditSection"
import { BannerGrid } from "./BannerGrid"

interface SectionProps {
  section: any
  banners?: any[]
}

const animations: Record<string, any> = {
  fadeIn: {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    transition: { duration: 0.8 }
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  },
  zoomIn: {
    initial: { opacity: 0, scale: 0.9 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  },
  slideInLeft: {
    initial: { opacity: 0, x: -50 },
    whileInView: { opacity: 1, x: 0 },
    transition: { duration: 0.6 }
  }
}

export function DynamicSection({ section, banners }: SectionProps) {
  const { type, backgroundColor, textColor, animation, config } = section
  
  const animationProps = animations[animation] || {}

  const renderContent = () => {
    switch (type) {
      case 'HeroSlider':
        return <HeroSlider section={section} banners={banners} />
      case 'TrustBadges':
        return <TrustBadges section={section} />
      case 'CategoriesGrid':
        return <CategoriesGrid section={section} />
      case 'ProductGrid':
      case 'FeaturedCategory':
        return <ProductGridSection section={section} />
      case 'FlashSale':
        return <FlashSaleSection section={section} />
      case 'BannerGrid':
        return <BannerGrid section={section} />
      case 'CreditSection':
        return <CreditSection section={section} />
      case 'TextBlock':
        return (
          <div className="container-custom py-12 md:py-24 text-center">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-4">{section.title}</h2>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">{section.subtitle}</p>
            {section.description && <div className="mt-8 prose prose-lg max-w-none mx-auto" dangerouslySetInnerHTML={{ __html: section.description }} />}
          </div>
        )
      default:
        return null
    }
  }

  return (
    <motion.section
      {...animationProps}
      viewport={{ once: true, margin: "-100px" }}
      style={{ 
        backgroundColor: backgroundColor || 'transparent',
        color: textColor || 'inherit'
      }}
      className="relative overflow-hidden"
    >
      {renderContent()}
    </motion.section>
  )
}
