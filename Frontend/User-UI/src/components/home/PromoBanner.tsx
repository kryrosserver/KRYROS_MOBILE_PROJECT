"use client";

import React from "react";
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

  return (
    <div className="py-6 md:py-10 overflow-hidden">
      <div className="relative group">
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          navigation={{
            nextEl: '.promo-next',
            prevEl: '.promo-prev',
          }}
          pagination={{
            clickable: true,
            bulletActiveClass: 'swiper-pagination-bullet-active bg-blue-600 w-6 rounded-full'
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={displayItems.length > 1}
          centeredSlides={true}
          slidesPerView={1.1}
          spaceBetween={16}
          breakpoints={{
            768: {
              slidesPerView: 1.2,
              spaceBetween: 24,
            },
            1200: {
              slidesPerView: 1.3,
              spaceBetween: 30,
            }
          }}
          className="promo-swiper !overflow-visible"
        >
          {displayItems.map((item: any, index: number) => (
            <SwiperSlide key={index} className="transition-opacity duration-300 opacity-40 [&.swiper-slide-active]:opacity-100">
              <div className="relative aspect-[16/9] md:aspect-[21/9] w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl">
                <img
                  src={resolveImageUrl(item.imageUrl)}
                  alt={item.title || "Promo"}
                  className="w-full h-full object-cover"
                />
                
                {/* Reference-Style Text and Button Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-16">
                  {/* Top content - optional title/subtitle */}
                  <div className="max-w-2xl">
                    {item.title && (
                      <h2 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-lg leading-none">
                        {item.title}
                      </h2>
                    )}
                  </div>

                  {/* Bottom content - Shop Now button */}
                  <div className="flex justify-start">
                    {item.link && (
                      <Link href={item.link}>
                        <button className="bg-white/90 hover:bg-white text-slate-900 font-black uppercase tracking-widest text-[10px] md:text-xs px-10 md:px-14 py-3 md:py-4 rounded-full transition-all transform hover:scale-105 shadow-xl">
                          {item.linkText || "Shop Now"}
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
          <div className="absolute inset-x-[5%] top-1/2 -translate-y-1/2 z-20 flex justify-between pointer-events-none">
            <button className="promo-prev pointer-events-auto w-10 h-10 md:w-12 md:h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all shadow-xl -ml-5 md:-ml-6">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="promo-next pointer-events-auto w-10 h-10 md:w-12 md:h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all shadow-xl -mr-5 md:-mr-6">
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
