"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  _count?: {
    products: number;
  };
}

export function CategoryGrid({ categories }: { categories: Category[] }) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get('category');

  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full flex justify-center">
      {/* Centered Horizontal Scroll Container */}
      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide justify-start md:justify-center px-4 max-w-full">
        {/* "All" Category Option */}
        <Link
          href="/shop"
          className={`group relative flex-shrink-0 w-28 md:w-36 flex flex-col items-center pt-3 transition-all ${
            !activeCategory ? "scale-105" : "hover:scale-105"
          }`}
        >
          <div className={`relative w-full aspect-[4/5] bg-white rounded-lg overflow-visible border shadow-sm transition-all duration-300 ${
            !activeCategory 
              ? "border-blue-600 shadow-md ring-1 ring-blue-600/20" 
              : "border-slate-200 group-hover:shadow-md group-hover:border-blue-200"
          }`}>
            <div className={`absolute -top-2 -left-2 z-20 text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white ring-1 transition-all ${
              !activeCategory ? "bg-blue-700 ring-blue-700/30" : "bg-slate-400 ring-slate-400/10"
            }`}>
              ∞
            </div>
            <div className="flex flex-col h-full overflow-hidden rounded-lg">
              <div className={`flex-1 relative w-full p-3 flex items-center justify-center transition-colors ${
                !activeCategory ? "bg-blue-50/30" : "bg-white group-hover:bg-slate-50/30"
              }`}>
                <div className="text-2xl font-black text-slate-200 uppercase tracking-tighter group-hover:text-blue-200 transition-colors">
                  ALL
                </div>
              </div>
              <div className={`py-2.5 px-2 text-center border-t transition-colors ${
                !activeCategory ? "bg-blue-600 border-blue-600" : "bg-white border-slate-100"
              }`}>
                <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-tight line-clamp-1 transition-colors ${
                  !activeCategory ? "text-white" : "text-slate-600 group-hover:text-blue-600"
                }`}>
                  All Products
                </span>
              </div>
            </div>
          </div>
        </Link>

        {categories.map((category) => {
          const isActive = activeCategory === category.slug;
          return (
            <Link
              key={category.id}
              href={`/shop?category=${category.slug}`}
              className={`group relative flex-shrink-0 w-28 md:w-36 flex flex-col items-center pt-3 transition-all ${
                isActive ? "scale-105" : "hover:scale-105"
              }`}
            >
              {/* Professional Card Design - Matches Reference Image */}
              <div className={`relative w-full aspect-[4/5] bg-white rounded-lg overflow-visible border shadow-sm transition-all duration-300 ${
                isActive 
                  ? "border-blue-600 shadow-md ring-1 ring-blue-600/20" 
                  : "border-slate-200 group-hover:shadow-md group-hover:border-blue-200"
              }`}>
                {/* Blue Count Badge - Positioned Top Left, overlapping the card border */}
                <div className={`absolute -top-2 -left-2 z-20 text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white ring-1 transition-all ${
                  isActive ? "bg-blue-700 ring-blue-700/30" : "bg-[#3b82f6] ring-blue-600/10"
                }`}>
                  {category._count?.products || 0}
                </div>

                {/* Category Content */}
                <div className="flex flex-col h-full overflow-hidden rounded-lg">
                  {/* Image Area */}
                  <div className={`flex-1 relative w-full p-3 flex items-center justify-center transition-colors ${
                    isActive ? "bg-blue-50/30" : "bg-white group-hover:bg-slate-50/30"
                  }`}>
                    <div className="relative w-full h-full">
                      <Image
                        src={category.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop"}
                        alt={category.name}
                        fill
                        className="object-contain p-1 transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>
                  
                  {/* Name Area - Inside Card at Bottom */}
                  <div className={`py-2.5 px-2 text-center border-t transition-colors ${
                    isActive ? "bg-blue-600 border-blue-600" : "bg-white border-slate-100"
                  }`}>
                    <span className={`text-[10px] md:text-[11px] font-black uppercase tracking-tight line-clamp-1 transition-colors ${
                      isActive ? "text-white" : "text-slate-600 group-hover:text-blue-600"
                    }`}>
                      {category.name}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
