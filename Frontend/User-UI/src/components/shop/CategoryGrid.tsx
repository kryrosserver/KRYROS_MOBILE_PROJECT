"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

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
  if (!categories || categories.length === 0) return null;

  return (
    <div className="mb-20">
      {/* Perfectly Centered Horizontal Scroll Container */}
      <div className="flex overflow-x-auto pb-8 gap-4 scrollbar-hide min-[400px]:justify-center px-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative flex-shrink-0 w-32 md:w-40 flex flex-col items-center snap-center"
          >
            {/* Professional Card Design - Matches Image */}
            <div className="relative w-full aspect-[4/5] bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-slate-200">
              {/* Blue Count Badge - Positioned Top Left */}
              <div className="absolute top-2 left-2 z-10 bg-[#3b82f6] text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-sm">
                {category._count?.products || 0}
              </div>

              {/* Category Content */}
              <div className="flex flex-col h-full">
                {/* Image Area */}
                <div className="flex-1 relative w-full p-4 flex items-center justify-center">
                  <Image
                    src={category.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop"}
                    alt={category.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                
                {/* Name Area - Inside Card at Bottom */}
                <div className="py-3 px-2 text-center border-t border-slate-50">
                  <span className="text-[11px] md:text-xs font-bold text-slate-700 uppercase tracking-tight line-clamp-1">
                    {category.name}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
