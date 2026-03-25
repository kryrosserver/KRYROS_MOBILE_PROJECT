"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  AlertCircle,
  ArrowLeft,
  Calendar,
  CreditCard,
  MapPin
} from "lucide-react";
import { ordersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useCurrency } from "@/providers/CurrencyProvider";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { convertPrice, formatLocal, selectedCountry } = useCurrency();
  
  const [orderNumber, setOrderNumber] = useState(searchParams.get("id") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber || !email) {
      setError("Please enter both Order ID and Email");
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await ordersApi.trackOrder(orderNumber, email);
      if (res.data) {
        setOrder(res.data);
        // Update URL for easy sharing/refreshing
        router.push(`/track-order?id=${orderNumber}&email=${email}`, { scroll: false });
      } else {
        setError(res.error || "Order not found. Please check your details.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-track if params are present
  useEffect(() => {
    if (searchParams.get("id") && searchParams.get("email")) {
      handleTrack();
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED": return "text-green-600 bg-green-50 border-green-100";
      case "SHIPPED": return "text-blue-600 bg-blue-50 border-blue-100";
      case "PROCESSING": return "text-orange-600 bg-orange-50 border-orange-100";
      case "CANCELLED": return "text-red-600 bg-red-50 border-red-100";
      default: return "text-slate-600 bg-slate-50 border-slate-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "DELIVERED": return CheckCircle2;
      case "SHIPPED": return Truck;
      case "PROCESSING": return Clock;
      case "CANCELLED": return AlertCircle;
      default: return Package;
    }
  };

  const displayPrice = (amount: number) => {
    if (selectedCountry?.code === "US" || !selectedCountry) {
      return formatPrice(amount);
    }
    return formatLocal(convertPrice(amount).amount);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-10">
      <div className="mx-auto max-w-3xl px-4">
        
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Track Your Order</h1>
          <p className="mt-2 text-slate-500">Enter your order details to see real-time updates</p>
        </div>

        {/* Tracking Form */}
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 mb-8">
          <form onSubmit={handleTrack} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Order ID</label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="e.g. ORD-123456"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="pl-10 h-12 bg-slate-50 border-slate-200 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Email Address</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-slate-50 border-slate-200 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="sm:col-span-2 mt-2">
              <Button 
                type="submit" 
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Tracking...
                  </div>
                ) : "Track Now"}
              </Button>
            </div>
          </form>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>

        {/* Tracking Results */}
        {order && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Status Card */}
            <div className="rounded-2xl bg-white p-8 shadow-sm border border-slate-100 mb-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${getStatusColor(order.status)}`}>
                    {(() => {
                      const Icon = getStatusIcon(order.status);
                      return <Icon className="h-8 w-8" />;
                    })()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Order Status</p>
                    <h2 className="text-2xl font-black text-slate-900 uppercase">{order.status}</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">Payment: <span className="font-bold">{order.paymentStatus}</span></p>
                  </div>
                </div>
                <div className="flex flex-col md:items-end">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expected Delivery</p>
                  <p className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    3-5 Business Days
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-10 relative px-4">
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-green-500 -translate-y-1/2 transition-all duration-1000"
                  style={{ width: order.status === 'DELIVERED' ? '100%' : order.status === 'SHIPPED' ? '66%' : order.status === 'CONFIRMED' || order.status === 'PROCESSING' ? '33%' : '0%' }}
                ></div>
                <div className="relative flex justify-between">
                  {[
                    { label: 'Confirmed', value: 'CONFIRMED' },
                    { label: 'Shipped', value: 'SHIPPED' },
                    { label: 'Delivered', value: 'DELIVERED' }
                  ].map((step, idx) => {
                    const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                    const currentIdx = statusOrder.indexOf(order.status.toUpperCase());
                    const stepIdx = statusOrder.indexOf(step.value);
                    const isActive = currentIdx >= stepIdx && currentIdx !== 0;
                    
                    return (
                      <div key={step.label} className="flex flex-col items-center">
                        <div className={`h-4 w-4 rounded-full border-4 border-white shadow-sm transition-colors duration-500 ${isActive ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                        <span className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-green-600' : 'text-slate-400'}`}>{step.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Order Items */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                        <Image 
                          src={item.image || "/placeholder.png"} 
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{item.variant}</p>
                        <p className="text-xs text-slate-500 font-medium">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-black text-slate-900">{displayPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Subtotal</span>
                    <span>{displayPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Shipping</span>
                    <span>{order.shipping === 0 ? "FREE" : displayPrice(order.shipping)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Tax (16%)</span>
                    <span>{displayPrice(order.tax)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <span className="text-sm font-bold text-slate-400">Total</span>
                    <span className="text-xl font-black text-green-600">{displayPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Info Column */}
              <div className="space-y-6">
                {/* Shipping Address */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4 mb-4">Delivery Info</h3>
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{order.shippingAddress?.firstName} {order.shippingAddress?.lastName}</p>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.country}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-50 pb-4 mb-4">Payment Method</h3>
                  <div className="flex gap-3 items-center">
                    <div className="h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center">
                      <CreditCard className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 uppercase">{order.paymentMethod.replace(/_/g, ' ')}</p>
                      <p className={`text-[10px] font-bold uppercase ${order.paymentStatus === 'PAID' ? 'text-green-500' : 'text-orange-500'}`}>
                        {order.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Need Help */}
                <div className="rounded-2xl bg-[#00155a] p-6 shadow-sm text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold">Need Help?</h3>
                    <p className="text-xs text-white/70 mt-1">If you have any questions about your order, contact us on WhatsApp.</p>
                    <Button 
                      asChild
                      className="mt-4 bg-white text-[#00155a] hover:bg-white/90 font-bold rounded-xl"
                    >
                      <a href="https://wa.me/260966423719" target="_blank">
                        Chat with Support
                      </a>
                    </Button>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                    <Package size={120} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Back Home */}
        <div className="mt-12 text-center">
          <Link href="/" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-green-600 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
