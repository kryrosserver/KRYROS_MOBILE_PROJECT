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
      { title: "Total Revenue", value: fmt(s.totalRevenue), change: "", trend: "up", icon: DollarSign, color: "green" },
      { title: "Total Orders", value: (s.totalOrders || 0).toLocaleString(), change: "", trend: "up", icon: ShoppingCart, color: "blue" },
      { title: "Active Users", value: (s.activeUsers || 0).toLocaleString(), change: "", trend: "up", icon: Users, color: "purple" },
      { title: "Credit Disbursed", value: fmt(s.creditDisbursed), change: "", trend: "up", icon: CreditCard, color: "orange" },
    ];
  }, [data]);

  const revenueData = data?.revenueSeries || [];
  const maxRevenue = revenueData.length ? Math.max(...revenueData.map(d => d.revenue)) : 1;
  const topProducts = data?.topProducts || [];
  const recentTransactions = data?.recentTransactions || [];
  const credit = data?.credit;
  const categories = data?.salesByCategory || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="mt-1 text-slate-600">Track performance and business insights</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg bg-white text-slate-700"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button 
            onClick={handleRefresh}
            className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-${stat.color}-100`}>
                <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                {stat.change ? (stat.trend === "up" ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />) : null}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-slate-500">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Revenue Overview</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              <span className="text-slate-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
              <span className="text-slate-600">Orders</span>
            </div>
          </div>
        </div>
        <div className="h-72 flex items-end gap-2">
          {revenueData.map((data) => (
            <div key={data.label} className="flex-1 flex flex-col items-center gap-2">
              <div 
                className="w-full bg-green-100 rounded-t-lg relative group"
                style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
              >
                <div className="absolute bottom-0 left-0 right-0 bg-green-500 rounded-t-lg group-hover:bg-green-600 transition-colors" style={{ height: "100%" }}></div>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatPrice(Number(data.revenue))}
                </div>
              </div>
              <span className="text-xs text-slate-500">{data.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Top Products</h2>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-400 w-6">#{index + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-900">{product.name}</span>
                    <span className={`text-sm font-medium ${(product.growth ?? 0) > 0 ? "text-green-600" : "text-red-600"}`}>
                      {(product.growth ?? 0) > 0 ? "+" : ""}{product.growth ?? 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500 mt-1">
                    <span>{product.sales} sales</span>
                    <span>{formatPrice(Number(product.revenue))}</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(product.sales / 456) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
            <button className="text-sm text-green-600 hover:text-green-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {recentTransactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    txn.status === "paid" || txn.status === "completed" ? "bg-green-100" : txn.status === "pending" ? "bg-yellow-100" : "bg-red-100"
                  }`}>
                    <DollarSign className={`h-5 w-5 ${
                      txn.status === "paid" || txn.status === "completed" ? "text-green-600" : txn.status === "pending" ? "text-yellow-600" : "text-red-600"
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{txn.customer}</p>
                    <p className="text-sm text-slate-500">{txn.id} • {txn.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{formatPrice(Number(txn.amount))}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    txn.status === "paid" || txn.status === "completed" ? "bg-green-100 text-green-700" : txn.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                  }`}>
                    {txn.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Credit Performance */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Credit System Performance</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500">Active Credit Accounts</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{credit?.activeAccounts ?? 0}</p>
            <p className="text-sm text-slate-500 mt-2">&nbsp;</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500">Total Outstanding</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatPrice(Number(credit?.totalOutstanding || 0))}</p>
            <p className="text-sm text-slate-500 mt-2">&nbsp;</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500">Repayment Rate</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{(credit?.repaymentRate ?? 0).toFixed(1)}%</p>
            <p className="text-sm text-slate-500 mt-2">&nbsp;</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500">Default Rate</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{(credit?.defaultRate ?? 0).toFixed(1)}%</p>
            <p className="text-sm text-slate-500 mt-2">&nbsp;</p>
          </div>
        </div>
      </div>

      {/* Sales by Category */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-slate-900">Sales by Category</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {(categories.length ? categories : []).map((cat, idx) => {
            const colors = ["bg-blue-500","bg-green-500","bg-purple-500","bg-orange-500","bg-pink-500","bg-teal-500","bg-indigo-500"];
            const color = colors[idx % colors.length];
            return (
            <div key={cat.name} className="text-center p-4 border border-slate-200 rounded-xl">
              <div className={`h-2 ${color} rounded-full mb-3`} style={{ width: `${cat.value}%`, margin: "0 auto" }}></div>
              <p className="font-semibold text-slate-900">{cat.name}</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{cat.value}%</p>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}
