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
    <div className="container-custom py-12">
      <div className="flex flex-col items-center justify-center mb-12">
        <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight uppercase text-center">
          {catSection?.title || title}
        </h1>
      </div>

      <CategoryGrid categories={categories} />

      <ShopContent groupedData={groupedData} />
    </div>
  );
}
