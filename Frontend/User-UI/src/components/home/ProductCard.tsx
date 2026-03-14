"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart, Eye, Star, ArrowRight, CreditCard } from "lucide-react";
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
  if (p.images && p.images.length > 0) return p.images[0].url;
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
            <div className="mt-2 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
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
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <Link href={`/product/${product?.slug ?? product?.id}`}>
          <Image
            src={displayImage}
            alt={product?.name || 'Product'}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product?.isNew && (
            <span className="rounded-full bg-blue-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
              NEW
            </span>
          )}
          {discount && (
            <span className="rounded-full bg-orange-500 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
              -{discount}%
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <p className="text-xs text-slate-500">{displayBrand}</p>
          {product?.allowCredit && (
            <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase">
              Credit
            </span>
          )}
        </div>
        <Link href={`/product/${product?.slug ?? product?.id}`}>
          <h3 className="mt-1 text-sm font-medium text-slate-900 line-clamp-2 transition-colors hover:text-green-500">
            {product?.name}
          </h3>
        </Link>
        
        <div className="mt-2 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.floor(product?.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
              }`}
            />
          ))}
          <span className="text-xs text-slate-500">({displayReviews})</span>
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-900">{formatPrice(Number(product?.price ?? 0))}</span>
              {product?.originalPrice && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(Number(product.originalPrice))}
                </span>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-9 w-9 rounded-full bg-slate-50 hover:bg-slate-100"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
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
              <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {product?.allowCredit && (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-[10px] md:text-xs py-2 h-9 shadow-sm font-bold"
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  router.push(`/credit?productId=${product.id}`);
                }}
              >
                <CreditCard className="mr-2 h-3 w-3" />
                Get on Installment
              </Button>
            )}
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-xs py-2 h-10 shadow-md font-bold text-white uppercase tracking-wider"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addItem(product);
                toast({
                  title: "Added to Cart",
                  description: `${product.name} has been added.`,
                });
              }}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
