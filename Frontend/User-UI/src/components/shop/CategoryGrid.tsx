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
      {/* Centered Horizontal Scroll Container - Added pt-4 to prevent badge clipping */}
      <div className="flex overflow-x-auto pt-4 pb-6 gap-4 scrollbar-hide justify-start md:justify-center px-6 max-w-full">
        {/* "All" Category Option */}
        <Link
          href="/shop"
          className={`group relative flex-shrink-0 w-32 md:w-40 flex flex-col items-center transition-all ${
            !activeCategory ? "scale-105" : "hover:scale-105"
          }`}
        >
          <div className={`relative w-full aspect-[1/1.2] bg-white rounded-xl overflow-visible border-2 transition-all duration-300 ${
            !activeCategory 
              ? "border-blue-500 shadow-lg" 
              : "border-slate-50 shadow-sm group-hover:shadow-md group-hover:border-blue-200"
          }`}>
            <div className={`absolute -top-1.5 -left-1.5 z-20 bg-[#3b82f6] text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full shadow-md ${
              !activeCategory ? "bg-blue-600" : "bg-blue-500"
            }`}>
              ∞
            </div>
            <div className="flex flex-col h-full p-3">
              <div className="flex-1 relative w-full flex items-center justify-center">
                <div className={`text-2xl font-black transition-colors ${
                  !activeCategory ? "text-blue-600" : "text-slate-200 group-hover:text-blue-200"
                }`}>
                  ALL
                </div>
              </div>
              <div className="text-center pt-2">
                <span className={`text-xs md:text-sm font-bold transition-colors ${
                  !activeCategory ? "text-blue-600" : "text-slate-700 group-hover:text-blue-600"
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
              className={`group relative flex-shrink-0 w-32 md:w-40 flex flex-col items-center transition-all ${
                isActive ? "scale-105" : "hover:scale-105"
              }`}
            >
              {/* Clean White Card Style - Matches Image Exactly */}
              <div className={`relative w-full aspect-[1/1.2] bg-white rounded-xl overflow-visible border-2 transition-all duration-300 ${
                isActive 
                  ? "border-blue-500 shadow-lg" 
                  : "border-slate-50 shadow-sm group-hover:shadow-md group-hover:border-blue-200"
              }`}>
                {/* Blue Circular Badge - Top Left */}
                <div className="absolute -top-1.5 -left-1.5 z-20 bg-[#3b82f6] text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full shadow-md">
                  {category._count?.products || 0}
                </div>

                {/* Card Content */}
                <div className="flex flex-col h-full p-3">
                  {/* Image Container */}
                  <div className="flex-1 relative w-full flex items-center justify-center">
                    <div className="relative w-full h-[85%]">
                      <Image
                        src={category.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop"}
                        alt={category.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>
                  {/* Category Title - Centered at bottom */}
                  <div className="text-center pt-2">
                    <span className={`text-xs md:text-sm font-bold text-slate-700 transition-colors ${
                      isActive ? "text-blue-600" : "group-hover:text-blue-600"
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
