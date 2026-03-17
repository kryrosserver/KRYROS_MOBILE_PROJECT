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
    <div className="mb-12 relative">
      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative flex-shrink-0 w-28 md:w-32 bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 aspect-square snap-start"
          >
            {/* Blue Count Badge */}
            <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-lg border border-white/20">
              {category._count?.products || 0}
            </div>

            {/* Category Image */}
            <div className="relative w-full h-full p-3 flex items-center justify-center bg-slate-50/50 group-hover:bg-white transition-colors">
              <div className="relative w-full h-full">
                <Image
                  src={category.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop"}
                  alt={category.name}
                  fill
                  className="object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            {/* Category Name Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
              <span className="text-[10px] font-bold text-white uppercase tracking-tight block text-center truncate">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
