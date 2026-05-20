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
    { title: "Total Sales", subtitle: "Sales this month", value: summary.sales, valueColor: '#F59E0B', href: "/admin/reports/sales" },
    { title: "Purchases", subtitle: "Purchase this month", value: summary.purchases, valueColor: '#F59E0B', href: "/admin/reports/purchases" },
    { title: "Payment Received", subtitle: "Received this month", value: summary.paymentReceived, valueColor: '#16C784', href: "/admin/reports/payments-received" },
    { title: "Payment Paid", subtitle: "Paid this month", value: summary.paymentPaid, valueColor: '#EF4444', href: "/admin/reports/payments-paid" },
    { title: "Outstanding Balance", subtitle: "This Month", value: summary.outstandingBalance, valueColor: '#16C784', href: "/admin/reports/outstanding-balance" },
    { title: "Outstanding Payment", subtitle: "This Month", value: summary.outstandingPayment, valueColor: '#EF4444', href: "/admin/reports/outstanding-payment" },
    { title: "Expense", subtitle: "Expense this month", value: summary.expense, valueColor: '#111827', href: "/admin/expenses" },
    { title: "Profit / Loss", subtitle: "This Month", value: summary.profit, valueColor: '#16C784', href: "/admin/reports/profit-loss" },
  ];

  const orderStats = [
    { label: "Booked", count: 0, color: '#AAB4C5' },
    { label: "Processing", count: 0, color: '#3B82F6' },
    { label: "Completed", count: 0, color: '#16C784' },
    { label: "Delivered", count: 0, color: '#12D6C5' },
    { label: "Cancelled", count: 0, color: '#EF4444' },
  ];

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F7F9FC' }}>
      {/* Top Header */}
      <header
        className="h-16 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8"
        style={{
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          boxShadow: '0 1px 0 #E5E7EB',
        }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg md:text-xl font-bold" style={{ color: '#111827' }}>
            Admin Dashboard
          </h1>
          <div className="hidden sm:block h-5 w-px" style={{ background: '#E5E7EB' }} />
          <p className="hidden md:block text-sm" style={{ color: '#6B7280' }}>
            Business Insights & Controls
          </p>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button
            onClick={() => { setIsRefreshing(true); load().finally(() => setTimeout(() => setIsRefreshing(false), 300)); }}
            className="p-2 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: isRefreshing ? '#12D6C5' : '#6B7280' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F7F9FC'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            className="p-2 rounded-xl transition-all relative min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: '#6B7280' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F7F9FC'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
          </button>
          <button
            className="p-2 rounded-xl transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
            style={{ color: '#6B7280' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#F7F9FC'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full space-y-6 md:space-y-8">
        {/* Welcome + Quick Actions */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: '#111827' }}>
              Welcome Back 👋
            </h2>
            <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
              Here's what's happening with your business today.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            {quickActions.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className="flex items-center gap-2 text-sm font-semibold text-white rounded-[14px] transition-all active:scale-95"
                style={{
                  padding: '0 20px',
                  height: '44px',
                  background: '#12D6C5',
                  boxShadow: '0 8px 20px rgba(18,214,197,0.25)',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#10C4B5'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(18,214,197,0.35)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#12D6C5'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(18,214,197,0.25)'; }}
              >
                <Plus className="h-4 w-4" />
                {action.title}
              </Link>
            ))}
          </div>
        </section>

        {/* Core Stats — top 4 */}
        <section className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {summaryCards.slice(0, 4).map((card, i) => (
            <Link
              key={i}
              href={card.href}
              className="relative overflow-hidden transition-all group"
              style={{
                background: '#FFFFFF',
                borderRadius: '22px',
                border: '1px solid #E5E7EB',
                padding: '24px',
                boxShadow: '0 10px 35px rgba(15,23,42,0.06)',
                display: 'block',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(18,214,197,0.4)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(18,214,197,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = '0 10px 35px rgba(15,23,42,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div className="absolute top-0 right-0 p-3 opacity-[0.04] group-hover:opacity-[0.07] transition-opacity">
                <BarChart3 className="h-12 w-12" />
              </div>
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: '#6B7280' }}
                  >
                    {card.title}
                  </span>
                  <div
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: '#F7F9FC' }}
                  >
                    <ChevronRight className="h-3.5 w-3.5" style={{ color: '#6B7280' }} />
                  </div>
                </div>
                <p
                  className="text-2xl font-black"
                  style={{ color: card.valueColor }}
                >
                  {formatPrice(card.value)}
                </p>
                <p className="text-xs mt-1 font-medium" style={{ color: '#9CA3AF' }}>
                  {card.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
          {/* Main Content */}
          <div className="xl:col-span-8 space-y-6">
            {/* Business Modules Grid */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '22px',
                border: '1px solid #E5E7EB',
                padding: '28px',
                boxShadow: '0 10px 35px rgba(15,23,42,0.06)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
                <h3 className="text-base font-bold" style={{ color: '#111827' }}>
                  Business Management
                </h3>
                <Link
                  href="/admin/settings"
                  className="text-sm font-semibold transition-colors"
                  style={{ color: '#12D6C5' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#10C4B5')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#12D6C5')}
                >
                  Customize Grid
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-4 gap-3">
                {modules.map((m, i) => (
                  <Link
                    key={i}
                    href={m.href}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F7F9FC'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <div
                      className="p-3 rounded-xl transition-all flex items-center justify-center"
                      style={{ background: '#F7F9FC' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#12D6C5'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px rgba(18,214,197,0.3)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#F7F9FC'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                    >
                      <m.icon className="h-5 w-5" style={{ color: '#6B7280' }} strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-bold text-center" style={{ color: '#111827' }}>
                      {m.title}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Additional Stats — bottom 4 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5">
              {summaryCards.slice(4).map((card, i) => (
                <Link
                  key={i}
                  href={card.href}
                  className="flex items-center justify-between transition-all"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '22px',
                    border: '1px solid #E5E7EB',
                    padding: '20px 24px',
                    boxShadow: '0 10px 35px rgba(15,23,42,0.06)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(18,214,197,0.3)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(18,214,197,0.07)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.boxShadow = '0 10px 35px rgba(15,23,42,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-widest mb-1"
                      style={{ color: '#6B7280' }}
                    >
                      {card.title}
                    </p>
                    <p className="text-xl font-black" style={{ color: card.valueColor }}>
                      {formatPrice(card.value)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{card.subtitle}</p>
                  </div>
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    style={{ background: '#F7F9FC' }}
                  >
                    <ChevronRight className="h-4 w-4" style={{ color: '#6B7280' }} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="xl:col-span-4 space-y-5">
            {/* Order Progress */}
            <div
              style={{
                background: '#FFFFFF',
                borderRadius: '22px',
                border: '1px solid #E5E7EB',
                padding: '28px',
                boxShadow: '0 10px 35px rgba(15,23,42,0.06)',
              }}
            >
              <div className="mb-6">
                <h3 className="text-base font-bold" style={{ color: '#111827' }}>
                  Order Progress
                </h3>
                <p className="text-sm mt-0.5" style={{ color: '#6B7280' }}>
                  Live fulfillment tracking
                </p>
              </div>

              <div className="space-y-4">
                {orderStats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ background: stat.color }}
                        />
                        <span className="text-sm font-semibold" style={{ color: '#111827' }}>
                          {stat.label}
                        </span>
                      </div>
                      <span className="text-sm font-black" style={{ color: '#111827' }}>
                        {stat.count}
                      </span>
                    </div>
                    <div
                      className="h-1.5 w-full rounded-full overflow-hidden"
                      style={{ background: '#F7F9FC' }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${stat.count > 0 ? 100 : 0}%`,
                          background: stat.color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5" style={{ borderTop: '1px solid #E5E7EB' }}>
                <Link
                  href="/admin/orders"
                  className="flex items-center justify-center gap-2 w-full font-bold text-sm text-white rounded-[14px] transition-all active:scale-[0.98]"
                  style={{
                    height: '48px',
                    background: '#0B1320',
                    boxShadow: '0 8px 20px rgba(11,19,32,0.2)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#182131'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#0B1320'; }}
                >
                  Manage Orders
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Support Card */}
            <div
              style={{
                borderRadius: '22px',
                padding: '28px',
                background: 'linear-gradient(135deg, #0B1320 0%, #182131 100%)',
                border: '1px solid #2B3648',
                boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(18,214,197,0.12)', border: '1px solid rgba(18,214,197,0.2)' }}
              >
                <Settings className="h-5 w-5" style={{ color: '#12D6C5' }} />
              </div>
              <h4 className="font-bold text-base mb-2 text-white">Need Assistance?</h4>
              <p className="text-sm mb-5 leading-relaxed" style={{ color: '#AAB4C5' }}>
                Our support team is available 24/7 to help you with any platform issues.
              </p>
              <button
                className="w-full font-bold text-sm rounded-[14px] transition-all"
                style={{
                  height: '44px',
                  background: '#12D6C5',
                  color: '#0B1320',
                  border: 'none',
                  boxShadow: '0 8px 20px rgba(18,214,197,0.25)',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#1DE9D3'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#12D6C5'; }}
              >
                Contact Support
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
