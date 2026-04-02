"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart, Eye, Star, ArrowRight, CreditCard, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice, resolveImageUrl } from "@/lib/utils";
import { wishlistApi } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import { useToast } from "@/components/ui/use-toast";

// Accept any product format
interface ProductCardProps {
  product: any;
  viewMode?: "grid" | "list";
}

// Helper to get string values from either format
function getProductImage(p: any): string {
  if (!p) return '/placeholder.jpg';
  if (typeof p.image === 'string') return p.image;
  if (Array.isArray(p.images) && p.images.length > 0) {
    const first = p.images[0];
    if (typeof first === 'string') return first;
    if (first && typeof first.url === 'string') return first.url;
  }
  return '/placeholder.jpg';
}

function getProductBrand(p: any): string {
  if (!p) return 'Unknown';
  if (typeof p.brand === 'string') return p.brand;
  if (p.brand && p.brand.name) return p.brand.name;
  return 'Unknown';
}

function getProductReviews(p: any): number {
  if (!p) return 0;
  if (typeof p.reviews === 'number') return p.reviews;
  return p.reviewCount || 0;
}

function getProductCategory(p: any): string {
  if (!p) return '';
  if (typeof p.category === 'string') return p.category;
  if (p.category && p.category.name) return p.category.name;
  return '';
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { addItem } = useCart();
  const { convertPrice, selectedCountry } = useCurrency();
  const { toast } = useToast();

  // Normalize product data for display
  const displayImage = getProductImage(product);
  const displayBrand = getProductBrand(product);
  const displayReviews = getProductReviews(product);
  const displayCategory = getProductCategory(product);

  const isCreditPage = typeof window !== 'undefined' && window.location.pathname.includes('/credit');
  const isWholesalePage = typeof window !== 'undefined' && window.location.pathname.includes('/wholesale');

  // Logic: Use salePrice if available, otherwise regular price.
  // basePrice is the price the user actually pays.
  const basePrice = product?.salePrice 
    ? Number(product.salePrice) 
    : Number(product?.price ?? 0);

  // originalPrice is the price before discount (if salePrice exists).
  const originalPrice = product?.salePrice ? Number(product.price) : null;

  const priceInfo = convertPrice(basePrice);
  const originalPriceInfo = originalPrice ? convertPrice(originalPrice) : null;
  const isUSD = !selectedCountry || selectedCountry.code === "US";

  // Extract key specs (RAM, Storage, etc.)
  let specs: any[] = [];
  try {
    specs = Array.isArray(product?.specifications) 
      ? product.specifications 
      : (typeof product?.specifications === 'string' ? JSON.parse(product.specifications) : []);
  } catch (e) {
    console.warn('Failed to parse specifications for product:', product?.id);
    specs = [];
  }
  
  // Look for RAM, Storage, or any first 2 specs
  const importantKeys = ['ram', 'storage', 'memory', 'cpu', 'processor', 'display', 'screen', 'size', 'capacity'];
  let displaySpecs = specs.filter((s: any) => 
    s.key && importantKeys.some(k => s.key.toLowerCase().includes(k))
  ).map((s: any) => ({
    ...s,
    value: s.value.length > 20 ? s.value.split(',')[0].slice(0, 20) + '...' : s.value
  })).slice(0, 2);

  // If no "important" specs found, just take the first two available
  if (displaySpecs.length === 0 && specs.length > 0) {
    displaySpecs = specs.map((s: any) => ({
      ...s,
      value: s.value.length > 20 ? s.value.slice(0, 20) + '...' : s.value
    })).slice(0, 2);
  }
  
  // Calculate discount: use manual discountPercentage if available, or calculate from price/salePrice
  const discount = product?.discountPercentage 
    ? product.discountPercentage
    : (originalPrice ? Math.round(((originalPrice - basePrice) / originalPrice) * 100) : 0);

  const isWholesale = product?.isWholesaleOnly;
  const unitsPerPack = product?.unitsPerPack || 1;
  const unitPrice = basePrice / unitsPerPack;
  const unitPriceInfo = convertPrice(unitPrice);

  if (viewMode === "list") {
    return (
      <div 
        className="group relative flex gap-6 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={resolveImageUrl(displayImage)}
            alt={product?.name || 'Product'}
            fill
            className="object-cover"
            unoptimized={displayImage.startsWith('data:')}
          />
          {product?.isNew && (
            <span className="absolute left-2 top-2 rounded bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
              New
            </span>
          )}
          {isWholesale && (
            <span className="absolute left-2 top-2 rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Wholesale
            </span>
          )}
          {discount && (
            <span className="absolute left-2 top-2 rounded bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
              -{discount}%
            </span>
          )}
        </div>
        
        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="text-xs text-slate-500">{displayBrand}</p>
            <Link href={`/product/${product?.slug ?? product?.id}`}>
              <h3 className="mt-1 text-lg font-semibold text-slate-900 transition-colors group-hover:text-green-500">
                {product?.name}
              </h3>
            </Link>
            
            {/* Quick Specs for List View */}
            {displaySpecs.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-2 min-h-[28px]">
                {displaySpecs.map((spec: any, idx: number) => (
                  <span key={idx} className="inline-flex items-center rounded-md bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-600 border border-slate-200">
                    {spec.value}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-2 flex items-center gap-1">
              {[...Array(5)].map((StarIcon, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product?.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                  }`}
                />
              ))}
              <span className="ml-1 text-xs text-slate-500">({displayReviews})</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {product?.description || "Premium quality product with advanced features and sleek design."}
            </p>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-col">
              {isCreditPage && product.allowCredit ? (
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Deposit:</span>
                    <span className="text-lg font-bold text-green-600">{convertPrice(Number(product.creditMinimum)).formatted}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Monthly:</span>
                    <span className="text-sm font-bold text-blue-600">{product.creditMessage || 'Contact Us'}</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900">
                      {isUSD ? formatPrice(basePrice) : priceInfo.formatted}
                    </span>
                    {isWholesale && unitsPerPack > 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                          Pack of {unitsPerPack}
                        </span>
                        {product?.wholesaleMoq > 1 && (
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            MOQ: {product.wholesaleMoq} Packs
                          </span>
                        )}
                      </div>
                    )}
                    {originalPrice && (
                      <span className="text-sm text-slate-500 line-through">
                        {isUSD ? formatPrice(originalPrice) : originalPriceInfo?.formatted}
                      </span>
                    )}
                  </div>
                  {isWholesale && unitsPerPack > 1 && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      {isUSD ? formatPrice(unitPrice) : unitPriceInfo.formatted} per unit
                    </span>
                  )}
                  {!isUSD && (
                    <span className="text-[10px] text-slate-400 font-medium italic">
                      ≈ {formatPrice(basePrice)} USD
                    </span>
                  )}
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => addItem(product)}
              >
                <ShoppingCart className="mr-1 h-4 w-4" />
                Add
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  const id = product?.id;
                  if (!id) return;
                  if (!isAuthenticated) {
                    router.push("/login");
                    return;
                  }
                  if (isWishlisted) {
                    await wishlistApi.remove(id);
                    setIsWishlisted(false);
                  } else {
                    await wishlistApi.add(id);
                    setIsWishlisted(true);
                  }
                  if (typeof window !== "undefined") {
                    window.dispatchEvent(new Event("wishlist:changed"));
                  }
                }}
              >
                <Heart className={`mr-1 h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </Button>
              <Button
                size="sm"
                className="bg-green-500 hover:bg-green-600"
                onClick={() => addItem(product)}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-lg bg-white border border-slate-100 transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-white">
        <Link href={`/product/${product?.slug ?? product?.id}`}>
          <Image
            src={resolveImageUrl(displayImage)}
            alt={product?.name || 'Product'}
            fill
            className="object-contain p-1 md:p-4 transition-transform duration-500 group-hover:scale-105"
            unoptimized={displayImage.startsWith('data:')}
          />
        </Link>
        
        {/* Badges - Top Left */}
        <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
          {product?.isNew && (
            <span className="rounded bg-[#00c652] px-2 py-1 text-[9px] md:text-[10px] font-black text-white uppercase tracking-widest shadow-sm">
              NEW
            </span>
          )}
          {discount > 0 && (
            <span className="rounded bg-[#ffeff2] px-2 py-1 text-[9px] md:text-[10px] font-black text-[#ff4b7d] uppercase tracking-widest shadow-sm border border-[#ff4b7d]/10">
              {discount}%
            </span>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-3 md:p-5 flex flex-col flex-1">
        <Link href={`/product/${product?.slug ?? product?.id}`}>
          <h3 className="text-[13px] md:text-base font-bold text-slate-800 line-clamp-2 transition-colors hover:text-primary h-10 md:h-12 mb-2 leading-tight md:leading-normal">
            {product?.name}
          </h3>
        </Link>

        {/* Storage Info */}
        <div className="mb-3">
          {specs.find((s: any) => s.key?.toLowerCase().includes('storage')) ? (
            <span className="text-[11px] md:text-sm font-bold text-slate-500 uppercase tracking-tight">
              {specs.find((s: any) => s.key?.toLowerCase().includes('storage')).value}
            </span>
          ) : (
            <span className="text-[11px] md:text-sm font-bold text-slate-300 uppercase tracking-tight italic">
              Standard Edition
            </span>
          )}
        </div>

        {/* Price Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 mb-2 md:mb-4">
          {originalPrice && (
            <span className="text-[11px] md:text-sm text-slate-400 line-through font-medium">
              {isUSD ? formatPrice(originalPrice) : originalPriceInfo?.formatted}
            </span>
          )}
          <span className="text-sm md:text-xl font-black text-[#d11c1c] tracking-tight">
            {isUSD ? formatPrice(basePrice) : priceInfo.formatted}
          </span>
        </div>

        {/* Stock Status */}
        <div className="flex flex-col gap-2 mb-3 md:mb-6">
          <div className="flex items-center gap-1">
            <span className="text-[10px] md:text-xs font-black text-[#00c652] uppercase tracking-wider">
              IN STOCK: {product?.stockCurrent ?? product?.inventory?.stock ?? 0}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-auto">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white font-black h-10 md:h-12 uppercase tracking-widest text-[10px] md:text-xs rounded-md md:rounded-lg shadow-lg shadow-primary/10 active:scale-[0.98] transition-all"
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation();
              addItem(product);
              toast({ title: "Added to Cart", description: `${product.name} has been added.` });
            }}
          >
            Add to cart
          </Button>
        </div>
      </div>
    </div>
  );
}
