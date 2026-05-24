"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  CreditCard,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Package,
  RefreshCw
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

const ACCENT = "#12D6C5";

type Summary = {
  stats: { totalRevenue: number; totalOrders: number; activeUsers: number; creditDisbursed: number };
  revenueSeries: { label: string; revenue: number; orders: number }[];
  topProducts: { name: string; sales: number; revenue: number; growth?: number }[];
  recentTransactions: { id: string; customer: string; amount: number; status: string; date: string }[];
  credit: { activeAccounts: number; totalOutstanding: number; repaymentRate: number; defaultRate: number };
  salesByCategory: { name: string; value: number }[];
};

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState("year");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefresh = () => {
    setIsRefreshing(true);
    load().finally(() => setTimeout(() => setIsRefreshing(false), 300));
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/internal/admin/reports/summary?range=${encodeURIComponent(dateRange)}`, { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed to load reports");
      setData(body);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [dateRange]);

  const statCards = useMemo(() => {
    const s = data?.stats;
    if (!s) return [];
    const fmt = (n: number) => formatPrice(Number(n || 0));
    return [
      { title: "Total Revenue", value: fmt(s.totalRevenue), trend: "up", icon: DollarSign, bg: "bg-teal-50", iconColor: "text-[#12D6C5]" },
      { title: "Total Orders", value: (s.totalOrders || 0).toLocaleString(), trend: "up", icon: ShoppingCart, bg: "bg-blue-50", iconColor: "text-blue-600" },
      { title: "Active Users", value: (s.activeUsers || 0).toLocaleString(), trend: "up", icon: Users, bg: "bg-purple-50", iconColor: "text-purple-600" },
      { title: "Credit Disbursed", value: fmt(s.creditDisbursed), trend: "up", icon: CreditCard, bg: "bg-amber-50", iconColor: "text-amber-600" },
    ];
  }, [data]);

  const revenueData = data?.revenueSeries || [];
  const maxRevenue = revenueData.length ? Math.max(...revenueData.map(d => d.revenue)) : 1;
  const topProducts = data?.topProducts || [];
  const recentTransactions = data?.recentTransactions || [];
  const credit = data?.credit;
  const categories = data?.salesByCategory || [];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="mt-1 text-slate-500 text-sm">Track performance and business insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="admin-input !min-h-[44px] !w-auto px-4"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={handleRefresh}
            className="btn-secondary !h-[44px] !w-[44px] !px-0"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button className="btn-primary flex items-center gap-2 px-4 !h-[44px]">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-card !p-4 bg-red-50 border-red-200 text-red-700 text-sm">{error}</div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="admin-card animate-pulse">
              <div className="h-10 w-10 bg-slate-100 rounded-xl mb-4" />
              <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
              <div className="h-7 bg-slate-100 rounded w-3/4" />
            </div>
          ))
        ) : statCards.map((stat) => (
          <div key={stat.title} className="admin-card !p-5">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.bg} mb-4`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <p className="text-sm text-slate-500">{stat.title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Revenue Overview</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ background: ACCENT }} />
              <span className="text-slate-500">Revenue</span>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="h-64 bg-slate-50 rounded-xl animate-pulse" />
        ) : revenueData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400">No data available for this period</div>
        ) : (
          <div className="h-64 flex items-end gap-2">
            {revenueData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full rounded-t-lg relative group cursor-pointer"
                  style={{ height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%`, background: `${ACCENT}20` }}
                >
                  <div 
                    className="absolute bottom-0 left-0 right-0 rounded-t-lg transition-opacity group-hover:opacity-80"
                    style={{ height: "100%", background: ACCENT }}
                  />
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {formatPrice(Number(d.revenue))}
                  </div>
                </div>
                <span className="text-xs text-slate-500">{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-900">Top Products</h2>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-slate-50 rounded-xl animate-pulse" />)}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data available</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-400 w-6">#{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900 text-sm">{product.name}</span>
                      <span className={`text-xs font-semibold ${(product.growth ?? 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {(product.growth ?? 0) >= 0 ? "+" : ""}{product.growth ?? 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mt-0.5">
                      <span>{product.sales} sales</span>
                      <span className="font-semibold text-slate-700">{formatPrice(Number(product.revenue))}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(5, (product.sales / (topProducts[0]?.sales || 1)) * 100)}%`, background: ACCENT }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-900">Recent Transactions</h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />)}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No transactions found</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((txn) => {
                const isPaid = txn.status === "paid" || txn.status === "completed";
                const isPending = txn.status === "pending";
                return (
                  <div key={txn.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${isPaid ? "bg-teal-50" : isPending ? "bg-amber-50" : "bg-red-50"}`}>
                        <DollarSign className={`h-4 w-4 ${isPaid ? "text-[#12D6C5]" : isPending ? "text-amber-500" : "text-red-500"}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{txn.customer}</p>
                        <p className="text-xs text-slate-500">{txn.id} · {txn.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900 text-sm">{formatPrice(Number(txn.amount))}</p>
                      <span className={`badge text-xs ${isPaid ? "badge-success" : isPending ? "badge-warning" : "badge-danger"}`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Credit Performance */}
      <div className="admin-card">
        <h2 className="text-base font-semibold text-slate-900 mb-5">Credit System Performance</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Active Credit Accounts", value: (credit?.activeAccounts ?? 0).toLocaleString() },
            { label: "Total Outstanding", value: formatPrice(Number(credit?.totalOutstanding || 0)) },
            { label: "Repayment Rate", value: `${(credit?.repaymentRate ?? 0).toFixed(1)}%` },
            { label: "Default Rate", value: `${(credit?.defaultRate ?? 0).toFixed(1)}%` },
          ].map((m, i) => (
            <div key={i} className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500 mb-1">{m.label}</p>
              <p className="text-2xl font-bold text-slate-900">{loading ? "—" : m.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sales by Category */}
      {(categories.length > 0 || loading) && (
        <div className="admin-card">
          <h2 className="text-base font-semibold text-slate-900 mb-5">Sales by Category</h2>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => <div key={i} className="h-24 bg-slate-50 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {categories.map((cat, idx) => {
                const colors = ["#12D6C5", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#6366F1"];
                const color = colors[idx % colors.length];
                return (
                  <div key={cat.name} className="text-center p-4 bg-slate-50 rounded-xl">
                    <div className="h-2 rounded-full mb-3 mx-auto" style={{ width: `${cat.value}%`, background: color, maxWidth: "100%" }} />
                    <p className="font-semibold text-slate-900 text-sm">{cat.name}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color }}>{cat.value}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
