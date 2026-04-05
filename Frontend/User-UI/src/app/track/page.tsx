"use client"

import { useState } from "react"
import { ordersApi } from "@/lib/api"
import { Search, Package, Truck, CheckCircle2, MapPin, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function TrackOrderPage() {
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
                  placeholder="e.g. KRY-12345" 
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
                    style={{ width: `${(getStatusStep(order.status) / 3) * 100}%` }}
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

                <div className="grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-slate-400" />
                      <h3 className="font-bold text-slate-900">Delivery Address</h3>
                    </div>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed ml-8">
                      {order.shippingAddress.address}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state}
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Package className="h-5 w-5 text-slate-400" />
                      <h3 className="font-bold text-slate-900">Order Summary</h3>
                    </div>
                    <p className="text-sm text-slate-500 font-medium ml-8">
                      {order.items.length} items • Total: K{order.total.toLocaleString()}
                    </p>
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
