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
          {/* Category Header - Perfectly Centered */}
          <div className="flex flex-col items-center justify-center mb-8 sticky top-0 z-30 bg-white/95 backdrop-blur-md py-6 border-b border-slate-50">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 uppercase tracking-tighter text-center">
              {category.name}
            </h2>
          </div>

          {/* Dynamic Brand Navigation Bar for this category */}
          <BrandNav brands={category.brands} categorySlug={category.slug} />

          {/* Brand Sections */}
          <div className="space-y-12 mt-8">
            {category.brands.map((brand) => (
              <div 
                key={brand.id} 
                id={`brand-${brand.slug}`}
                className="scroll-mt-32"
              >
                {/* Brand Header - Centered with clean line */}
                <div className="flex flex-col items-center justify-center mb-8">
                  <div className="h-1 w-12 bg-blue-600 rounded-full mb-3"></div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 flex flex-col items-center gap-1 uppercase tracking-tight">
                    {brand.name}
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      {brand.products.length} AVAILABLE ITEMS
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
