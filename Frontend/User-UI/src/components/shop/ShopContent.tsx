"use client";

import { useEffect } from "react";
import { ProductCard } from "@/components/home/ProductCard";
import { BrandNav } from "./BrandNav";

type Product = any; // Replace with your actual product type

type BrandGroup = {
  id: number;
  name: string;
  slug: string;
  products: Product[];
};

type CategoryGroup = {
  id: string;
  name: string;
  slug: string;
  brands: BrandGroup[];
};

export function ShopContent({ groupedData }: { groupedData: CategoryGroup[] }) {
  useEffect(() => {
    // Smooth scroll to brand if hash exists in URL
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500); // Small delay to ensure content is rendered
    }
  }, [groupedData]);

  if (!groupedData || groupedData.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center text-slate-600">
        No products found.
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {groupedData.map((category) => (
        <section key={category.id} className="relative">
          {/* Category Header */}
          <div className="flex items-center gap-4 mb-4 sticky top-0 z-30 bg-white/90 backdrop-blur-md py-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
              {category.name}
            </h2>
            <div className="h-0.5 flex-1 bg-gradient-to-r from-green-500 to-transparent opacity-20"></div>
          </div>

          {/* Dynamic Brand Navigation Bar for this category */}
          <BrandNav brands={category.brands} categorySlug={category.slug} />

          {/* Brand Sections */}
          <div className="space-y-10 mt-6">
            {category.brands.map((brand) => (
              <div 
                key={brand.id} 
                id={`brand-${brand.slug}`}
                className="scroll-mt-24"
              >
                {/* Brand Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
                    {brand.name}
                    <span className="text-sm font-normal text-slate-400 ml-2">
                      ({brand.products.length} products)
                    </span>
                  </h3>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                  {brand.products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
