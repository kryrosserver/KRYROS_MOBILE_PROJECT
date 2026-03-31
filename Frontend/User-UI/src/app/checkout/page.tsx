"use client"

import { useCart } from "@/providers/CartProvider"
import { formatPrice } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheck, Truck, CreditCard, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { items, getSubtotal, getTotal } = useCart()
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    phone: "",
  })

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 mb-4">Your cart is empty</h1>
        <Link href="/shop">
          <Button className="font-black uppercase tracking-widest px-8 h-12">Return to Shop</Button>
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-20">
      <div className="container-custom">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Checkout Form */}
          <div className="flex-1 space-y-10">
            <div>
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-8">Checkout</h1>
              
              <div className="space-y-8">
                {/* Contact Information */}
                <section>
                  <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">1</span>
                    Contact Information
                  </h2>
                  <div className="grid gap-4">
                    <Input 
                      placeholder="Email Address" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <Input 
                      placeholder="Phone Number" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </section>

                {/* Shipping Address */}
                <section>
                  <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">2</span>
                    Shipping Address
                  </h2>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        placeholder="First Name" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                      />
                      <Input 
                        placeholder="Last Name" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                      />
                    </div>
                    <Input 
                      placeholder="Street Address" 
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                    />
                    <Input 
                      placeholder="City / Town" 
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                </section>

                {/* Payment Method Placeholder */}
                <section>
                  <h2 className="text-sm font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px]">3</span>
                    Payment Method
                  </h2>
                  <div className="p-6 border border-slate-200 rounded-2xl bg-white space-y-4">
                    <div className="flex items-center gap-4 p-4 border border-primary bg-primary/5 rounded-xl">
                      <div className="h-5 w-5 rounded-full border-4 border-primary" />
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">Direct Bank Transfer / Mobile Money</p>
                        <p className="text-xs text-slate-500">Pay directly into our bank account or via Mobile Money.</p>
                      </div>
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm sticky top-24 space-y-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">Order Summary</h2>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.variant?.id}`} className="flex gap-4">
                    <div className="h-16 w-16 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={typeof item.product.images?.[0] === 'string' ? item.product.images[0] : item.product.images?.[0]?.url || ""} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{item.variant?.name || "Standard"}</p>
                      <p className="text-sm font-black text-primary mt-1">{formatPrice(item.product.price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-slate-100" />
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>{formatPrice(getSubtotal())}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-500 uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">Calculated at next step</span>
                </div>
                <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-slate-50">
                  <span>Total</span>
                  <span>{formatPrice(getTotal())}</span>
                </div>
              </div>

              <Button className="w-full h-14 font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20">
                Place Order <ChevronRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  Secure Checkout
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Truck className="h-4 w-4 text-blue-500" />
                  Fast Delivery
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
