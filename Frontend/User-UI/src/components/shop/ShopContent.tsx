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
    <div className="space-y-12 mt-12">
      {groupedData.map((category) => (
        <section key={category.id} className="relative">
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
                {/* Product Grid */}
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
