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
    <div className="mb-12">
      <h2 className="text-xl font-bold text-slate-900 mb-6 uppercase tracking-wider flex items-center gap-2">
        <span className="w-8 h-1 bg-blue-600 rounded-full"></span>
        Browse Categories
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 aspect-square"
          >
            {/* Blue Count Badge */}
            <div className="absolute top-2 left-2 z-10 bg-blue-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full shadow-lg border border-white/20">
              {category._count?.products || 0}
            </div>

            {/* Category Image */}
            <div className="relative w-full h-full p-4 flex items-center justify-center bg-slate-50/50 group-hover:bg-white transition-colors">
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
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 pt-8">
              <span className="text-xs font-bold text-white uppercase tracking-wider block text-center truncate">
                {category.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
