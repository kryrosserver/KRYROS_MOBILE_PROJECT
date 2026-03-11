"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, RefreshCw, Bell, Settings, FileText, FileEdit, Users, 
  Package, CreditCard, ShoppingBag, ShoppingCart, Truck, 
  Database, RotateCcw, DollarSign, BarChart3, RotateCw, UserCheck, ChevronRight, ArrowRight 
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

type Summary = {
  sales: number;
  purchases: number;
  paymentReceived: number;
  paymentPaid: number;
  outstandingBalance: number;
  outstandingPayment: number;
  expense: number;
  profit: number;
};

export default function AdminDashboard() {
  const [summary, setSummary] = useState<Summary>({
    sales: 0,
    purchases: 0,
    paymentReceived: 0,
    paymentPaid: 0,
    outstandingBalance: 0,
    outstandingPayment: 0,
    expense: 0,
    profit: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/reports/summary?range=month", { cache: "no-store" });
      const data = await res.json().catch(() => null);
      if (data && data.stats) {
        setSummary({
          sales: data.stats.totalRevenue || 0,
          purchases: 0,
          paymentReceived: data.stats.totalRevenue || 0,
          paymentPaid: 0,
          outstandingBalance: 0,
          outstandingPayment: 0,
          expense: 0,
          profit: data.stats.totalRevenue || 0,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const quickActions = [
    { title: "New Invoice", icon: Plus, href: "/admin/invoice/new" },
    { title: "New Estimate", icon: Plus, href: "/admin/estimate/new" },
    { title: "New Payment", icon: Plus, href: "/admin/payment/new" },
  ];

  const modules = [
    { title: "Invoice", icon: FileText, href: "/admin/invoice" },
    { title: "Estimate", icon: FileEdit, href: "/admin/estimate" },
    { title: "Client / Supplier", icon: Users, href: "/admin/contacts" },
    { title: "Product/Service", icon: Package, href: "/admin/products" },
    { title: "Payment", icon: CreditCard, href: "/admin/payments" },
    { title: "Purchase", icon: ShoppingBag, href: "/admin/purchases" },
    { title: "Sale Order", icon: FileText, href: "/admin/sale-orders" },
    { title: "Purchase Order", icon: ShoppingCart, href: "/admin/purchase-orders" },
    { title: "Delivery Note", icon: FileText, href: "/admin/delivery-notes" },
    { title: "Inventory", icon: Database, href: "/admin/inventory" },
    { title: "Sale Return", icon: RotateCcw, href: "/admin/sale-returns" },
    { title: "Expense", icon: DollarSign, href: "/admin/expenses" },
    { title: "Reports", icon: BarChart3, href: "/admin/reports" },
    { title: "Purchase Return", icon: RotateCw, href: "/admin/purchase-returns" },
    { title: "Agent", icon: UserCheck, href: "/admin/agents" },
  ];

  const summaryCards = [
    { title: "Sales", subtitle: "Sales this month", value: summary.sales, color: "text-orange-500", href: "/admin/reports/sales" },
    { title: "Purchases", subtitle: "Purchase this month", value: summary.purchases, color: "text-orange-500", href: "/admin/reports/purchases" },
    { title: "Payment Received", subtitle: "Received this month", value: summary.paymentReceived, color: "text-green-500", href: "/admin/reports/payments-received" },
    { title: "Payment Paid", subtitle: "Paid this month", value: summary.paymentPaid, color: "text-red-500", href: "/admin/reports/payments-paid" },
    { title: "Outstanding Balance", subtitle: "This Month", value: summary.outstandingBalance, color: "text-green-500", href: "/admin/reports/outstanding-balance" },
    { title: "Outstanding Payment", subtitle: "This Month", value: summary.outstandingPayment, color: "text-red-500", href: "/admin/reports/outstanding-payment" },
    { title: "Expense", subtitle: "Expense this month", value: summary.expense, color: "text-slate-900", href: "/admin/expenses" },
    { title: "Profit / Loss", subtitle: "This Month", value: summary.profit, color: "text-green-500", href: "/admin/reports/profit-loss" },
  ];

  const orderStats = [
    { label: "Booked", count: 0, color: "bg-slate-300" },
    { label: "Processing", count: 0, color: "bg-orange-300" },
    { label: "Completed", count: 0, color: "bg-green-300" },
    { label: "Delivered", count: 0, color: "bg-cyan-400" },
    { label: "Cancelled", count: 0, color: "bg-pink-300" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {/* Dynamic Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 h-16 sticky top-0 z-30 flex items-center justify-between px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="h-6 w-[1px] bg-slate-200"></div>
          <p className="text-sm text-slate-500 hidden md:block">Business Insights & Controls</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setIsRefreshing(true); load().finally(() => setTimeout(() => setIsRefreshing(false), 300)); }}
            className={`p-2.5 rounded-xl hover:bg-slate-50 transition-all ${isRefreshing ? "text-green-600" : "text-slate-400"}`}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 transition-all relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>
          <button className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-50 transition-all">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="p-8 max-w-[1600px] mx-auto w-full space-y-8">
        {/* Welcome & Quick Actions Section */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500">Here's what's happening with your business today.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {quickActions.map((action, i) => (
              <Link 
                key={i} 
                href={action.href} 
                className="flex items-center gap-2.5 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-green-500/20 active:scale-95 group"
              >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                <span className="text-sm">{action.title}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Core Stats Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.slice(0, 4).map((card, i) => (
            <Link 
              key={i} 
              href={card.href} 
              className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-green-500/30 hover:shadow-2xl hover:shadow-green-500/5 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart3 className="h-12 w-12" />
              </div>
              <div className="space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.title}</span>
                  <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
                <div>
                  <h4 className={`text-2xl font-black ${card.color}`}>{formatPrice(card.value)}</h4>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">{card.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-8 space-y-8">
            {/* Modules Grid Section */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-slate-900">Business Management</h3>
                <Link href="/admin/settings" className="text-sm font-semibold text-green-600 hover:text-green-700">Customize Grid</Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {modules.map((m, i) => (
                  <Link 
                    key={i} 
                    href={m.href} 
                    className="flex flex-col items-center gap-3 group p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                  >
                    <div className="p-4 bg-slate-50 text-slate-500 group-hover:bg-green-500 group-hover:text-white rounded-2xl transition-all shadow-sm group-hover:shadow-green-500/30 group-hover:-translate-y-1">
                      <m.icon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors text-center">{m.title}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Additional Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {summaryCards.slice(4).map((card, i) => (
                <Link 
                  key={i} 
                  href={card.href} 
                  className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-lg transition-all flex items-center justify-between group"
                >
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
                    <p className={`text-xl font-black ${card.color}`}>{formatPrice(card.value)}</p>
                  </div>
                  <div className="h-10 w-10 bg-slate-50 group-hover:bg-green-50 rounded-xl flex items-center justify-center transition-colors">
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-green-600" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar Area */}
          <aside className="xl:col-span-4 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Order Progress</h3>
                <p className="text-sm text-slate-500">Live fulfillment tracking</p>
              </div>
              
              <div className="space-y-6">
                {orderStats.map((stat, i) => (
                  <div key={stat.label} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-full ${stat.color}`}></div>
                        <span className="text-sm font-bold text-slate-700">{stat.label}</span>
                      </div>
                      <span className="text-sm font-black text-slate-900">{stat.count}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stat.color} transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.05)]`}
                        style={{ width: `${stat.count > 0 ? 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-slate-100">
                <Link 
                  href="/admin/orders" 
                  className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all hover:shadow-xl active:scale-[0.98]"
                >
                  Manage All Orders
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Help/Support Mini Card */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-8 rounded-3xl text-white shadow-xl shadow-green-600/20">
              <h4 className="font-bold text-lg mb-2">Need Assistance?</h4>
              <p className="text-green-100 text-sm mb-6 leading-relaxed">Our support team is available 24/7 to help you with any platform issues.</p>
              <button className="w-full py-3 bg-white text-green-600 rounded-xl font-bold hover:bg-green-50 transition-colors">
                Contact Support
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


