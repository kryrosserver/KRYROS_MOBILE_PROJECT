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
    <div className="space-y-16 mt-8 md:mt-12">
      {groupedData.map((category) => (
        <section key={category.id} className="relative">
          {/* Category title only if showing "All" */}
          {groupedData.length > 1 && (
            <div className="mb-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">
                {category.name}
              </h2>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
          )}

          {/* Brand Navigation - Only if multiple brands exist and we are in a single category view */}
          <BrandNav brands={category.brands} categorySlug={category.slug} isSticky={groupedData.length === 1} />

          {/* Brand Sections */}
          <div className="space-y-20 mt-10">
            {category.brands.map((brand) => (
              <div 
                key={brand.id} 
                id={`${category.slug}-${brand.slug}`}
                className="scroll-mt-40"
              >
                {/* Professional Brand Header - App Style */}
                <div className="flex flex-col items-center justify-center mb-10 group">
                  <div className="h-1 w-12 bg-blue-600 rounded-full mb-4 transition-all group-hover:w-20 shadow-[0_0_10px_rgba(37,99,235,0.3)]" />
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight flex flex-col items-center gap-1.5 text-center">
                    {brand.name}
                    <div className="flex items-center gap-2">
                      <span className="h-px w-4 bg-slate-200" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {brand.products.length} Products
                      </span>
                      <span className="h-px w-4 bg-slate-200" />
                    </div>
                  </h3>
                </div>

                {/* Product Grid - Automatically 4 columns on desktop, 2 on mobile */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
