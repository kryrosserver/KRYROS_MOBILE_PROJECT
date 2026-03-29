"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Package, 
  CreditCard, 
  Wallet, 
  User, 
  Settings, 
  Heart, 
  Clock,
  ArrowRight,
  ShoppingBag,
  Download
} from "lucide-react";
import { ordersApi, walletApi, creditApi, wishlistApi } from "@/lib/api";
import { formatPrice } from "@/lib/utils";

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any | null>(null);
  const [credits, setCredits] = useState<any[]>([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [mounted, isLoading, isAuthenticated, router]);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [o, w, c, wl] = await Promise.all([
          ordersApi.getMyOrders(),
          walletApi.getBalance(),
          creditApi.getMyCredits(),
          wishlistApi.getMine(),
        ]);
        if (!active) return;
        setOrders(Array.isArray(o.data) ? o.data : []);
        setWallet(w.data || null);
        setCredits(Array.isArray(c.data) ? c.data : []);
        setWishlistCount(Array.isArray(wl.data) ? wl.data.length : 0);
      } finally {
        if (active) setLoadingData(false);
      }
    }
    if (isAuthenticated) load();
    return () => { active = false };
  }, [isAuthenticated]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      
      <div className="bg-slate-900 py-8 md:py-12">
        <div className="mx-auto max-w-7xl px-3 md:px-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-2xl font-bold text-white">
              {user?.firstName?.[0] || "U"}{user?.lastName?.[0] || ""}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {user?.firstName || "User"}!
              </h1>
              <p className="text-slate-400">{user?.email || ""}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Stats Grid */}
        <div className="mb-6 md:mb-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {[
            { label: "Total Orders", value: String(orders.length), icon: Package, color: "bg-blue-500" },
            { label: "Active Installments", value: String(credits.filter((x:any)=> (x.status||'').toLowerCase()==='active').length), icon: CreditCard, color: "bg-green-500" },
            { label: "Wallet Balance", value: formatPrice(Number(wallet?.balance || 0)), icon: Wallet, color: "bg-purple-500" },
            { label: "Wishlist Items", value: String(wishlistCount), icon: Heart, color: "bg-red-500" },
          ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-900">{loadingData ? "—" : stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Orders */}
            <div className="rounded-xl bg-white p-6 shadow-sm overflow-hidden">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  Recent Orders
                </h2>
                <Link href="/dashboard/orders" className="text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                  View All
                </Link>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="pb-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Order ID</th>
                      <th className="pb-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Date</th>
                      <th className="pb-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                      <th className="pb-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total</th>
                      <th className="pb-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(orders.slice(0,3)).map((order:any) => (
                      <tr key={order.id} className="border-b border-slate-50 last:border-0 group">
                        <td className="py-4">
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{order.orderNumber || order.id}</span>
                        </td>
                        <td className="py-4 text-sm text-slate-600 font-medium">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                            (order.status || '').toLowerCase() === "delivered" ? "bg-green-100 text-green-700" :
                            (order.status || '').toLowerCase() === "shipped" ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {order.status || "PENDING"}
                          </span>
                        </td>
                        <td className="py-4 text-sm font-bold text-slate-900">{formatPrice(Number(order.total || 0))}</td>
                        <td className="py-4 text-right">
                          <Link href={`/dashboard/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="font-bold text-xs uppercase tracking-widest text-slate-400 hover:text-blue-600">
                              Details
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Professional App Layout */}
              <div className="flex flex-col gap-4 md:hidden">
                {(orders.slice(0,3)).map((order:any) => (
                  <Link 
                    key={order.id} 
                    href={`/dashboard/orders/${order.id}`}
                    className="flex flex-col gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50 active:scale-[0.98] transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Number</p>
                        <p className="font-bold text-slate-900">{order.orderNumber || order.id.slice(0,8)}</p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest ${
                        (order.status || '').toLowerCase() === "delivered" ? "bg-green-100 text-green-700" :
                        (order.status || '').toLowerCase() === "shipped" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.status || "PENDING"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</p>
                        <p className="font-black text-blue-600">{formatPrice(Number(order.total || 0))}</p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Active Installments */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Active Installments</h2>
                <Link href="/dashboard/installments" className="text-sm text-green-600 hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {credits.slice(0,3).map((inst:any) => (
                  <div key={inst.id} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                          <CreditCard className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{inst.product?.name || "Product"}</p>
                          <p className="text-sm text-slate-500">Due: {inst.nextPaymentDate ? new Date(inst.nextPaymentDate).toLocaleDateString() : "—"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500">Monthly: {formatPrice(Number(inst.monthlyPayment || 0))}</p>
                        <p className="font-medium text-slate-900">Remaining: {formatPrice(Number(inst.remainingAmount || 0))}</p>
                      </div>
                    </div>
                    <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
                      <div className="h-2 w-1/3 rounded-full bg-green-500"></div>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">33% paid • 6 payments remaining</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-xl bg-white p-4 md:p-6 shadow-sm">
              <h2 className="mb-3 md:mb-4 text-lg font-semibold text-slate-900">Quick Actions</h2>
              <div className="space-y-1">
                <Link href="/shop" className="flex items-center justify-between rounded-lg p-3 hover:bg-slate-50 min-h-[48px]">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-slate-900">Continue Shopping</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link href="/credit" className="flex items-center justify-between rounded-lg p-3 hover:bg-slate-50 min-h-[48px]">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-slate-900">Apply for Credit</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link href="/dashboard/wallet" className="flex items-center justify-between rounded-lg p-3 hover:bg-slate-50 min-h-[48px]">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-slate-900">Add to Wallet</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
                <Link href="/dashboard/wishlist" className="flex items-center justify-between rounded-lg p-3 hover:bg-slate-50 min-h-[48px]">
                  <div className="flex items-center gap-3">
                    <Heart className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-slate-900">Wishlist</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Account Menu */}
            <div className="rounded-xl bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">My Account</h2>
              <div className="space-y-1">
                {[
                  { icon: User, label: "Profile", href: "/dashboard/profile" },
                  { icon: Package, label: "Orders", href: "/dashboard/orders" },
                  { icon: CreditCard, label: "Installments", href: "/dashboard/installments" },
                  { icon: Wallet, label: "Wallet", href: "/dashboard/wallet" },
                  { icon: Download, label: "Downloads", href: "/dashboard/downloads" },
                  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg p-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Need Help */}
            <div className="rounded-xl bg-gradient-to-br from-green-500 to-green-600 p-6 text-white">
              <h2 className="mb-2 text-lg font-semibold">Need Help?</h2>
              <p className="mb-4 text-sm text-green-100">
                Our support team is available 24/7 to assist you with any questions.
              </p>
              <Button variant="secondary" className="w-full bg-white text-green-600 hover:bg-green-50">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
