"use client"

import { useCart } from "@/providers/CartProvider"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { Trash2, Minus, Plus, ShoppingCart, ArrowRight } from "lucide-react"

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, getSubtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="container-custom min-h-[60vh] flex flex-col items-center justify-center py-12">
        <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="h-10 w-10 text-slate-200" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">Your cart is empty</h1>
        <p className="mt-2 text-slate-500 font-medium mb-8">Looks like you haven't added anything to your cart yet.</p>
        <Link href="/shop" className="h-12 px-8 bg-primary text-white font-black uppercase tracking-widest rounded-xl flex items-center justify-center hover:bg-primary/90 transition-all">
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="container-custom">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-8 md:mb-12">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.variant?.id}`} className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 flex gap-4 md:gap-6 items-center">
                <div className="h-20 w-20 md:h-24 md:w-24 bg-slate-50 rounded-xl flex-shrink-0 overflow-hidden relative">
                  {item.product.images && item.product.images[0] && (
                    <img 
                      src={typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url} 
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 truncate">{item.product.name}</h3>
                  {item.variant && (
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{item.variant.name}</p>
                  )}
                  <p className="text-primary font-black mt-1">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                  <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)} 
                      className="h-7 w-7 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-black w-6 text-center text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)} 
                      className="h-7 w-7 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.product.id, item.variant?.id)} 
                    className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-slate-500 font-bold text-sm uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>{formatPrice(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold text-sm uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">Calculated at checkout</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between text-lg font-black text-slate-900">
                  <span>Total</span>
                  <span>{formatPrice(getTotal())}</span>
                </div>
              </div>
              <Link 
                href="/checkout" 
                className="w-full h-14 bg-slate-900 text-white font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
              <p className="text-xs font-bold text-primary uppercase tracking-widest text-center">
                Free delivery on orders over K1,000
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
