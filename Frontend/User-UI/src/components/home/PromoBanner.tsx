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
            1024: { slidesPerView: 2.2, spaceBetween: 30 }
          }}
          className="promo-swiper !overflow-visible"
        >
          {displayItems.map((item: any, index: number) => (
            <SwiperSlide key={index} className="transition-all duration-500 opacity-40 [&.swiper-slide-active]:opacity-100 [&.swiper-slide-active]:scale-105 py-8">
              <div className="relative aspect-[4/5] md:aspect-[16/10] w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-slate-100 group">
                <img
                  src={resolveImageUrl(item.imageUrl)}
                  alt={item.title || "Promo"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Reference-Style Text and Button Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-10 md:p-16 bg-gradient-to-t from-black/60 via-transparent to-black/20">
                  {/* Top content */}
                  <div className="space-y-2">
                    {item.title && (
                      <h2 className="text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-[0.9] drop-shadow-2xl">
                        {item.title.split(' ').map((word: string, i: number) => (
                          <span key={i} className="block">{word}</span>
                        ))}
                      </h2>
                    )}
                  </div>

                  {/* Bottom content */}
                  <div className="flex flex-col items-center md:items-start gap-6">
                    {item.link && (
                      <Link href={item.link} className="inline-block">
                        <button className="bg-white hover:bg-blue-600 hover:text-white text-slate-900 font-black uppercase tracking-[0.25em] text-[10px] md:text-xs px-12 py-5 rounded-full transition-all duration-300 shadow-xl active:scale-95">
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
          <div className="absolute inset-x-[2%] md:inset-x-[5%] top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
            <button className="promo-prev pointer-events-auto w-12 h-12 md:w-16 md:h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-2xl active:scale-90 border-4 border-white/10">
              <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" />
            </button>
            <button className="promo-next pointer-events-auto w-12 h-12 md:w-16 md:h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center transition-all shadow-2xl active:scale-90 border-4 border-white/10">
              <ChevronRight className="w-8 h-8 md:w-10 md:h-10" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
