"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
import { useCart } from "@/providers/CartProvider";
import { useCurrency } from "@/providers/CurrencyProvider";
import type { CartItem as CIC } from "@/types";
import { formatPrice } from "@/lib/utils";
import { settingsApi } from "@/lib/api";

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, getSubtotal } = useCart();
  const { selectedCountry, convertPrice, formatLocal } = useCurrency();
  const [couponCode, setCouponCode] = useState("");
  const [shippingConfig, setShippingConfig] = useState({ fee: 50, threshold: 5000 });

  useEffect(() => {
    const fetchShipping = async () => {
      const { data } = await settingsApi.getShippingConfig();
      if (data) setShippingConfig(data);
    };
    fetchShipping();
  }, []);

  const subtotal = useMemo(() => getSubtotal(), [getSubtotal, items]);
  const discount = 0;
  const shipping = subtotal >= shippingConfig.threshold ? 0 : shippingConfig.fee;
  const total = subtotal - discount + shipping;

  // Helper to format price in current currency
  const displayPrice = (amount: number) => {
    if (selectedCountry?.code === "US" || !selectedCountry) {
      return formatPrice(amount);
    }
    return formatLocal(convertPrice(amount).amount);
  };

  const handleCheckout = () => {
    router.push("/checkout");
  };

  const handleBuyOnCredit = () => {
    router.push("/credit");
  };

  if (items.length === 0) {
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
          <p className="mt-2 text-slate-400">{items.length} items in your cart</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="rounded-xl bg-white shadow-sm">
              {items.map((ci: CIC) => {
                const itemId = ci.product.id + (ci.variant?.id ? `:${ci.variant.id}` : "");
                const primary = ci.product.images?.find((i) => i.isPrimary)?.url || ci.product.images?.[0]?.url || "";
                const unitPrice = ci.variant?.price || ci.product.salePrice || ci.product.price;
                return (
                <div key={itemId} className="flex flex-col sm:flex-row gap-4 border-b border-slate-100 p-4 md:p-6 last:border-b-0 group">
                  <div className="flex gap-4 w-full">
                    <div className="relative h-24 w-24 md:h-28 md:w-28 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                      <Image
                        src={primary || "/placeholder.png"}
                        alt={ci.product.name}
                        fill
                        className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <Link href={`/product/${ci.product.id}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors truncate block">
                          {ci.product.name}
                        </Link>
                        <button
                          onClick={() => removeItem(ci.product.id, ci.variant?.id)}
                          className="rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all shrink-0"
                        >
                          <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                        </button>
                      </div>

                      {ci.variant && (
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Variant: {ci.variant.value}</p>
                      )}
                      
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center bg-slate-50 rounded-lg border border-slate-100 overflow-hidden h-9 shadow-sm">
                          <button
                            onClick={() => updateQuantity(ci.product.id, ci.variant?.id, ci.quantity - 1)}
                            className="flex h-full px-3 items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 transition-all disabled:opacity-30"
                            disabled={ci.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-700">{ci.quantity}</span>
                          <button
                            onClick={() => updateQuantity(ci.product.id, ci.variant?.id, ci.quantity + 1)}
                            className="flex h-full px-3 items-center justify-center text-slate-400 hover:bg-white hover:text-blue-600 transition-all"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-black text-blue-600 tracking-tight">{displayPrice(Number(unitPrice * ci.quantity))}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-xl bg-white p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
              
              <div className="mt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">{displayPrice(Number(subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Discount</span>
                  <span className="font-medium text-green-600">{discount ? `-${displayPrice(Number(discount))}` : displayPrice(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium text-slate-900">
                    {shipping === 0 ? "Free" : displayPrice(Number(shipping))}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-green-600">
                    Add {displayPrice(Number(shippingConfig.threshold - subtotal))} more for free shipping!
                  </p>
                )}
                <hr className="my-3 border-slate-200" />
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-slate-900">Total</span>
                  <span className="text-lg font-bold text-slate-900">{displayPrice(Number(total))}</span>
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
                <Button 
                  className="w-full bg-green-500 hover:bg-green-600"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleBuyOnCredit}
                >
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
                  <span>Free shipping on orders over {displayPrice(shippingConfig.threshold)}</span>
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

    </div>
  );
}
