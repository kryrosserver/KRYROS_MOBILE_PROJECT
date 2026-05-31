import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { API_BASE } from "@/lib/api";

interface CmsBrand {
  name: string;
  logo: string;       // uploaded image URL or base64
  shopSlug: string;   // brand slug for /shop#brand-{shopSlug} scroll
}

const FALLBACK: CmsBrand[] = [];

export default function BrandsSection() {
  const [brands, setBrands] = useState<CmsBrand[]>(FALLBACK);

  useEffect(() => {
    // Fetch brand logos+slugs from CMS (completely independent of /api/brands)
    fetch(`${API_BASE}/api/cms/site-config/trusted-brands`, { cache: "no-store" })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d?.value?.items?.length) setBrands(d.value.items); })
      .catch(() => {});
  }, []);

  if (brands.length === 0) return null;

  const handleBrandClick = (brand: CmsBrand) => {
    // Navigate to shop page and auto-scroll to that brand section
    window.location.href = `/shop#brand-${brand.shopSlug}`;
  };

  return (
    <section className="py-5 md:py-6 border-t border-border">
      <div className="px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base md:text-xl font-black text-foreground">Top Brands</h2>
          <a href="/shop" className="text-xs md:text-sm text-primary font-semibold cursor-pointer hover:underline flex items-center gap-0.5">
            View All Brands <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:hidden" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {brands.map((brand, i) => (
            <button
              key={i}
              onClick={() => handleBrandClick(brand)}
              className="flex-shrink-0 bg-card border border-border rounded-xl flex flex-col items-center justify-center hover:border-primary/40 hover:shadow-md transition-all cursor-pointer px-4 py-2.5 min-w-[72px] gap-1.5"
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-[56px] max-h-[32px] object-contain"
                />
              ) : (
                <span className="text-xs font-bold text-foreground leading-tight whitespace-nowrap">{brand.name}</span>
              )}
              <span className="text-[10px] font-semibold text-muted-foreground leading-none">{brand.name}</span>
            </button>
          ))}
        </div>

        {/* Desktop: wrap grid */}
        <div className="hidden md:flex flex-wrap gap-3 mt-1">
          {brands.map((brand, i) => (
            <button
              key={i}
              onClick={() => handleBrandClick(brand)}
              className="bg-card border border-border rounded-xl flex flex-col items-center justify-center hover:border-primary/40 hover:shadow-md transition-all cursor-pointer px-5 py-3 min-w-[90px] gap-1.5"
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="max-w-[64px] max-h-[36px] object-contain"
                />
              ) : (
                <span className="text-sm font-bold text-foreground leading-tight whitespace-nowrap">{brand.name}</span>
              )}
              <span className="text-[10px] font-semibold text-muted-foreground leading-none">{brand.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
