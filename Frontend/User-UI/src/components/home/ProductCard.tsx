"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart, Eye, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { wishlistApi } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

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
              <span className="text-xl font-bold text-slate-900">K {product?.price?.toLocaleString() || 0}</span>
              {product?.originalPrice && (
                <span className="text-sm text-slate-500 line-through">
                  K {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <ShoppingCart className="mr-1 h-4 w-4" />
                Add
              </Button>
              <Button size="sm" className="bg-green-500 hover:bg-green-600">
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
      className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Image
          src={displayImage}
          alt={product?.name || 'Product'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product?.isNew && (
            <span className="rounded bg-blue-500 px-2 py-0.5 text-xs font-medium text-white">
              New
            </span>
          )}
          {discount && (
            <span className="rounded bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick Actions */}
        <div className={`absolute right-3 top-3 flex flex-col gap-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-white shadow-md hover:bg-slate-100"
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
            <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-white shadow-md hover:bg-slate-100"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Add to Cart */}
        <div className={`absolute bottom-3 left-3 right-3 transition-transform duration-300 ${isHovered ? 'translate-y-0' : 'translate-y-full'}`}>
          <Button className="w-full bg-green-500 hover:bg-green-600" size="sm">
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-slate-500">{displayBrand}</p>
        <Link href={`/product/${product?.slug ?? product?.id}`}>
          <h3 className="mt-1 text-sm font-medium text-slate-900 line-clamp-2 transition-colors group-hover:text-green-500">
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

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900">K {product?.price?.toLocaleString() || 0}</span>
          {product?.originalPrice && (
            <span className="text-sm text-slate-500 line-through">
              K {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {product?.allowCredit && (
          <p className="mt-2 text-xs text-green-600 font-medium">
            Available on credit
          </p>
        )}
      </div>
    </div>
  );
}
