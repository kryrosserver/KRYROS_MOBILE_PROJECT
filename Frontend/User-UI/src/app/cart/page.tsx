"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight,
  Shield,
  Truck,
  CreditCard
} from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  variant?: string;
}

const initialCart: CartItem[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max 256GB",
    price: 25000,
    originalPrice: 28000,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&h=400&fit=crop",
    quantity: 1,
    variant: "Natural Titanium"
  },
  {
    id: "2",
    name: "AirPods Pro (2nd Generation)",
    price: 3500,
    image: "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=400&h=400&fit=crop",
    quantity: 2,
    variant: "White"
  }
];

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>(initialCart);
  const [couponCode, setCouponCode] = useState("");

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = cart.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);
  const shipping = subtotal > 5000 ? 0 : 150;
  const total = subtotal - discount + shipping;

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="rounded-xl bg-white py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <ShoppingBag className="h-10 w-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Your cart is empty</h2>
            <p className="mt-2 text-slate-600">Looks like you haven't added any items yet</p>
            <Button className="mt-8 bg-green-500 hover:bg-green-600">
              <Link href="/shop">Start Shopping</Link>
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
          <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
          <p className="mt-2 text-slate-400">{cart.length} items in your cart</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white shadow-sm">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 border-b border-slate-200 p-6 last:border-b-0">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link href={`/product/${item.id}`} className="font-medium text-slate-900 hover:text-green-500">
                        {item.name}
                      </Link>
                      {item.variant && (
                        <p className="mt-1 text-sm text-slate-500">Variant: {item.variant}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded border border-slate-200 text-slate-600 hover:bg-slate-50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-slate-900">K {(item.price * item.quantity).toLocaleString()}</p>
                        {item.originalPrice && (
                          <p className="text-sm text-slate-500 line-through">
                            K {(item.originalPrice * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start rounded p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
              
              <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">K {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Discount</span>
                  <span className="font-medium text-green-600">-K {discount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium text-slate-900">
                    {shipping === 0 ? "Free" : `K ${shipping}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-green-600">
                    Add K {(5000 - subtotal).toLocaleString()} more for free shipping!
                  </p>
                )}
                <hr className="my-3 border-slate-200" />
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-slate-900">Total</span>
                  <span className="text-lg font-bold text-slate-900">K {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Apply Coupon
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline">Apply</Button>
                </div>
              </div>

              {/* Checkout Buttons */}
              <div className="mt-6 space-y-3">
                <Button className="w-full bg-green-500 hover:bg-green-600">
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" className="w-full">
                  Buy on Credit
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Truck className="h-5 w-5 text-green-500" />
                  <span>Free shipping on orders over K 5,000</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <CreditCard className="h-5 w-5 text-green-500" />
                  <span>Multiple payment options available</span>
                </div>
              </div>

              {/* Continue Shopping */}
              <div className="mt-6 text-center">
                <Link href="/shop" className="text-sm text-green-600 hover:underline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
