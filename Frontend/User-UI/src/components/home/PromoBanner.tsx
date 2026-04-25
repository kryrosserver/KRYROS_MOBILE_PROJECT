"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { resolveImageUrl } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PromoBannerProps {
  section: any;
}

export function PromoBanner({ section }: PromoBannerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Support for multiple items in config
  const items = section.config?.items || [];
  
  // If no items in config, fall back to the single image from the section itself
  const displayItems = items.length > 0 ? items : (section.imageUrl ? [{
    imageUrl: section.imageUrl,
    link: section.link,
    title: section.title,
    linkText: section.linkText || "Shop Now"
  }] : []);

  if (displayItems.length === 0) return null;
  if (!mounted) return <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-[2.5rem]" />;

  return (
    <div className="py-6 md:py-10 overflow-hidden bg-white">
      <div className="relative max-w-[1400px] mx-auto">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          navigation={{
            nextEl: '.promo-next',
            prevEl: '.promo-prev',
          }}
          pagination={{
            clickable: true,
            bulletActiveClass: '!bg-blue-600 !w-8 !rounded-full opacity-100'
          }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={displayItems.length > 1}
          centeredSlides={true}
          slidesPerView={1.2}
          spaceBetween={16}
          breakpoints={{
            640: { slidesPerView: 1.5, spaceBetween: 20 },
            1024: { slidesPerView: 2.5, spaceBetween: 30 }
          }}
          className="promo-swiper !overflow-visible"
        >
          {displayItems.map((item: any, index: number) => (
            <SwiperSlide key={index} className="transition-all duration-500 opacity-40 [&.swiper-slide-active]:opacity-100 [&.swiper-slide-active]:scale-105 py-8">
              <div className="relative aspect-[2/3] md:aspect-[3/4] w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-slate-100 group">
                <img
                  src={resolveImageUrl(item.imageUrl)}
                  alt={item.title || "Promo"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Reference-Style Text and Button Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-12 bg-gradient-to-t from-black/40 via-transparent to-black/10">
                  {/* Top content */}
                  <div className="text-center md:text-left">
                    {item.subtitle && (
                      <p className="text-[10px] md:text-xs font-black text-white/90 uppercase tracking-[0.3em] mb-2 drop-shadow-lg">
                        {item.subtitle}
                      </p>
                    )}
                    {item.title && (
                      <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter leading-[0.9] drop-shadow-2xl">
                        {item.title}
                      </h2>
                    )}
                  </div>

                  {/* Bottom content */}
                  <div className="flex justify-center md:justify-start">
                    {item.link && (
                      <Link href={item.link} className="w-full max-w-[200px]">
                        <button className="w-full bg-white hover:bg-blue-600 hover:text-white text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs py-4 md:py-5 rounded-full transition-all duration-300 shadow-xl active:scale-95">
                          {item.linkText || "SHOP NOW"}
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Reference-Style Blue Square Navigation Arrows */}
        {displayItems.length > 1 && (
          <div className="absolute inset-x-[1%] md:inset-x-[-2%] top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
            <button className="promo-prev pointer-events-auto w-10 h-10 md:w-14 md:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all shadow-2xl active:scale-90">
              <ChevronLeft className="w-6 h-6 md:w-8 h-8" />
            </button>
            <button className="promo-next pointer-events-auto w-10 h-10 md:w-14 md:h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all shadow-2xl active:scale-90">
              <ChevronRight className="w-6 h-6 md:w-8 h-8" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
