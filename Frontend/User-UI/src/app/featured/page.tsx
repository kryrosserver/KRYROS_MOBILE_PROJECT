"use client";

import { useEffect, useState } from "react";
import { productsApi } from "@/lib/api";
import { ProductCard } from "@/components/home/ProductCard";

export default function FeaturedPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch featured products
    productsApi.getFeatured().then((res) => {
      if (res.data) {
        setProducts(res.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 py-12">
      <div className="container-custom">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Curated</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tight">Featured Products</h1>
          <div className="h-2 w-20 bg-amber-500 rounded-full mt-4"></div>
          <p className="mt-6 text-slate-500 font-medium max-w-2xl">
            Handpicked selection of our best-selling and most popular items. Quality you can trust.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-white rounded-xl animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
