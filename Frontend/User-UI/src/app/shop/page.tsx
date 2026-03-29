import Link from "next/link";
import { ProductCard } from "@/components/home/ProductCard";
import { ShopContent } from "@/components/shop/ShopContent";
import { CategoryGrid } from "@/components/shop/CategoryGrid";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend-hxfp.onrender.com/api";

async function getCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}

async function getGroupedProducts(featured: boolean, credit: boolean) {
  try {
    const url = new URL(`${API_URL}/products/grouped`);
    if (featured) url.searchParams.set("featured", "true");
    if (credit) url.searchParams.set("allowCredit", "true");
    // Explicitly hide wholesale products from main shop
    url.searchParams.set("isWholesaleOnly", "false");
    
    const res = await fetch(url.toString(), { 
      next: { revalidate: 600 } // Cache for 10 minutes
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}

async function getCmsSections() {
  try {
    const res = await fetch(`${API_URL}/cms/sections`, { 
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.data || []);
  } catch (e) {
    console.error("Fetch error:", e);
    return [];
  }
}

import { Filter, SlidersHorizontal, Search as SearchIcon, ChevronDown } from "lucide-react";

export default async function ShopPage({ searchParams }: { searchParams?: { [key: string]: string } }) {
  const featured = (searchParams?.featured || "").toLowerCase() === "true";
  const credit = (searchParams?.credit || "").toLowerCase() === "true";
  
  const [groupedData, categories, sections] = await Promise.all([
    getGroupedProducts(featured, credit),
    getCategories(),
    getCmsSections()
  ]);

  const catSection = sections.find((s: any) => s.type === "categories" && s.isActive);
  const filterSection = sections.find((s: any) => s.type === "fast_filters" && s.isActive);
  
  const categoryParam = searchParams?.category;
  const activeCategory = (categories as any[]).find((c: any) => c.slug === categoryParam);

  let title = "All Products";
  if (featured) title = "Featured Products";
  if (credit) title = "Installment Products";
  if (activeCategory) title = activeCategory.name;

  return (
    <div className="py-6 md:py-8">
      {/* Title & Category Section - Light Background, Grouped & Centered */}
      <div className="bg-slate-50/50 py-6 md:py-10 mb-6 md:mb-8 border-b border-slate-100">
        <div className="container-custom px-3 md:px-4">
          <div className="flex flex-col items-center justify-center mb-6 md:mb-8">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight uppercase text-center">
              {activeCategory ? activeCategory.name : "ALL PRODUCTS"}
            </h1>
          </div>
          <CategoryGrid categories={categories} />
        </div>
      </div>

      <div className="container-custom px-3 md:px-6">
        {/* Filter Section - Matches Reference Exactly */}
        <div className="mb-10 space-y-8">
          {/* 1. Fast Filters */}
          {filterSection && (
            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Fast Filters:
              </p>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {(filterSection.config?.items || [])
                  .filter((f: any) => f.isActive && !['SELECT COLOR', 'SELECT STORAGE'].includes(f.label.toUpperCase()))
                  .map((f: any) => (
                  <button key={f.label} className="whitespace-nowrap px-5 py-2.5 bg-white border border-slate-200 rounded-full text-[11px] font-bold text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2 uppercase">
                    {f.icon && <span className="text-base">{f.icon}</span>}
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Action Bar: Filter, Sorting, Search */}
          <div className="flex items-center justify-between gap-4 py-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 bg-[#f0f7ff] text-[#2563eb] border border-[#dbeafe] px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#dbeafe] transition-all shadow-sm">
                Filter
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              {activeCategory && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active:</span>
                  <span className="text-xs font-bold text-slate-700 uppercase">{activeCategory.name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 md:gap-8">
              <div className="flex items-center gap-1.5 cursor-pointer group">
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors whitespace-nowrap">Default sorting</span>
                <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
              <SearchIcon className="h-5 w-5 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" />
            </div>
          </div>
        </div>

        <ShopContent groupedData={groupedData} />
      </div>
    </div>
  );
}
