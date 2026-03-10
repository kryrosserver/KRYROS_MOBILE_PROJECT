"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  Heart, 
  ShoppingBag, 
  X
} from "lucide-react";
import { wishlistApi, productsApi } from "@/lib/api";
import { useCart } from "@/providers/CartProvider";
import type { Product } from "@/types";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let active = true;
    wishlistApi.getMine().then(res => {
      if (!active) return;
      setItems(Array.isArray(res.data) ? res.data : []);
    }).finally(() => active && setLoading(false));
    return () => { active = false };
  }, []);

  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      <div className="bg-slate-900 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h1 className="text-3xl font-bold text-white">My Wishlist</h1>
          <p className="mt-2 text-slate-400">{items.length} items saved</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl bg-white shadow-sm">
          {items.map((it) => {
            const p: Product | undefined = it.product;
            const primary = p?.images?.find((img:any) => img.isPrimary)?.url || p?.images?.[0]?.url || "";
            return (
            <div key={it.productId} className="flex gap-6 border-b border-slate-200 p-6 last:border-b-0">
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                <Image
                  src={primary || "/placeholder.png"}
                  alt={p?.name || "Product"}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-sm text-slate-500">{p?.brand?.name || ""}</p>
                  <Link href={`/product/${p?.id}`} className="text-lg font-medium text-slate-900 hover:text-green-500">
                    {p?.name || "Product"}
                  </Link>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xl font-bold text-slate-900">K {Number(p?.salePrice ?? p?.price ?? 0).toLocaleString()}</span>
                    {p?.salePrice && p?.price && (
                      <>
                        <span className="text-sm text-slate-500 line-through">
                          K {Number(p.price).toLocaleString()}
                        </span>
                        <span className="rounded bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-600">
                          {Math.round(((Number(p.price) - Number(p.salePrice)) / Number(p.price)) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-green-600">
                    In Stock
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    className="bg-green-500 hover:bg-green-600"
                    onClick={() => {
                      if (p) addItem(p);
                    }}
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={async () => {
                      await wishlistApi.remove(it.productId);
                      setItems(prev => prev.filter(x => x.productId !== it.productId));
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new Event("wishlist:changed"));
                      }
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          )})}
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

    </div>
  );
}
