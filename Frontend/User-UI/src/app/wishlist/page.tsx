"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Heart, 
  ShoppingBag, 
  X
} from "lucide-react";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  brand: string;
  inStock: boolean;
}

const initialWishlist: WishlistItem[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB",
    price: 25000,
    originalPrice: 28000,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop",
    brand: "Apple",
    inStock: true
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    price: 22000,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop",
    brand: "Samsung",
    inStock: true
  },
  {
    id: "3",
    name: "MacBook Pro 16-inch M3",
    price: 45000,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    brand: "Apple",
    inStock: false
  }
];

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(initialWishlist);

  const removeItem = (id: string) => {
    setWishlist(prev => prev.filter(item => item.id !== id));
  };

  const addToCart = (item: WishlistItem) => {
    // In a real app, this would add to cart
    console.log("Added to cart:", item);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="rounded-xl bg-white py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <Heart className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Your wishlist is empty</h2>
            <p className="mt-2 text-slate-600">Save items you love by clicking the heart icon</p>
            <Button className="mt-8 bg-green-500 hover:bg-green-600">
              <Link href="/shop">Browse Products</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      <div className="bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
          <p className="mt-2 text-slate-400">{wishlist.length} items saved</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl bg-white shadow-sm">
          {wishlist.map((item) => (
            <div key={item.id} className="flex gap-6 border-b border-slate-200 p-6 last:border-b-0">
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-sm text-slate-500">{item.brand}</p>
                  <Link href={`/product/${item.id}`} className="text-lg font-medium text-slate-900 hover:text-green-500">
                    {item.name}
                  </Link>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900">K {item.price.toLocaleString()}</span>
                    {item.originalPrice && (
                      <>
                        <span className="text-sm text-slate-500 line-through">
                          K {item.originalPrice.toLocaleString()}
                        </span>
                        <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                          {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <p className={`mt-2 text-sm ${item.inStock ? "text-green-600" : "text-red-500"}`}>
                    {item.inStock ? "In Stock" : "Out of Stock"}
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    className="bg-green-500 hover:bg-green-600"
                    disabled={!item.inStock}
                    onClick={() => addToCart(item)}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between">
          <Button variant="outline">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
          <Button variant="outline">
            Share Wishlist
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
