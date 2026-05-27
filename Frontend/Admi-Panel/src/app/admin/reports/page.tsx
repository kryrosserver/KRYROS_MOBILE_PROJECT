"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Users, CreditCard, RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

const ACCENT = "#6366F1";

type Summary = {
  stats: { totalRevenue: number; totalOrders: number; activeUsers: number; creditDisbursed: number };
  revenueSeries: { label: string; revenue: number; orders: number }[];
  topProducts: { name: string; sales: number; revenue: number; growth?: number }[];
  recentTransactions: { id: string; customer: string; amount: number; status: string; date: string }[];
  credit: { activeAccounts: number; totalOutstanding: number; repaymentRate: number; defaultRate: number };
  salesByCategory: { name: string; value: number }[];
};

/* Pure SVG sparkline — no recharts, no SSR risk */
function MiniSparkline({ color = ACCENT, up = true }: { color?: string; up?: boolean }) {
  const pts = up ? "0,28 14,20 28,24 42,10 56,16 70,4 84,8" : "0,4 14,8 28,6 42,16 56,12 70,22 84,26";
  return (
    <svg width="100%" height="32" viewBox="0 0 84 32" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3}/>
          <stop offset="100%" stopColor={color} stopOpacity={0}/>
        </linearGradient>
      </defs>
      <polygon points={`${pts} 84,32 0,32`} fill={`url(#sg${color.replace("#","")})`}/>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    </svg>
  );
}

export default function ReportsPage() {
  const CARD = "#FFFFFF";
  const BORDER = "#E5E7EB";
  const TEXT = "#111827";
  const TEXT2 = "#6B7280";

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
    const fmt = (n: number) => formatPrice(Number(n || 0));
    return [
      { title: "Total Revenue",    value: s ? fmt(s.totalRevenue) : "—",                    change: "+18.6%", up: true,  color: ACCENT,     icon: DollarSign  },
      { title: "Total Orders",     value: s ? (s.totalOrders || 0).toLocaleString() : "—",  change: "+12.4%", up: true,  color: "#3B82F6",  icon: ShoppingCart },
      { title: "Active Users",     value: s ? (s.activeUsers || 0).toLocaleString() : "—",  change: "+7.8%",  up: true,  color: "#8B5CF6",  icon: Users       },
      { title: "Credit Disbursed", value: s ? fmt(s.creditDisbursed) : "—",                 change: "+5.3%",  up: true,  color: "#F59E0B",  icon: CreditCard  },
    ];
  }, [data]);

  const revenueData = data?.revenueSeries || [];
  const maxRevenue = revenueData.length ? Math.max(...revenueData.map(d => d.revenue)) : 1;
  const topProducts = data?.topProducts || [];
  const recentTransactions = data?.recentTransactions || [];
  const credit = data?.credit;
  const categories = data?.salesByCategory || [];

  const card = { background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 14 };

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Reports & Analytics</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Sales and business insights</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleRefresh} disabled={isRefreshing}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 16px", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <RefreshCw style={{ width: 14, height: 14 }} /> {isRefreshing ? "Refreshing..." : "Refresh"}
          </button>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)}
            style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", color: "#374151", fontSize: 13, outline: "none", cursor: "pointer" }}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 16 }}>{error}</div>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Total Sales", value: `$${(data?.stats?.totalRevenue || 0).toFixed(2)}`, color: "#6366F1" },
          { label: "Total Orders", value: data?.stats?.totalOrders || 0, color: "#22C55E" },
          { label: "Total Customers", value: data?.stats?.activeUsers || 0, color: "#F59E0B" },
          { label: "Avg Order Value", value: `$${((data?.stats?.totalRevenue && data?.stats?.totalOrders ? data.stats.totalRevenue / data.stats.totalOrders : 0)).toFixed(2)}`, color: "#8B5CF6" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Top Products</h3>
          {loading ? (
            <div style={{ color: "#9CA3AF", textAlign: "center", padding: 20 }}>Loading...</div>
          ) : !(data?.topProducts || []).length ? (
            <div style={{ color: "#9CA3AF", textAlign: "center", padding: 20 }}>No data yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(data?.topProducts || []).map((p: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#6366F1" }}>{i + 1}</span>
                    <span style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>{p.name || "—"}</span>
                  </div>
                  <span style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>{p.sales || 0} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Recent Orders</h3>
          {loading ? (
            <div style={{ color: "#9CA3AF", textAlign: "center", padding: 20 }}>Loading...</div>
          ) : !(data?.recentTransactions || []).length ? (
            <div style={{ color: "#9CA3AF", textAlign: "center", padding: 20 }}>No data yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(data?.recentTransactions || []).map((o: any, i: number) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>Order #{o.id}</div>
                    <div style={{ fontSize: 11, color: "#6B7280" }}>{o.customer || "—"}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>${(o.total || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
