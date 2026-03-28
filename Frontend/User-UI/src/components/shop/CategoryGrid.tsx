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
      <div className="flex overflow-x-auto pb-8 gap-6 scrollbar-hide snap-x snap-mandatory min-[400px]:justify-center px-4">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/shop?category=${category.slug}`}
            className="group relative flex-shrink-0 w-32 min-[400px]:w-36 md:w-44 flex flex-col items-center gap-4 snap-center text-center"
          >
            {/* Professional Card Design */}
            <div className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-blue-400 group-hover:-translate-y-1">
              {/* Blue Count Badge - Positioned Top Left */}
              <div className="absolute top-3 left-3 z-10 bg-blue-600 text-white text-[10px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                {category._count?.products || 0}
              </div>

              {/* Category Image */}
              <div className="relative w-full h-full p-4 flex items-center justify-center bg-slate-50/30 group-hover:bg-white transition-colors">
                <div className="relative w-full h-full">
                  <Image
                    src={category.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop"}
                    alt={category.name}
                    fill
                    className="object-contain transition-transform duration-500 group-hover:scale-110 p-2"
                  />
                </div>
              </div>
            </div>

            {/* Category Name - Below Card */}
            <span className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wide text-center transition-colors group-hover:text-blue-600">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
