"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart, Eye, Star, ArrowRight, CreditCard, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
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

  // Logic: If we are on wholesale page, use wholesalePrice if available. 
  // Otherwise, use regular price.
  const basePrice = (isWholesalePage && product?.wholesalePrice) 
    ? Number(product.wholesalePrice) 
    : Number(product?.price ?? 0);

  const priceInfo = convertPrice(basePrice);
  const originalPriceInfo = product?.originalPrice ? convertPrice(Number(product.originalPrice)) : null;
  const isUSD = !selectedCountry || selectedCountry.code === "US";

  // Extract key specs (RAM, Storage, etc.)
  const specs = Array.isArray(product?.specifications) 
    ? product.specifications 
    : (typeof product?.specifications === 'string' ? JSON.parse(product.specifications) : []);
  
  // Look for RAM, Storage, or any first 2 specs
  const importantKeys = ['ram', 'storage', 'memory', 'cpu', 'processor', 'display', 'screen', 'size', 'capacity'];
  let displaySpecs = specs.filter((s: any) => 
    importantKeys.some(k => s.key?.toLowerCase().includes(k))
  ).map((s: any) => ({
    ...s,
    // Shorten very long values (e.g., screen details) to keep the card clean
    value: s.value.length > 20 ? s.value.split(',')[0].slice(0, 20) + (s.value.length > 20 ? '...' : '') : s.value
  })).slice(0, 2);

  // If no "important" specs found, just take the first two available
  if (displaySpecs.length === 0 && specs.length > 0) {
    displaySpecs = specs.map((s: any) => ({
      ...s,
      value: s.value.length > 20 ? s.value.slice(0, 20) + '...' : s.value
    })).slice(0, 2);
  }
  
  const discount = product?.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product?.discount;

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
            src={displayImage}
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
                    {product?.originalPrice && (
                      <span className="text-sm text-slate-500 line-through">
                        {isUSD ? formatPrice(Number(product.originalPrice)) : originalPriceInfo?.formatted}
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
            src={displayImage}
            alt={product?.name || 'Product'}
            fill
            className="object-contain p-2 md:p-4 transition-transform duration-500 group-hover:scale-105"
            unoptimized={displayImage.startsWith('data:')}
          />
        </Link>
        
        {/* Badges - Top Left (Matches Reference) */}
        <div className="absolute left-2 top-2 flex flex-col gap-1 z-10">
          {product?.isNew && (
            <span className="rounded bg-[#00c652] px-1.5 py-0.5 text-[8px] md:text-[9px] font-black text-white uppercase tracking-widest shadow-sm">
              NEW
            </span>
          )}
          {discount > 0 && (
            <span className="rounded bg-[#ffeff2] px-1.5 py-0.5 text-[8px] md:text-[9px] font-black text-[#ff4b7d] uppercase tracking-widest shadow-sm border border-[#ff4b7d]/10">
              {discount}%
            </span>
          )}
        </div>

        {/* Rating Badge - (Matches Reference Image) */}
        <div className="absolute left-2 bottom-2 z-10 bg-[#fff9e6] border border-[#ffc107]/20 px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm scale-90 md:scale-100 origin-left">
          <span className="text-[9px] font-black text-slate-700">5.00</span>
          <Star className="h-2 w-2 fill-[#ffc107] text-[#ffc107]" />
          <span className="text-[9px] font-bold text-slate-400">1</span>
        </div>
      </div>

      {/* Action Icons Row - (Matches Reference Image) */}
      <div className="flex items-center justify-around py-2 border-y border-slate-50 bg-white">
        <button 
          onClick={async (e) => {
            e.preventDefault(); e.stopPropagation();
            const id = product?.id; if (!id) return;
            if (!isAuthenticated) { router.push("/login"); return; }
            if (isWishlisted) { await wishlistApi.remove(id); setIsWishlisted(false); }
            else { await wishlistApi.add(id); setIsWishlisted(true); }
            window.dispatchEvent(new Event("wishlist:changed"));
          }}
          className={`transition-colors p-1.5 hover:bg-slate-50 rounded-full ${isWishlisted ? 'text-pink-500' : 'text-slate-400 hover:text-slate-900'}`}
        >
          <Heart className={`h-3.5 w-3.5 md:h-4 md:w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
        <button className="text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full p-1.5 transition-colors">
          <RefreshCw className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </button>
        <button className="text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full p-1.5 transition-colors">
          <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </button>
        <button className="text-[#00c652] hover:bg-slate-50 rounded-full p-1.5 transition-colors">
          <Check className="h-3.5 w-3.5 md:h-4 md:w-4 stroke-[3px]" />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-2 md:p-4 flex flex-col flex-1">
        <Link href={`/product/${product?.slug ?? product?.id}`}>
          <h3 className="text-[10px] md:text-sm font-bold text-slate-800 line-clamp-2 transition-colors hover:text-primary h-8 md:h-10 mb-1 leading-tight md:leading-normal">
            {product?.name}
          </h3>
        </Link>

        {/* Storage Info - (Matches Reference Image) */}
        <div className="mb-2">
          {specs.find((s: any) => s.key?.toLowerCase().includes('storage')) ? (
            <span className="text-[9px] md:text-xs font-bold text-slate-500 uppercase tracking-tight">
              {specs.find((s: any) => s.key?.toLowerCase().includes('storage')).value}
            </span>
          ) : (
            <span className="text-[9px] md:text-xs font-bold text-slate-300 uppercase tracking-tight italic">
              Standard Edition
            </span>
          )}
        </div>

        {/* Price Section */}
        <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-2 mb-1 md:mb-2">
          {product?.originalPrice && (
            <span className="text-[9px] md:text-xs text-slate-400 line-through font-medium">
              {isUSD ? formatPrice(Number(product.originalPrice || 0)) : originalPriceInfo?.formatted}
            </span>
          )}
          <span className="text-xs md:text-base font-black text-[#d11c1c] tracking-tight">
            {isUSD ? formatPrice(basePrice) : priceInfo.formatted}
          </span>
        </div>

        {/* Stock & Rating Stars */}
        <div className="flex flex-col gap-1 mb-2 md:mb-4">
          <div className="flex items-center gap-1">
            <span className="text-[8px] md:text-[10px] font-black text-[#00c652] uppercase tracking-wider">IN STOCK: {product?.stockCurrent ?? product?.inventory?.stock ?? 0}</span>
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-2 w-2 md:h-3 md:w-3 ${i < Math.floor(product?.rating || 0) ? "fill-[#ffc107] text-[#ffc107]" : "text-slate-200"}`} />
            ))}
          </div>
        </div>

        {/* Add to Cart Button */}
        <div className="mt-auto">
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white font-black h-8 md:h-11 uppercase tracking-widest text-[8px] md:text-[10px] rounded-md md:rounded-lg shadow-lg shadow-primary/10 active:scale-[0.98] transition-all"
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
