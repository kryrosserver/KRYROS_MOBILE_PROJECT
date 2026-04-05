"use client";

import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

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
    <div className="w-full relative px-4 sm:px-0 overflow-hidden">
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={16}
        slidesPerView="auto"
        centeredSlides={false}
        loop={categories.length > 5}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        className="category-swiper pt-2 pb-6"
        breakpoints={{
          320: { spaceBetween: 12 },
          640: { spaceBetween: 16 },
          768: { spaceBetween: 20 },
          1024: { spaceBetween: 24 },
        }}
      >
        {/* "All" Category Slide */}
        <SwiperSlide className="!w-[100px] sm:!w-32 md:!w-40 !p-1">
          <Link
            href="/shop"
            className={`group relative flex flex-col items-center transition-all ${
              !activeCategory ? "scale-105" : "hover:scale-105"
            }`}
          >
            <div className={`relative w-full aspect-[1/1.1] bg-white rounded-xl overflow-visible border transition-all duration-300 ${
              !activeCategory 
                ? "border-[#2A3A4A] shadow-lg ring-1 ring-[#2A3A4A]/20" 
                : "border-slate-100 shadow-sm group-hover:shadow-md group-hover:border-[#2A3A4A]/20"
            }`}>
              <div className={`absolute -top-1 -left-1 z-20 bg-[#2A3A4A] text-white text-[8px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white ${
                !activeCategory ? "scale-110" : ""
              }`}>
                ∞
              </div>
              <div className="flex flex-col h-full p-2 md:p-3">
                <div className="flex-1 relative w-full flex items-center justify-center">
                  <div className={`text-lg md:text-2xl font-black transition-colors ${
                    !activeCategory ? "text-[#2A3A4A]" : "text-slate-200 group-hover:text-[#2A3A4A]/30"
                  }`}>
                    ALL
                  </div>
                </div>
                <div className="text-center pt-1 md:pt-2">
                  <span className={`text-[10px] md:text-xs font-bold transition-colors block truncate ${
                    !activeCategory ? "text-[#2A3A4A]" : "text-slate-700 group-hover:text-[#2A3A4A]"
                  }`}>
                    All Products
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </SwiperSlide>

        {categories.map((category) => {
          const isActive = activeCategory === category.slug;
          return (
            <SwiperSlide key={category.id} className="!w-[100px] sm:!w-32 md:!w-40 !p-1">
              <Link
                href={`/shop?category=${category.slug}`}
                className={`group relative flex flex-col items-center transition-all ${
                  isActive ? "scale-105" : "hover:scale-105"
                }`}
              >
              <div className={`relative w-full aspect-[1/1.1] bg-white rounded-xl overflow-visible border transition-all duration-300 ${
                isActive 
                  ? "border-[#2A3A4A] shadow-lg ring-1 ring-[#2A3A4A]/20" 
                  : "border-slate-100 shadow-sm group-hover:shadow-md group-hover:border-[#2A3A4A]/20"
              }`}>
                <div className={`absolute -top-1 -left-1 z-20 bg-[#2A3A4A] text-white text-[8px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white ${
                  isActive ? "scale-110" : ""
                }`}>
                  {category._count?.products || 0}
                </div>
                <div className="flex flex-col h-full p-2 md:p-3">
                  <div className="flex-1 relative w-full flex items-center justify-center">
                    <div className="relative w-full h-[80%]">
                      <Image
                        src={category.image || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop"}
                        alt={category.name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                  </div>
                  <div className="text-center pt-1 md:pt-2">
                    <span className={`text-[10px] md:text-xs font-bold transition-colors block truncate ${
                      isActive ? "text-[#2A3A4A]" : "text-slate-700 group-hover:text-[#2A3A4A]"
                    }`}>
                      {category.name}
                    </span>
                  </div>
                </div>
              </div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <style jsx global>{`
        .category-swiper .swiper-slide {
          height: auto;
        }
      `}</style>
    </div>
  );
}
