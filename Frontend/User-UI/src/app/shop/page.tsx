import Link from "next/link";
import { ProductCard } from "@/components/home/ProductCard";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend.onrender.com/api";

async function getProducts(featured: boolean) {
  if (featured) {
    const res = await fetch(`${API_URL}/products/featured`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  }
  const url = new URL(`${API_URL}/products`);
  url.searchParams.set("take", "24");
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data?.data) ? data.data : (Array.isArray(data?.products) ? data.products : []);
}

export default async function ShopPage({ searchParams }: { searchParams?: { [key: string]: string } }) {
  const featured = (searchParams?.featured || "").toLowerCase() === "true";
  const products = await getProducts(featured);
  const title = featured ? "Featured Products" : "All Products";

  return (
    <div className="container-custom py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{title}</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/shop" className={`px-3 py-1.5 rounded-lg ${!featured ? "bg-green-500 text-white" : "bg-slate-100 text-slate-700"}`}>
            All
          </Link>
          <Link href="/shop?featured=true" className={`px-3 py-1.5 rounded-lg ${featured ? "bg-green-500 text-white" : "bg-slate-100 text-slate-700"}`}>
            Featured
          </Link>
        </div>
      </div>

      {(!products || products.length === 0) ? (
        <div className="rounded-xl border bg-white p-10 text-center text-slate-600">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
