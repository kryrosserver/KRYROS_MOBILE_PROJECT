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

import { Filter, SlidersHorizontal, Search as SearchIcon } from "lucide-react";

export default async function ShopPage({ searchParams }: { searchParams?: { [key: string]: string } }) {
  const featured = (searchParams?.featured || "").toLowerCase() === "true";
  const credit = (searchParams?.credit || "").toLowerCase() === "true";
  
  const [groupedData, categories, sections] = await Promise.all([
    getGroupedProducts(featured, credit),
    getCategories(),
    getCmsSections()
  ]);

  const catSection = sections.find((s: any) => s.type === "categories" && s.isActive);
  
  let title = "All Products";
  if (featured) title = "Featured Products";
  if (credit) title = "Installment Products";

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col items-center justify-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase text-center">
          {catSection?.title || title}
        </h1>
      </div>

      <CategoryGrid categories={categories} />

      {/* Fast Filters Section - Perfectly Centered */}
      <div className="mb-12">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-6">Fast Filters:</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {[
            { label: "FEATURED", icon: "🟡" },
            { label: "BEST SELLERS", icon: "🔥" },
            { label: "TOP RATED", icon: "⭐" },
            { label: "SELECT COLOR", icon: null },
            { label: "SELECT STORAGE", icon: null },
          ].map((f) => (
            <button key={f.label} className="px-5 py-2.5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2">
              {f.icon && <span>{f.icon}</span>}
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sorting and Filter Bar */}
      <div className="flex items-center justify-between mb-10 border-b border-slate-100 pb-6">
        <button className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-xl font-black text-xs border border-blue-100 hover:bg-blue-100 transition-all">
          <Filter className="h-4 w-4" />
          FILTER
          <SlidersHorizontal className="ml-2 h-3.5 w-3.5 opacity-50" />
        </button>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer group">
            <span className="text-[11px] font-black text-slate-500 group-hover:text-slate-900 transition-colors uppercase">Default sorting</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <SearchIcon className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-900 transition-colors" />
        </div>
      </div>

      <ShopContent groupedData={groupedData} />
    </div>
  );
}
