"use client"

import Link from "next/link"
import { Filter, ChevronRight } from "lucide-react"
import { CategoryGrid } from "./CategoryGrid"

interface ShopHeadingProps {
  categories: any[]
  selectedCategory?: string | null
  onCategorySelect?: (categoryId: string | null) => void
}

export function ShopHeading({ categories, selectedCategory, onCategorySelect }: ShopHeadingProps) {
  const selectedCategoryName = selectedCategory 
    ? categories.find(c => c.id === selectedCategory)?.name 
    : null

  return (
    <div className="bg-gradient-to-b from-white via-white to-slate-50/50 border-b border-slate-200">
      <div className="container-custom space-y-8 py-8 md:py-14">
        {/* Main Title Section */}
        <div className="space-y-4">
          <div className="flex items-end gap-4">
            <div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 uppercase tracking-tight leading-tight">
                {selectedCategoryName ? selectedCategoryName : "All Products"}
              </h1>
              <div className="h-1.5 w-24 md:w-32 bg-gradient-to-r from-blue-600 to-primary rounded-full mt-4"></div>
            </div>
          </div>

          {/* Dynamic Subtitle */}
          <p className="text-slate-600 font-medium text-sm md:text-base max-w-3xl leading-relaxed">
            {selectedCategoryName
              ? `Explore our premium collection of ${selectedCategoryName}. Find the perfect product that meets your needs with our expertly curated selection.`
              : "Discover our complete collection of premium electronics and devices. Browse by category to find exactly what you're looking for."}
          </p>
        </div>

        {/* Category Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary"></div>
            <h2 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-500">
              Browse by Category
            </h2>
          </div>
          
          {/* Category Cards */}
          <div className="py-4">
            <CategoryGrid categories={categories} />
          </div>
        </div>

        {/* Fast Filters & Tools Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Left: Fast Filters */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 inline-flex items-center whitespace-nowrap">
                <Filter className="h-3 w-3 mr-2" /> Quick Filter:
              </span>

              {/* Featured Filter */}
              <button className="group flex items-center gap-2 px-3 md:px-4 py-2 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:shadow-md">
                <span className="group-hover:scale-110 transition-transform">◆</span>
                <span className="hidden sm:inline">Featured</span>
                <span className="sm:hidden">Featured</span>
              </button>

              {/* Best Sellers Filter */}
              <button className="group flex items-center gap-2 px-3 md:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:shadow-md">
                <span className="group-hover:scale-110 transition-transform">🔥</span>
                <span className="hidden sm:inline">Best Sellers</span>
                <span className="sm:hidden">Sellers</span>
              </button>

              {/* Top Rated Filter */}
              <button className="group flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-200 hover:shadow-md">
                <span className="group-hover:scale-110 transition-transform">⭐</span>
                <span className="hidden sm:inline">Top Rated</span>
                <span className="sm:hidden">Rated</span>
              </button>
            </div>

            {/* Right: View Toggle (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
              <button className="h-9 px-3 rounded-lg bg-white shadow-sm text-slate-700 hover:text-primary flex items-center justify-center transition-colors">
                <span className="text-xs font-bold">≡≡</span>
              </button>
              <button className="h-9 px-3 rounded-lg text-slate-500 hover:text-primary flex items-center justify-center transition-colors">
                <span className="text-xs font-bold">⊞⊞</span>
              </button>
            </div>
          </div>

          {/* Secondary Filters - Mobile Optimized */}
          <div className="flex flex-wrap gap-2 items-stretch pt-2 md:pt-1">
            <button className="flex-1 sm:flex-none h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group">
              <span>🎨</span>
              <span className="hidden xs:inline">Color</span>
            </button>
            <button className="flex-1 sm:flex-none h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group">
              <span>💾</span>
              <span className="hidden xs:inline">Storage</span>
            </button>
            <button className="flex-1 sm:flex-none h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 group">
              <span>🔍</span>
              <span className="hidden xs:inline">More</span>
            </button>
            <button className="flex-1 sm:flex-none h-10 px-4 bg-white border-2 border-slate-300 hover:border-primary text-slate-700 hover:text-primary rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1 group md:ml-auto">
              <Filter className="h-3 w-3" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Mobile Category Info */}
        {selectedCategoryName && (
          <div className="md:hidden flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="h-6 w-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
              ✓
            </div>
            <span className="text-xs text-slate-700 font-medium">
              Viewing <span className="font-bold text-blue-700">{selectedCategoryName}</span> category
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
