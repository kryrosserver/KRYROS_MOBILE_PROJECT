"use client";

import { useState } from "react";
import { ProductCard } from "@/components/home/ProductCard";
import { products } from "@/data/mock-data";
import { 
  Search, 
  Filter, 
  Grid3X3, 
  LayoutList, 
  SlidersHorizontal,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const categories = [
  { id: "all", name: "All Products", count: 156 },
  { id: "phones", name: "Phones & Tablets", count: 45 },
  { id: "laptops", name: "Laptops & Computers", count: 32 },
  { id: "accessories", name: "Accessories", count: 38 },
  { id: "smart", name: "Smart Devices", count: 22 },
  { id: "audio", name: "Audio & Headphones", count: 19 },
];

const brands = ["Apple", "Samsung", "Huawei", "Xiaomi", "Oppo", "OnePlus", "Dell", "HP"];
const priceRanges = [
  { label: "Under K 1,000", min: 0, max: 1000 },
  { label: "K 1,000 - K 5,000", min: 1000, max: 5000 },
  { label: "K 5,000 - K 10,000", min: 5000, max: 10000 },
  { label: "K 10,000 - K 20,000", min: 10000, max: 20000 },
  { label: "Over K 20,000", min: 20000, max: null },
];

export default function ShopPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<{min: number | null; max: number | null} | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== "all" && product.category.slug !== selectedCategory) return false;
    if (selectedBrands.length > 0 && product.brand && !selectedBrands.includes(product.brand.name)) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (priceRange) {
      if (priceRange.min && product.price < priceRange.min) return false;
      if (priceRange.max && product.price > priceRange.max) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Page Header */}
      <div className="bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-white">Shop</h1>
          <p className="mt-2 text-slate-400">Browse our collection of premium tech products</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Search and Filters Bar */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
            
            <div className="hidden items-center gap-2 lg:flex">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-lg p-2 ${viewMode === "grid" ? "bg-green-500 text-white" : "bg-white text-slate-900"}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-lg p-2 ${viewMode === "list" ? "bg-green-500 text-white" : "bg-white text-slate-900"}`}
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`w-64 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}>
            <div className="rounded-xl bg-white p-6 shadow-sm sticky top-24">
              <div className="mb-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900">
                  Categories
                </h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                        selectedCategory === cat.id 
                          ? "bg-green-50 text-green-600" 
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-slate-400">({cat.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6 border-t border-slate-200 pt-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900">
                  Price Range
                </h3>
                <div className="space-y-2">
                  {priceRanges.map((range, idx) => (
                    <button
                      key={idx}
                      onClick={() => setPriceRange({ min: range.min, max: range.max })}
                      className={`flex w-full rounded-lg px-3 py-2 text-sm transition-colors ${
                        priceRange?.min === range.min 
                          ? "bg-green-50 text-green-600" 
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                  {priceRange && (
                    <button
                      onClick={() => setPriceRange(null)}
                      className="flex w-full rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                    >
                      Clear price filter
                    </button>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-900">
                  Brands
                </h3>
                <div className="space-y-2">
                  {brands.map((brand) => (
                    <label key={brand} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="rounded border-slate-300 text-green-500 focus:ring-green-500"
                      />
                      <span className="text-sm text-slate-600">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {(selectedBrands.length > 0 || priceRange) && (
                <button
                  onClick={() => {
                    setSelectedBrands([]);
                    setPriceRange(null);
                  }}
                  className="mt-6 w-full rounded-lg border border-slate-200 py-2 text-sm text-slate-600 hover:bg-slate-50"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-medium text-slate-900">{filteredProducts.length}</span> products
              </p>
            </div>
            
            {filteredProducts.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" 
                  : "grid-cols-1"
              }`}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl bg-white py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No products found</h3>
                <p className="mt-2 text-slate-600">Try adjusting your filters or search query</p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedBrands([]);
                    setPriceRange(null);
                    setSearchQuery("");
                  }}
                  className="mt-4 text-green-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {filteredProducts.length > 0 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm" className="bg-green-500 text-white hover:bg-green-600">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      </div>
    </div>
  );
}
