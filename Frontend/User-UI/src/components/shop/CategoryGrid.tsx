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
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={24}
        slidesPerView="auto"
        centeredSlides={false}
        loop={categories.length > 5}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        className="category-swiper pt-6 pb-10 px-8"
        breakpoints={{
          320: { slidesPerView: 2.5, spaceBetween: 16 },
          480: { slidesPerView: 3.2, spaceBetween: 16 },
          640: { slidesPerView: 4.2, spaceBetween: 20 },
          768: { slidesPerView: 5.2, spaceBetween: 24 },
          1024: { slidesPerView: 6.2, spaceBetween: 24 },
        }}
      >
        {/* "All" Category Slide */}
        <SwiperSlide className="!w-32 md:!w-40">
          <Link
            href="/shop"
            className={`group relative flex flex-col items-center transition-all ${
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
        </SwiperSlide>

        {categories.map((category) => {
          const isActive = activeCategory === category.slug;
          return (
            <SwiperSlide key={category.id} className="!w-32 md:!w-40">
              <Link
                href={`/shop?category=${category.slug}`}
                className={`group relative flex flex-col items-center transition-all ${
                  isActive ? "scale-105" : "hover:scale-105"
                }`}
              >
                <div className={`relative w-full aspect-[1/1.2] bg-white rounded-xl overflow-visible border-2 transition-all duration-300 ${
                  isActive 
                    ? "border-blue-500 shadow-lg" 
                    : "border-slate-50 shadow-sm group-hover:shadow-md group-hover:border-blue-200"
                }`}>
                  <div className="absolute -top-1.5 -left-1.5 z-20 bg-[#3b82f6] text-white text-[10px] font-black h-6 w-6 flex items-center justify-center rounded-full shadow-md">
                    {category._count?.products || 0}
                  </div>
                  <div className="flex flex-col h-full p-3">
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
            </SwiperSlide>
          );
        })}
      </Swiper>
      <style jsx global>{`
        .category-swiper .swiper-slide {
          height: auto;
        }
        .category-swiper {
          overflow: visible !important;
        }
      `}</style>
    </div>
  );
}
