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
    <div className="w-full flex justify-center">
      {/* Centered Horizontal Scroll Container */}
      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide justify-start md:justify-center px-4 max-w-full">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative flex-shrink-0 w-28 md:w-36 flex flex-col items-center pt-3"
          >
            {/* Professional Card Design - Matches Reference Image */}
            <div className="relative w-full aspect-[4/5] bg-white rounded-lg overflow-visible border border-slate-200 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-blue-200">
              {/* Blue Count Badge - Positioned Top Left, overlapping the card border */}
              <div className="absolute -top-2 -left-2 z-20 bg-[#3b82f6] text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full shadow-lg border-2 border-white ring-1 ring-blue-600/10">
                {category._count?.products || 0}
              </div>

              {/* Category Content */}
              <div className="flex flex-col h-full overflow-hidden rounded-lg">
                {/* Image Area */}
                <div className="flex-1 relative w-full p-3 flex items-center justify-center bg-white group-hover:bg-slate-50/30 transition-colors">
                  <div className="relative w-full h-full">
                    <Image
                      src={category.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop"}
                      alt={category.name}
                      fill
                      className="object-contain p-1 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </div>
                
                {/* Name Area - Inside Card at Bottom */}
                <div className="py-2.5 px-2 text-center border-t border-slate-100 bg-white">
                  <span className="text-[10px] md:text-[11px] font-bold text-slate-600 uppercase tracking-tight line-clamp-1 transition-colors group-hover:text-blue-600">
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
