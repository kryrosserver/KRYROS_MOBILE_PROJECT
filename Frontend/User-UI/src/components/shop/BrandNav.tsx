"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Brand = {
  id: number;
  name: string;
  slug: string;
};

export function BrandNav({ brands, categorySlug }: { brands: Brand[], categorySlug: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);

  useEffect(() => {
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
  }, [brands, categorySlug]);

  const scrollToBrand = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    const element = document.getElementById(`${categorySlug}-${slug}`);
    if (element) {
      const offset = 100; // Header offset
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
    <div className="sticky top-[72px] md:top-[80px] z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 -mx-4 px-4 md:mx-0 md:px-0">
      <div 
        ref={scrollRef}
        className="flex items-center gap-3 py-4 overflow-x-auto no-scrollbar scroll-smooth justify-start md:justify-center"
      >
        {brands.map((brand) => (
          <a
            key={brand.id}
            href={`#${categorySlug}-${brand.slug}`}
            onClick={(e) => scrollToBrand(e, brand.slug)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeBrand === brand.slug
                ? "bg-green-600 text-white shadow-md"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {brand.name}
          </a>
        ))}
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
