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
    <main className="min-h-screen bg-slate-50 py-8 md:py-20 w-full overflow-x-hidden">
      <div className="container-custom px-4 md:px-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight mb-6 md:mb-12">Shopping Cart</h1>
        
        <div className="grid lg:grid-cols-3 gap-6 md:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.variant?.id}`} className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-100 flex gap-3 md:gap-6 items-center shadow-sm">
                <div className="h-16 w-16 md:h-24 md:w-24 bg-slate-50 rounded-lg md:rounded-xl flex-shrink-0 overflow-hidden relative border border-slate-50">
                  {item.product.images && item.product.images[0] && (
                    <img 
                      src={typeof item.product.images[0] === 'string' ? item.product.images[0] : item.product.images[0].url} 
                      alt={item.product.name}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-bold text-slate-900 truncate">{item.product.name}</h3>
                  {item.variant && (
                    <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5 md:mt-1">{item.variant.name}</p>
                  )}
                  <p className="text-primary font-black mt-0.5 md:mt-1 text-sm md:text-base">{formatPrice(item.product.price)}</p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 shrink-0">
                  <div className="flex items-center gap-1.5 md:gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity - 1)} 
                      className="h-6 w-6 md:h-7 md:w-7 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    </button>
                    <span className="font-black w-5 md:w-6 text-center text-xs md:text-sm">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product.id, item.variant?.id, item.quantity + 1)} 
                      className="h-6 w-6 md:h-7 md:w-7 rounded-md bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <Plus className="h-3 w-3 md:h-3.5 md:w-3.5" />
                    </button>
                  </div>
                  <button 
                    onClick={() => removeItem(item.product.id, item.variant?.id)} 
                    className="p-1.5 md:p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 md:space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/40 space-y-6">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-slate-900">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between text-slate-500 font-bold text-xs md:text-sm uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>{formatPrice(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold text-xs md:text-sm uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-[9px] md:text-[10px] bg-slate-100 px-2 py-0.5 rounded">Calculated at checkout</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between text-base md:text-lg font-black text-slate-900">
                  <span>Total</span>
                  <span>{formatPrice(getTotal())}</span>
                </div>
              </div>
              <Link 
                href="/checkout" 
                className="w-full h-12 md:h-14 bg-slate-900 text-white font-black uppercase tracking-widest rounded-xl md:rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
              >
                Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="bg-primary/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-primary/10">
              <p className="text-[10px] md:text-xs font-bold text-primary uppercase tracking-widest text-center">
                Free delivery on orders over $500
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
