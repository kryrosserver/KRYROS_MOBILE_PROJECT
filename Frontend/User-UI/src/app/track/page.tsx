"use client"

import { useState } from "react"
import { ordersApi } from "@/lib/api"
import { Search, Package, Truck, CheckCircle2, MapPin, AlertCircle, Calendar, User, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCurrency } from "@/providers/CurrencyProvider"

export default function TrackOrderPage() {
  const { formatLocal, convertPrice, selectedCountry } = useCurrency()
  const [orderNumber, setOrderNumber] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setOrder(null)

    try {
      // Clean order number (remove # if present and trim)
      const cleanOrderNumber = orderNumber.replace(/#/g, "").trim()
      const res = await ordersApi.trackOrder(cleanOrderNumber, email.trim())
      if (res.data) {
        setOrder(res.data)
      } else {
        setError(res.error || "Order not found. Please check your details.")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  const getStatusStep = (status: string) => {
    const steps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    return steps.indexOf(status.toUpperCase())
  }

  const displayPrice = (amount: number) => {
    const converted = convertPrice(amount)
    return formatLocal(converted.amount)
  }

  return (
    <main className="min-h-screen bg-slate-50 py-12 md:py-24">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tight">Track Your <span className="text-primary">Order</span></h1>
            <p className="text-slate-500 font-medium">Enter your order details below to see its real-time status.</p>
          </div>

          {/* Tracking Form */}
          <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <form onSubmit={handleTrack} className="grid md:grid-cols-3 gap-6 items-end">
              <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Order Number</label>
                <Input 
                  placeholder="e.g. 0F51K9I" 
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button className="h-10 font-black uppercase tracking-widest" disabled={loading}>
                {loading ? "Searching..." : "Track Order"}
              </Button>
            </form>

            {error && (
              <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-medium">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}
          </div>

          {/* Tracking Results */}
          {order && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-12">
                <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-slate-50 pb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                    <h2 className="text-2xl font-black text-primary uppercase tracking-tight mt-1">{order.status || order.shippingStatus}</h2>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Number</p>
                    <p className="font-bold text-slate-900 mt-1">#{order.orderNumber}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.max(0, (getStatusStep(order.status) / 3) * 100)}%` }}
                  />
                  
                  <div className="relative flex justify-between">
                    {['Pending', 'Processing', 'Shipped', 'Delivered'].map((step, i) => {
                      const isActive = i <= getStatusStep(order.status)
                      return (
                        <div key={step} className="flex flex-col items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center border-4 ${isActive ? 'bg-primary border-primary text-white' : 'bg-white border-slate-100 text-slate-200'} transition-colors duration-500`}>
                            {i === 0 && <Package className="h-4 w-4" />}
                            {i === 1 && <Search className="h-4 w-4" />}
                            {i === 2 && <Truck className="h-4 w-4" />}
                            {i === 3 && <CheckCircle2 className="h-4 w-4" />}
                          </div>
                          <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-slate-900' : 'text-slate-300'}`}>{step}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-slate-50">
                  <div className="space-y-8">
                    {/* Customer & Date */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <User className="h-3 w-3" />
                          Customer
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {order.customer?.firstName} {order.customer?.lastName}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                          <Calendar className="h-3 w-3" />
                          Date
                        </div>
                        <p className="text-sm font-bold text-slate-900">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <MapPin className="h-3 w-3" />
                        Delivery Address
                      </div>
                      <div className="text-sm text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {order.shippingAddress?.address}<br />
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}<br />
                        {order.shippingAddress?.country}<br />
                        <span className="text-slate-400 mt-2 block">{order.shippingAddress?.phone}</span>
                      </div>
                    </div>

                    {/* Payment Info */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <CreditCard className="h-3 w-3" />
                        Payment Method
                      </div>
                      <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{order.paymentMethod?.replace(/_/g, ' ')}</p>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${
                          order.paymentStatus === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <Package className="h-3 w-3" />
                      Order Items
                    </div>
                    
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 p-3 rounded-2xl border border-slate-50 hover:border-slate-100 transition-colors">
                          <div className="h-16 w-16 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-200"><Package className="h-6 w-6" /></div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.variant || "Standard"}</p>
                            <div className="flex justify-between items-end mt-1">
                              <p className="text-xs text-slate-500 font-medium">{item.quantity}x {displayPrice(item.price)}</p>
                              <p className="text-sm font-black text-primary">{displayPrice(item.total)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-3">
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Subtotal</span>
                        <span className="text-slate-900">{displayPrice(order.subtotal)}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-[10px] font-black text-green-500 uppercase tracking-widest">
                          <span>Discount</span>
                          <span>-{displayPrice(order.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Shipping</span>
                        <span className="text-slate-900">{displayPrice(order.shipping)}</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Tax (VAT)</span>
                        <span className="text-slate-900">{displayPrice(order.tax)}</span>
                      </div>
                      <div className="h-px bg-slate-200 my-2" />
                      <div className="flex justify-between text-xl font-black text-slate-900">
                        <span>Total</span>
                        <span className="text-primary">{displayPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

