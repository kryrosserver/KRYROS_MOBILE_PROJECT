"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Brand = {
  id: number;
  name: string;
  slug: string;
};

export function BrandNav({ brands, categorySlug, isSticky = true }: { brands: Brand[], categorySlug: string, isSticky?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  useEffect(() => {
    if (!isSticky) return; // Only track active section if sticky

    const handleScroll = () => {
      const sections = brands.map(b => document.getElementById(`${categorySlug}-${b.slug}`));
      let currentActive = null;
      
      for (const section of sections) {
        if (!section) continue;
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) { // Threshold for active section
          currentActive = section.id.replace(`${categorySlug}-`, '');
        }
      }
      setActiveBrand(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [brands, categorySlug, isSticky]);

  const scrollToBrand = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    const element = document.getElementById(`${categorySlug}-${slug}`);
    if (element) {
      const offset = 140; // Header + BrandNav offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  if (brands.length <= 1) return null;

  return (
    <div className={`${isSticky ? "sticky top-[72px] md:top-[80px] z-20" : "relative"} bg-white/95 backdrop-blur-md border-b border-slate-100 -mx-4 px-4 md:mx-0 md:px-0`}>
      <div className="container-custom px-0 flex items-center gap-4">
        <div className="hidden lg:flex items-center gap-2 pr-4 border-r border-slate-100 py-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Explore Brands:</span>
        </div>
        <div 
          ref={scrollRef}
          className="flex-1 flex items-center gap-3 py-4 overflow-x-auto no-scrollbar scroll-smooth justify-start md:justify-center lg:justify-start"
        >
          {brands.map((brand) => (
            <a
              key={brand.id}
              href={`#${categorySlug}-${brand.slug}`}
              onClick={(e) => scrollToBrand(e, brand.slug)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-wider transition-all shadow-sm border ${
                activeBrand === brand.slug
                  ? "bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-600/20"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {brand.name}
            </a>
          ))}
        </div>
      </div>
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
