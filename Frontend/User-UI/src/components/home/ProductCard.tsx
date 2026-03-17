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
  const { toast } = useToast();

  // Normalize product data for display
  const displayImage = getProductImage(product);
  const displayBrand = getProductBrand(product);
  const displayReviews = getProductReviews(product);
  const displayCategory = getProductCategory(product);

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
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900">{formatPrice(Number(product?.price ?? 0))}</span>
              {product?.originalPrice && (
                <span className="text-sm text-slate-500 line-through">
                  {formatPrice(Number(product.originalPrice))}
                </span>
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
      className="group relative flex flex-col overflow-hidden rounded-lg bg-white shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-slate-50/50">
        <Link href={`/product/${product?.slug ?? product?.id}`}>
          <Image
            src={displayImage}
            alt={product?.name || 'Product'}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
            unoptimized={displayImage.startsWith('data:')}
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute left-2 top-2 flex flex-col gap-1.5 z-10">
          {product?.isNew && (
            <span className="rounded-sm bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              NEW
            </span>
          )}
          {discount > 0 && (
            <span className="rounded-sm bg-pink-500 px-1.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
              {discount}%
            </span>
          )}
        </div>

        {/* Floating Icons */}
        <div className="absolute right-2 top-2 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-300 z-10">
          <button 
            onClick={async (e) => {
              e.preventDefault(); e.stopPropagation();
              const id = product?.id; if (!id) return;
              if (!isAuthenticated) { router.push("/login"); return; }
              if (isWishlisted) { await wishlistApi.remove(id); setIsWishlisted(false); }
              else { await wishlistApi.add(id); setIsWishlisted(true); }
              window.dispatchEvent(new Event("wishlist:changed"));
            }}
            className={`p-2 rounded-full shadow-md bg-white hover:bg-slate-50 transition-colors ${isWishlisted ? 'text-pink-500' : 'text-slate-400'}`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
          <button className="p-2 rounded-full shadow-md bg-white hover:bg-slate-50 text-slate-400 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-full shadow-md bg-white hover:bg-slate-50 text-slate-400 transition-colors">
            <Eye className="h-4 w-4" />
          </button>
        </div>

        {/* Rating Badge */}
        <div className="absolute left-2 bottom-2 bg-yellow-100/90 backdrop-blur-sm px-1.5 py-0.5 rounded border border-yellow-200 flex items-center gap-1">
          <span className="text-[10px] font-bold text-yellow-700">{Number(product?.rating || 0).toFixed(1)}</span>
          <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
          <span className="text-[10px] text-yellow-600 font-medium">({product?.reviewCount || 0})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 flex flex-col flex-1 border-t border-slate-50">
        <Link href={`/product/${product?.slug ?? product?.id}`}>
          <h3 className="text-sm font-bold text-slate-900 line-clamp-2 transition-colors hover:text-blue-600 h-10">
            {product?.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base md:text-lg font-extrabold text-red-600 tracking-tight">
            {formatPrice(Number(product?.price ?? 0))}
          </span>
          {product?.originalPrice && (
            <span className="text-xs text-slate-400 line-through">
              {formatPrice(Number(product.originalPrice))}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1">
          <span className="text-[10px] font-bold text-green-600 uppercase">In Stock: {product?.stockCurrent ?? product?.inventory?.stock ?? 0}</span>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-2.5 w-2.5 ${i < Math.floor(product?.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-200"}`} />
            ))}
          </div>
        </div>

        {/* Feature Checklist */}
        <div className="mt-3 space-y-1">
          {product?.hasFiveYearGuarantee &&
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <Check className="h-3 w-3 text-green-500" />
                <span>5 YEARS GUARANTEE</span>
            </div>
          }
          {product?.hasFreeReturns &&
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <Check className="h-3 w-3 text-green-500" />
                <span>FREE RETURNS</span>
            </div>
          }
          {product?.hasInstallmentOptions &&
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <Check className="h-3 w-3 text-green-500" />
                <span>INSTALLMENT OPTIONS</span>
            </div>
          }
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 uppercase tracking-wider text-xs shadow-md shadow-blue-600/20"
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
