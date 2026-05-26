"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  Users, CreditCard, Download, Calendar, ArrowUpRight, Package,
  RefreshCw, Bell, Search, Sun, Moon, Menu, ChevronDown, ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const ACCENT = "#12D6C5";

type Summary = {
  stats: { totalRevenue: number; totalOrders: number; activeUsers: number; creditDisbursed: number };
  revenueSeries: { label: string; revenue: number; orders: number }[];
  topProducts: { name: string; sales: number; revenue: number; growth?: number }[];
  recentTransactions: { id: string; customer: string; amount: number; status: string; date: string }[];
  credit: { activeAccounts: number; totalOutstanding: number; repaymentRate: number; defaultRate: number };
  salesByCategory: { name: string; value: number }[];
};

function MiniSparkline({ color = ACCENT, up = true }: { color?: string; up?: boolean }) {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sgrp${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sgrp${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function ReportsPage() {

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";

  useEffect(() => {}, []);

  const [dateRange, setDateRange] = useState("year");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isDark, toggleTheme } = useTheme();

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

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  return (
    <div style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── HEADER ── */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Reports & Analytics</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search reports..." style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: ICON_BG, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>{isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}</button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 14px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} /> May 20 – May 26, 2025 <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320" }}>K</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1 }}>Admin</div><div style={{ fontSize: 10, color: TEXT2, marginTop: 1 }}>Super Admin</div></div>
              <ChevronDown style={{ width: 14, height: 14, color: TEXT2 }} />
            </div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title + actions */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Reports & Analytics</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <span>Home</span><ChevronRight style={{ width: 13, height: 13 }} /><span style={{ color: ACCENT }}>Reports</span>
              </div>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Track performance and business insights</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ position: "relative" }}>
                <select value={dateRange} onChange={e => setDateRange(e.target.value)}
                  style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 36px 9px 14px", color: TEXT2, fontSize: 13, outline: "none", appearance: "none", cursor: "pointer" }}>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2, pointerEvents: "none" }} />
              </div>
              <button onClick={handleRefresh}
                style={{ width: 40, height: 40, borderRadius: 10, background: CARD, border: `1px solid ${BORDER}`, color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RefreshCw style={{ width: 16, height: 16 }} />
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", borderRadius: 10, padding: "9px 18px", color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Download style={{ width: 15, height: 15 }} /> Export
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT2, cursor: "pointer" }}>
                <MoreHorizontal style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444" }}>
              {error}
            </div>
          )}

          {/* Stat Cards — 4 columns */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">>
            {statCards.map((s, i) => (
              <div key={i} style={{ ...card, padding: "16px 18px" }}>
                {loading ? (
                  <div style={{ height: 90, background: HOVER, borderRadius: 10 }} />
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <s.icon style={{ width: 20, height: 20, color: s.color }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.up ? "#22C55E" : "#EF4444" }}>
                        {s.up ? "▲" : "▼"} {s.change}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>{s.title}</div>
                    <div style={{ fontSize: s.value.length > 8 ? 17 : 22, fontWeight: 800, color: TEXT, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                    <div style={{ marginTop: 8 }}><MiniSparkline color={s.color} up={s.up} /></div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div style={{ ...card, padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>Revenue Overview</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: ACCENT }} />
                <span style={{ color: TEXT2 }}>Revenue</span>
              </div>
            </div>
            {loading ? (
              <div style={{ height: 200, borderRadius: 10, background: HOVER }} />
            ) : revenueData.length === 0 ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: TEXT2 }}>
                No data available for this period
              </div>
            ) : (
              <div style={{ height: 200, display: "flex", alignItems: "flex-end", gap: 6 }}>
                {revenueData.map((d) => (
                  <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                    <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                      <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: `${ACCENT}30`, position: "relative", height: `${Math.max(4, (d.revenue / maxRevenue) * 100)}%`, cursor: "pointer" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = ACCENT; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${ACCENT}30`; }}>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, borderRadius: "4px 4px 0 0", height: "100%", background: ACCENT, opacity: 0.8 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 10, color: TEXT2 }}>{d.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3-column charts row: Top Products + Recent Transactions + Credit Performance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Top Products */}
            <div style={{ ...card, padding: "20px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 16px" }}>Top Products</h2>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[...Array(4)].map((_, i) => <div key={i} style={{ height: 40, borderRadius: 9, background: HOVER }} />)}
                </div>
              ) : topProducts.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center", fontSize: 12, color: TEXT2 }}>No data available</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {topProducts.map((product, index) => (
                    <div key={product.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: TEXT2, width: 20, flexShrink: 0 }}>#{index + 1}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{product.name}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: (product.growth ?? 0) >= 0 ? "#16C784" : "#EF4444", flexShrink: 0, marginLeft: 6 }}>
                            {(product.growth ?? 0) >= 0 ? "+" : ""}{product.growth ?? 0}%
                          </span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2, fontSize: 11, color: TEXT2 }}>
                          <span>{product.sales} sales</span>
                          <span style={{ fontWeight: 700 }}>{formatPrice(Number(product.revenue))}</span>
                        </div>
                        <div style={{ marginTop: 4, height: 4, borderRadius: 4, background: HOVER, overflow: "hidden" }}>
                          <div style={{ height: "100%", borderRadius: 4, background: ACCENT, width: `${Math.max(5, (product.sales / (topProducts[0]?.sales || 1)) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Transactions */}
            <div style={{ ...card, padding: "20px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 16px" }}>Recent Transactions</h2>
              {loading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[...Array(4)].map((_, i) => <div key={i} style={{ height: 48, borderRadius: 9, background: HOVER }} />)}
                </div>
              ) : recentTransactions.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center", fontSize: 12, color: TEXT2 }}>No transactions found</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {recentTransactions.map((txn) => {
                    const isPaid = txn.status === "paid" || txn.status === "completed";
                    const isPending = txn.status === "pending";
                    const statusColor = isPaid ? ACCENT : isPending ? "#F59E0B" : "#EF4444";
                    const statusBg = isPaid ? "rgba(18,214,197,0.12)" : isPending ? "rgba(245,158,11,0.12)" : "rgba(239,68,68,0.12)";
                    return (
                      <div key={txn.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: 10, cursor: "default" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = HOVER; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: statusBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <DollarSign style={{ width: 15, height: 15, color: statusColor }} />
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{txn.customer}</div>
                            <div style={{ fontSize: 10, color: TEXT2 }}>{txn.id} · {txn.date}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{formatPrice(Number(txn.amount))}</div>
                          <span style={{ fontSize: 9, fontWeight: 700, color: statusColor, background: statusBg, padding: "2px 7px", borderRadius: 20 }}>{txn.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Credit Performance */}
            <div style={{ ...card, padding: "20px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 16px" }}>Credit Performance</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Active Credit Accounts", value: loading ? "—" : (credit?.activeAccounts ?? 0).toLocaleString(), color: ACCENT },
                  { label: "Total Outstanding",      value: loading ? "—" : formatPrice(Number(credit?.totalOutstanding || 0)), color: "#F59E0B" },
                  { label: "Repayment Rate",         value: loading ? "—" : `${(credit?.repaymentRate ?? 0).toFixed(1)}%`, color: "#22C55E" },
                  { label: "Default Rate",           value: loading ? "—" : `${(credit?.defaultRate ?? 0).toFixed(1)}%`, color: "#EF4444" },
                ].map((m, i) => (
                  <div key={i} style={{ borderRadius: 10, padding: "12px 14px", background: HOVER }}>
                    <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: m.color }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sales by Category */}
          {(categories.length > 0 || loading) && (
            <div style={{ ...card, padding: "20px" }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 16px" }}>Sales by Category</h2>
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">>
                  {[...Array(5)].map((_, i) => <div key={i} style={{ height: 80, borderRadius: 9, background: HOVER }} />)}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">>
                  {categories.map((cat, idx) => {
                    const colors = [ACCENT, "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#10B981", "#6366F1"];
                    const color = colors[idx % colors.length];
                    return (
                      <div key={cat.name} style={{ textAlign: "center", padding: "14px 10px", borderRadius: 10, background: HOVER }}>
                        <div style={{ height: 4, borderRadius: 4, background: color, width: `${cat.value}%`, maxWidth: "100%", margin: "0 auto 10px" }} />
                        <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{cat.name}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color, marginTop: 2 }}>{cat.value}%</div>
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