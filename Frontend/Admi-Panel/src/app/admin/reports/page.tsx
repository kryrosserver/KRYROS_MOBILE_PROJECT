"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(nextScale: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const naturalH = innerRef.current.scrollHeight; const visualH = naturalH * nextScale; const isMobile = window.innerWidth < 1024; const screenAvail = isMobile ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(visualH, screenAvail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? 750 : 1380; const nextScale = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${nextScale})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(nextScale))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);
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
      { title: "Total Revenue",   value: fmt(s.totalRevenue),                 icon: DollarSign,  iconBg: "rgba(18,214,197,0.12)",  iconColor: ACCENT },
      { title: "Total Orders",    value: (s.totalOrders || 0).toLocaleString(), icon: ShoppingCart, iconBg: "rgba(59,130,246,0.12)",  iconColor: "#3B82F6" },
      { title: "Active Users",    value: (s.activeUsers || 0).toLocaleString(), icon: Users,       iconBg: "rgba(139,92,246,0.12)", iconColor: "#8B5CF6" },
      { title: "Credit Disbursed",value: fmt(s.creditDisbursed),               icon: CreditCard,  iconBg: "rgba(245,158,11,0.12)", iconColor: "#F59E0B" },
    ];
  }, [data]);

  const revenueData = data?.revenueSeries || [];
  const maxRevenue = revenueData.length ? Math.max(...revenueData.map(d => d.revenue)) : 1;
  const topProducts = data?.topProducts || [];
  const recentTransactions = data?.recentTransactions || [];
  const credit = data?.credit;
  const categories = data?.salesByCategory || [];

  return (
    <div ref={outerRef} style={{ overflow: "auto", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
            Reports & Analytics
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Track performance and business insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="admin-input !w-auto px-4"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={handleRefresh}
            className="btn-secondary !h-[44px] !w-[44px] !px-0 flex items-center justify-center"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button className="btn-primary flex items-center gap-2 px-4">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="admin-card animate-pulse">
              <div className="h-10 w-10 rounded-xl mb-4" style={{ background: "var(--icon-bg)" }} />
              <div className="h-4 rounded w-1/2 mb-2" style={{ background: "var(--icon-bg)" }} />
              <div className="h-7 rounded w-3/4" style={{ background: "var(--icon-bg)" }} />
            </div>
          ))
        ) : statCards.map((stat) => (
          <div key={stat.title} className="admin-card !p-5">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: stat.iconBg }}
            >
              <stat.icon className="h-5 w-5" style={{ color: stat.iconColor }} />
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.title}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Revenue Overview</h2>
          <div className="flex items-center gap-2 text-sm">
            <div className="h-3 w-3 rounded-full" style={{ background: ACCENT }} />
            <span style={{ color: "var(--text-secondary)" }}>Revenue</span>
          </div>
        </div>
        {loading ? (
          <div className="h-64 rounded-xl animate-pulse" style={{ background: "var(--hover-bg)" }} />
        ) : revenueData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
            No data available for this period
          </div>
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
                  <div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                    style={{ background: "var(--sidebar-bg)", color: "#fff" }}
                  >
                    {formatPrice(Number(d.revenue))}
                  </div>
                </div>
                <span className="text-xs" style={{ color: "var(--text-secondary)" }}>{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="admin-card">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Top Products</h2>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse" style={{ background: "var(--hover-bg)" }} />
              ))}
            </div>
          ) : topProducts.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No data available</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center gap-4">
                  <span className="text-sm font-medium w-6" style={{ color: "var(--text-muted)" }}>
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                        {product.name}
                      </span>
                      <span
                        className="text-xs font-semibold"
                        style={{ color: (product.growth ?? 0) >= 0 ? "#16C784" : "#EF4444" }}
                      >
                        {(product.growth ?? 0) >= 0 ? "+" : ""}{product.growth ?? 0}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      <span>{product.sales} sales</span>
                      <span className="font-semibold">{formatPrice(Number(product.revenue))}</span>
                    </div>
                    <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--icon-bg)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(5, (product.sales / (topProducts[0]?.sales || 1)) * 100)}%`,
                          background: ACCENT
                        }}
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
            <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Recent Transactions</h2>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "var(--hover-bg)" }} />
              ))}
            </div>
          ) : recentTransactions.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No transactions found</p>
          ) : (
            <div className="space-y-2">
              {recentTransactions.map((txn) => {
                const isPaid = txn.status === "paid" || txn.status === "completed";
                const isPending = txn.status === "pending";
                return (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 rounded-xl transition-colors"
                    style={{ cursor: "default" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center"
                        style={{
                          background: isPaid ? "rgba(18,214,197,0.12)" : isPending ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)"
                        }}
                      >
                        <DollarSign
                          className="h-4 w-4"
                          style={{ color: isPaid ? ACCENT : isPending ? "#F59E0B" : "#EF4444" }}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{txn.customer}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>{txn.id} · {txn.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {formatPrice(Number(txn.amount))}
                      </p>
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
        <h2 className="text-base font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
          Credit System Performance
        </h2>
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Active Credit Accounts", value: (credit?.activeAccounts ?? 0).toLocaleString() },
            { label: "Total Outstanding",      value: formatPrice(Number(credit?.totalOutstanding || 0)) },
            { label: "Repayment Rate",         value: `${(credit?.repaymentRate ?? 0).toFixed(1)}%` },
            { label: "Default Rate",           value: `${(credit?.defaultRate ?? 0).toFixed(1)}%` },
          ].map((m, i) => (
            <div key={i} className="rounded-xl p-4" style={{ background: "var(--hover-bg)" }}>
              <p className="text-xs mb-1" style={{ color: "var(--text-secondary)" }}>{m.label}</p>
              <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                {loading ? "—" : m.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Sales by Category */}
      {(categories.length > 0 || loading) && (
        <div className="admin-card">
          <h2 className="text-base font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
            Sales by Category
          </h2>
          {loading ? (
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: "var(--hover-bg)" }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {categories.map((cat, idx) => {
                const colors = [ACCENT, "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#6366F1"];
                const color = colors[idx % colors.length];
                return (
                  <div
                    key={cat.name}
                    className="text-center p-4 rounded-xl"
                    style={{ background: "var(--hover-bg)" }}
                  >
                    <div
                      className="h-2 rounded-full mb-3 mx-auto"
                      style={{ width: `${cat.value}%`, background: color, maxWidth: "100%" }}
                    />
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{cat.name}</p>
                    <p className="text-2xl font-bold mt-1" style={{ color }}>{cat.value}%</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
      </div>
    </div>
  );
}
