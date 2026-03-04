"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Heart, ShoppingCart, Eye, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  isNew?: boolean;
  isFeatured?: boolean;
  discount?: number;
  inStock?: boolean;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  viewMode?: "grid" | "list";
}

export function ProductCard({ product, viewMode = "grid" }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount;

  if (viewMode === "list") {
    return (
      <div 
        className="group relative flex gap-6 rounded-xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg bg-slate-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.isNew && (
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
            <p className="text-xs text-slate-500">{product.brand}</p>
            <Link href={`/product/${product.id}`}>
              <h3 className="mt-1 text-lg font-semibold text-slate-900 transition-colors group-hover:text-green-500">
                {product.name}
              </h3>
            </Link>
            <div className="mt-2 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
                  }`}
                />
              ))}
              <span className="ml-1 text-xs text-slate-500">({product.reviews})</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-slate-600">
              {product.description || "Premium quality product with advanced features and sleek design."}
            </p>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900">K {product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-sm text-slate-500 line-through">
                  K {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={isWishlisted ? "border-red-500 text-red-500" : ""}
              >
                <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
              </Button>
              <Button size="sm" className="bg-green-500 hover:bg-green-600">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="group relative rounded-xl bg-white shadow-sm transition-shadow hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden rounded-t-xl bg-slate-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1">
          {product.isNew && (
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

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsWishlisted(!isWishlisted);
          }}
          className={`absolute right-3 top-3 rounded-full bg-white p-2 shadow-md transition-all hover:bg-slate-50 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
        </button>

        {/* Quick Actions */}
        <div className={`absolute bottom-3 left-3 right-3 flex gap-2 transition-all ${
          isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}>
          <Button 
            className="flex-1 bg-white text-slate-900 hover:bg-slate-50"
            size="sm"
          >
            <Eye className="mr-1 h-4 w-4" />
            Quick View
          </Button>
          <Button 
            className="flex-1 bg-green-500 hover:bg-green-600"
            size="sm"
          >
            <ShoppingCart className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <p className="text-xs text-slate-500">{product.brand}</p>
        <Link href={`/product/${product.id}`}>
          <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-green-500">
            {product.name}
          </h3>
        </Link>
        
        <div className="mt-2 flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3.5 w-3.5 ${
                i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-slate-300"
              }`}
            />
          ))}
          <span className="ml-1 text-xs text-slate-500">({product.reviews})</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-bold text-slate-900">K {product.price.toLocaleString()}</span>
          {product.originalPrice && (
            <span className="text-sm text-slate-500 line-through">
              K {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {product.inStock === false && (
          <p className="mt-2 text-xs text-red-500">Out of Stock</p>
        )}
      </div>
    </div>
  );
}

export default ProductCard;
