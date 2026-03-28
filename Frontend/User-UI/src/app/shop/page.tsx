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
  const activeCategory = categories.find(c => c.slug === categoryParam);

  let title = "All Products";
  if (featured) title = "Featured Products";
  if (credit) title = "Installment Products";
  if (activeCategory) title = activeCategory.name;

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col items-center justify-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase text-center">
          {activeCategory ? activeCategory.name : (catSection?.title || title)}
        </h1>
      </div>

      <CategoryGrid categories={categories} />

      {/* Filter Section - Matches Provided Design */}
      <div className="mb-12 space-y-8">
        {/* Action Bar: Filter, Sorting, Search */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-[#f0f7ff] text-[#2563eb] border border-[#dbeafe] px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-[#dbeafe] transition-all">
              Filter
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            {activeCategory && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active:</span>
                <span className="text-xs font-bold text-slate-700 uppercase">{activeCategory.name}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer group">
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">Default sorting</span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
            <SearchIcon className="h-5 w-5 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" />
          </div>
        </div>

        {/* Fast Filters */}
        {filterSection && (
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-700">
              Fast Filters:
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {(filterSection.config?.items || [])
                .filter((f: any) => f.isActive && !['SELECT COLOR', 'SELECT STORAGE'].includes(f.label.toUpperCase()))
                .map((f: any) => (
                <button key={f.label} className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-700 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2 uppercase">
                  {f.icon && <span>{f.icon}</span>}
                  {f.label}
                </button>
              ))}
              {/* Fallback hardcoded filters if dynamic ones aren't set */}
              {(!filterSection.config?.items || filterSection.config.items.length === 0) && (
                <>
                  <button className="px-5 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-700 flex items-center gap-2 uppercase shadow-sm">
                    🟡 FEATURED
                  </button>
                  <button className="px-5 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-700 flex items-center gap-2 uppercase shadow-sm">
                    🔥 BEST SELLERS
                  </button>
                  <button className="px-5 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-700 flex items-center gap-2 uppercase shadow-sm">
                    ⭐ TOP RATED
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <ShopContent groupedData={groupedData} />
    </div>
  );
}
