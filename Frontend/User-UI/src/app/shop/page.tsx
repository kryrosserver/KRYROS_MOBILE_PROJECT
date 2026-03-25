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
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 border-b pb-6 border-slate-100">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{catSection?.title || title}</h1>
          <p className="text-slate-500 mt-2 font-medium">{catSection?.subtitle || "Browse our premium collection by category and brand"}</p>
        </div>
        <div className="flex items-center bg-slate-100/80 p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <Link 
            href="/shop" 
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${!featured && !credit ? "bg-white text-green-600 shadow-md" : "text-slate-600 hover:text-slate-900"}`}
          >
            All Shop
          </Link>
          <Link 
            href="/shop?featured=true" 
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${featured ? "bg-white text-green-600 shadow-md" : "text-slate-600 hover:text-slate-900"}`}
          >
            Featured
          </Link>
          <Link 
            href="/shop?credit=true" 
            className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${credit ? "bg-white text-green-600 shadow-md" : "text-slate-600 hover:text-slate-900"}`}
          >
            Installments
          </Link>
        </div>
      </div>

      <CategoryGrid categories={categories} />

      <ShopContent groupedData={groupedData} />
    </div>
  );
}
