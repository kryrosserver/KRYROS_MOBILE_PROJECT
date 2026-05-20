import { useState, useEffect } from "react";
import { Link } from "wouter";
import { ChevronRight } from "lucide-react";
import { fetchBrands } from "@/lib/api";
import type { ApiBrand } from "@/lib/api";

const BRAND_LOGOS: Record<string, React.ReactNode> = {
  Apple: (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current text-foreground" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  ),
  Samsung: <span className="text-[10px] font-black tracking-[0.15em] text-foreground uppercase leading-none">SAMSUNG</span>,
  Sony: <span className="text-sm font-black tracking-[0.2em] text-foreground uppercase leading-none">SONY</span>,
  Bose: <span className="text-sm font-black tracking-[0.15em] text-foreground uppercase leading-none">BOSE</span>,
  Nike: (
    <svg viewBox="0 0 60 24" className="w-12 h-5 fill-current text-foreground" xmlns="http://www.w3.org/2000/svg">
      <path d="M59.8 2.1L17.6 19.8c-3.5 1.4-6.4 1.9-8.8 1.4C6.4 20.7 4.6 19.4 3.4 17.5 2.2 15.6 2 13.2 2.8 10.5c.6-2.2 1.9-4.4 3.7-6.4C4.8 6.4 3.3 9.6 3.6 12.4c.1 1.5.7 2.8 1.7 3.8 1.6 1.6 4.1 2 7.2 1.2L59.8 2.1z" />
    </svg>
  ),
  Adidas: <span className="text-sm font-black tracking-[0.05em] text-foreground uppercase leading-none">adidas</span>,
  Dell: <span className="text-sm font-black tracking-[0.08em] text-blue-600 dark:text-blue-400 italic uppercase leading-none">DELL</span>,
  HP: <span className="text-sm font-black tracking-tight text-blue-700 dark:text-blue-300 lowercase leading-none">hp</span>,
  Xiaomi: <span className="text-sm font-black tracking-tight text-orange-500 leading-none">Mi</span>,
  Canon: <span className="text-sm font-black tracking-[0.05em] text-red-600 dark:text-red-400 leading-none">Canon</span>,
  LG: <span className="text-sm font-black tracking-[0.05em] text-red-600 dark:text-red-400 leading-none">LG</span>,
  Huawei: <span className="text-sm font-black tracking-tight text-red-600 leading-none">HUAWEI</span>,
};

function BrandLogo({ brand }: { brand: ApiBrand }) {
  if (BRAND_LOGOS[brand.name]) return <>{BRAND_LOGOS[brand.name]}</>;
  if (brand.logo) return <img src={brand.logo} alt={brand.name} className="max-w-[64px] max-h-[36px] object-contain" />;
  return <span className="text-xs font-black tracking-tight text-foreground uppercase leading-none text-center px-1">{brand.name}</span>;
}

export default function BrandsSection() {
  const [brands, setBrands] = useState<ApiBrand[]>([]);

  useEffect(() => {
    fetchBrands().then(setBrands);
  }, []);

  if (brands.length === 0) return null;

  return (
    <section className="py-5 md:py-6 border-t border-border">
      <div className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-xl font-black text-foreground">Top Brands</h2>
          <Link href="/shop">
            <span className="text-xs md:text-sm text-primary font-semibold cursor-pointer hover:underline flex items-center gap-0.5">
              View All Brands <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {brands.map((brand) => (
            <Link key={brand.id} href={`/shop?brand=${encodeURIComponent(brand.name)}`}>
              <div className="flex-shrink-0 w-[72px] h-[56px] bg-card border border-border rounded-xl flex items-center justify-center hover:border-primary/40 hover:shadow-md transition-all cursor-pointer px-2">
                <BrandLogo brand={brand} />
              </div>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex flex-wrap gap-3 mt-1">
          {brands.map((brand) => (
            <Link key={brand.id} href={`/shop?brand=${encodeURIComponent(brand.name)}`}>
              <div className="w-[88px] h-[60px] bg-card border border-border rounded-xl flex items-center justify-center hover:border-primary/40 hover:shadow-md transition-all cursor-pointer px-2">
                <BrandLogo brand={brand} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
