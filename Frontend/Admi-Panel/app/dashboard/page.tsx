"use client";
import AdminShell from "@/components/admin/admin-shell";
import { useTheme } from "@/contexts/theme-context";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, ShoppingCart, DollarSign, Package,
  CreditCard, FileText, UserPlus, BarChart2, Settings, Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { getRecentOrders, getTopProducts, getRecentCustomers } from "@/lib/api";

/* ── static chart data ── */
const salesData = [
  { date: "May 20", sales: 1200 }, { date: "May 21", sales: 1800 },
  { date: "May 22", sales: 1400 }, { date: "May 23", sales: 2680 },
  { date: "May 24", sales: 2100 }, { date: "May 25", sales: 1900 },
  { date: "May 26", sales: 6162 },
];
const channelData = [
  { name: "Web Store",           value: 56.2, amount: 5462, color: "#1FA89A" },
  { name: "Mobile App",          value: 25.4, amount: 1740, color: "#6366f1" },
  { name: "Get Now (Pay Later)", value: 10.2, amount:  635, color: "#FFC107" },
  { name: "Wholesale",           value:  5.1, amount:  317, color: "#f59e0b" },
  { name: "Other",               value:  3.1, amount:  208, color: "#64748b" },
];
const quickActions = [
  { label: "New Invoice",  Icon: FileText,    color: "#6366f1" },
  { label: "New Estimate", Icon: FileText,    color: "#1FA89A" },
  { label: "New Payment",  Icon: CreditCard,  color: "#FFC107" },
  { label: "Add Product",  Icon: Package,     color: "#f59e0b" },
  { label: "New Purchase", Icon: ShoppingCart,color: "#ec4899" },
  { label: "New Customer", Icon: UserPlus,    color: "#8b5cf6" },
  { label: "View Reports", Icon: BarChart2,   color: "#1FA89A" },
  { label: "Settings",     Icon: Settings,    color: "#64748b" },
];
const activities = [
  { text: "New order received #KRY123456",                          time: "2 mins ago",  color: "#1FA89A", icon: "ShoppingBag" },
  { text: "Payment received $1,099.00 from Bwalya Chileshe",        time: "10 mins ago", color: "#6366f1", icon: "CreditCard"  },
  { text: "Order completed #KRY123454",                             time: "25 mins ago", color: "#1FA89A", icon: "CheckCircle" },
  { text: "New customer registered - Mulenga Sichone",              time: "1 hr ago",    color: "#FFC107", icon: "UserPlus"    },
  { text: "Product updated - iPhone 15 Pro Max",                    time: "2 hrs ago",   color: "#8b5cf6", icon: "Package"     },
];

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || "";
  const map: Record<string, { bg: string; color: string; label: string }> = {
    completed: { bg: "rgba(31,168,154,0.15)",   color: "#1FA89A", label: "Completed"   },
    delivered:  { bg: "rgba(31,168,154,0.15)",   color: "#1FA89A", label: "Delivered"   },
    processing: { bg: "rgba(59,130,246,0.15)",   color: "#3b82f6", label: "Processing"  },
    pending:    { bg: "rgba(255,193,7,0.15)",     color: "#FFC107", label: "Pending"     },
    cancelled:  { bg: "rgba(185,28,28,0.15)",     color: "#B91C1C", label: "Cancelled"   },
    paid:       { bg: "rgba(31,168,154,0.15)",    color: "#1FA89A", label: "Paid"        },
  };
  const style = map[s] || { bg: "rgba(100,116,139,0.15)", color: "#64748b", label: status };
  return (
    <span style={{ background: style.bg, color: style.color, fontSize: "10.5px", fontWeight: 600, padding: "3px 8px", borderRadius: "20px", whiteSpace: "nowrap" }}>
      {style.label}
    </span>
  );
}

function ActivityIcon({ color }: { color: string }) {
  return (
    <div style={{ width: 32, height: 32, borderRadius: "50%", flexShrink: 0, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <ShoppingCart size={14} color={color} />
    </div>
  );
}

interface Order {
  id: string; orderNumber?: string; status: string; paymentStatus?: string;
  total: string; createdAt: string;
  user?: { firstName?: string; lastName?: string; email?: string } | null;
}
interface Product {
  id: string; name: string; price: number; salePrice?: number;
  _count?: { orderItems?: number };
}
interface Customer {
  id: string; firstName?: string; lastName?: string; email: string; createdAt: string;
}

function DashboardContent() {
  const { theme } = useTheme();
  const D = theme === "dark";
  const card     = D ? "#0D1523" : "#FFFFFF";
  const border   = D ? "#1E293B" : "#E2E8F0";
  const textMain = D ? "#FFFFFF" : "#0F172A";
  const textMuted = D ? "#8E9AAF" : "#64748B";
  const textSec  = D ? "#94A3B8" : "#475569";
  const surface  = D ? "#101826" : "#F1F5F9";
  const gridLine = D ? "#1E293B" : "#E2E8F0";

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalOrders, setTotalOrders] = useState(102);

  useEffect(() => {
    getRecentOrders(5).then(r => {
      const data = r.data?.data || r.data || [];
      const meta = r.data?.meta || {};
      setOrders(data.slice(0, 5));
      if (meta.total) setTotalOrders(meta.total);
    }).catch(() => {});
    getTopProducts(5).then(r => {
      const data = r.data?.data || r.data || [];
      setProducts(data.slice(0, 5));
    }).catch(() => {});
    getRecentCustomers(5).then(r => {
      const data = r.data?.data || r.data || [];
      setCustomers(data.slice(0, 5));
    }).catch(() => {});
  }, []);

  const cardStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: card, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', minWidth: 0, ...extra,
  });

  const kpiCards = [
    { label: "Total Sales",      value: "$6,162.00", change: "+18.6%", up: true,  Icon: DollarSign,   color: "#1FA89A", spark: [30,55,40,70,50,80,100] },
    { label: "Total Orders",     value: String(totalOrders), change: "+12.4%", up: true, Icon: ShoppingCart, color: "#f59e0b", spark: [20,45,35,60,45,70,85] },
    { label: "Total Purchases",  value: "$0.00",      change: "0.0%",   up: false, Icon: Package,      color: "#ec4899", spark: [5,5,5,5,5,5,5] },
    { label: "Payment Received", value: "$6,162.00",  change: "+18.6%", up: true,  Icon: CreditCard,   color: "#6366f1", spark: [30,55,40,70,50,80,100] },
    { label: "Payment Paid",     value: "$0.00",      change: "0.0%",   up: false, Icon: Wallet,       color: "#ef4444", spark: [5,5,5,5,5,5,5] },
  ];

  const getInitials = (order: Order) => {
    const u = order.user;
    if (u?.firstName && u?.lastName) return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
    if (u?.firstName) return u.firstName.slice(0, 2).toUpperCase();
    if (u?.email) return u.email.slice(0, 2).toUpperCase();
    return "KR";
  };
  const getName = (order: Order) => {
    const u = order.user;
    if (!u) return "Guest";
    return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "Unknown";
  };
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  const COLORS = ["#1FA89A","#6366f1","#FFC107","#ec4899","#8b5cf6"];

  return (
    <div style={{ fontFamily: "var(--font-inter), sans-serif", padding: 0 }}>
      <div className="dash-outer">

        {/* ── TOP: welcome + KPI cards ── */}
        <div className="dash-top">
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: textMain, marginBottom: 4 }}>Welcome back, Admin! 👋</h1>
            <p style={{ fontSize: 13, color: textMuted }}>Here&apos;s what&apos;s happening with your business today.</p>
          </div>

          {/* KPI cards row */}
          <div className="kpi-grid" style={{ marginBottom: 20 }}>
            {kpiCards.map(({ label, value, change, up, Icon, color, spark }) => {
              const sparkData = spark.map(v => ({ v }));
              return (
                <div key={label} className="kpi-card" style={cardStyle({ padding: "12px 14px", cursor: "default" })}>
                  {/* Row 1: icon + label + trend */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={14} color={color} />
                      </div>
                      <span style={{ fontSize: 11, color: textMuted, fontWeight: 500 }}>{label}</span>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: up ? "#1FA89A" : "#ef4444", display: "flex", alignItems: "center", gap: 2 }}>
                      {up ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{change}
                    </span>
                  </div>
                  {/* Row 2: value + sparkline side by side */}
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: textMain, lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: 10, color: textMuted, marginTop: 3 }}>vs May 13&ndash;19</div>
                    </div>
                    <div className="kpi-spark" style={{ width: 80, height: 32, flexShrink: 0, overflow: "hidden", position: "relative" }}>
                      <ResponsiveContainer width="100%" height={32}>
                        <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                              <stop offset="100%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sg-${label})`} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ── */}
        <div className="dash-sidebar">

          {/* Quick Actions */}
          <div style={cardStyle({ padding: 16, marginBottom: 16 })}>
            <div style={{ fontSize: 13, fontWeight: 700, color: textMain, marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {quickActions.map(({ label, Icon, color }) => (
                <button key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, background: surface, border: `1px solid ${border}`, borderRadius: 9, padding: "10px 4px", cursor: "pointer" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1FA89A"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(31,168,154,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = border; (e.currentTarget as HTMLButtonElement).style.background = surface; }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={13} color={color} />
                  </div>
                  <span style={{ fontSize: 9.5, fontWeight: 500, color: textMuted, textAlign: "center", lineHeight: 1.2 }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Order Progress */}
          <div style={cardStyle({ padding: 16, marginBottom: 16 })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: textMain }}>Order Progress</div>
              <span style={{ fontSize: 11.5, color: "#1FA89A", fontWeight: 600, cursor: "pointer" }}>View All</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ position: "relative", width: 90, height: 90, flexShrink: 0 }}>
                <svg viewBox="0 0 90 90" width="90" height="90">
                  <circle cx="45" cy="45" r="36" fill="none" stroke={D ? "#1E293B" : "#E2E8F0"} strokeWidth="8" />
                  <circle cx="45" cy="45" r="36" fill="none" stroke="#1FA89A" strokeWidth="8"
                    strokeDasharray="226.19" strokeDashoffset="74.6" strokeLinecap="round" transform="rotate(-90 45 45)" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: textMain }}>67%</span>
                  <span style={{ fontSize: 8.5, color: textMuted }}>Completion</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {[
                  { label: "Total Orders", val: totalOrders, color: "#1FA89A" },
                  { label: "Completed",    val: 68,          color: "#1FA89A" },
                  { label: "Processing",   val: 20,          color: "#6366f1" },
                  { label: "Pending",      val: 10,          color: "#FFC107" },
                  { label: "Cancelled",    val: 4,            color: "#ef4444" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.color }} />
                      <span style={{ fontSize: 11.5, color: textMuted }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: textMain }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div style={cardStyle({ padding: 16 })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: textMain }}>Recent Activities</div>
              <span style={{ fontSize: 11.5, color: "#1FA89A", fontWeight: 600, cursor: "pointer" }}>View All</span>
            </div>
            {activities.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <ActivityIcon color={a.color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: textSec, lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 10.5, color: textMuted, marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN BOTTOM CONTENT ── */}
        <div className="dash-bottom">

          {/* Charts Row */}
          <div className="charts-row" style={{ marginBottom: 20 }}>
            {/* Sales Analytics */}
            <div style={cardStyle({ padding: 18 })}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: textMain }}>Sales Analytics</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 22, fontWeight: 800, color: textMain }}>$6,162.00</span>
                    <span style={{ fontSize: 11.5, fontWeight: 600, color: "#1FA89A", display: "flex", alignItems: "center", gap: 2 }}>
                      <TrendingUp size={11} /> +18.6% vs last week
                    </span>
                  </div>
                </div>
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 7, padding: "4px 10px", fontSize: 11.5, fontWeight: 500, color: textMuted }}>This Week</div>
              </div>
              <div style={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1FA89A" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#1FA89A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridLine} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: textMuted }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(1)}k`} />
                    <Tooltip contentStyle={{ background: card, border: `1px solid ${border}`, borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`$${v.toLocaleString()}`, "Sales"]} />
                    <Area type="monotone" dataKey="sales" stroke="#1FA89A" strokeWidth={2.5} fill="url(#salesGrad)" dot={{ fill: "#1FA89A", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sales by Channel */}
            <div style={cardStyle({ padding: 18 })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: textMain }}>Sales by Channel</div>
                <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: 7, padding: "4px 10px", fontSize: 11.5, fontWeight: 500, color: textMuted }}>This Week</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 140, height: 140, flexShrink: 0, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={channelData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} dataKey="value" stroke="none" paddingAngle={2}>
                        {channelData.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: textMain }}>$6,162</span>
                    <span style={{ fontSize: 9, color: textMuted }}>Total Sales</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {channelData.map(ch => (
                    <div key={ch.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: ch.color, flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11.5, fontWeight: 500, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ch.name}</div>
                          <div style={{ fontSize: 10, color: textMuted }}>{ch.value}%</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: textSec, whiteSpace: "nowrap", paddingLeft: 4 }}>${ch.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="tables-row" style={{ marginBottom: 20 }}>
            {/* Recent Orders */}
            <div style={cardStyle({ padding: 16 })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: textMain }}>Recent Orders</div>
                <span style={{ fontSize: 11.5, color: "#1FA89A", fontWeight: 600, cursor: "pointer" }}>View All</span>
              </div>
              {(orders.length > 0 ? orders : [
                { id: "1", orderNumber: "#KRY123456", status: "Completed",  total: "1099.00", createdAt: new Date().toISOString(), user: { firstName: "Bwalya", lastName: "Chileshe" } },
                { id: "2", orderNumber: "#KRY123455", status: "Processing", total: "349.00",  createdAt: new Date().toISOString(), user: { firstName: "Mulenga", lastName: "Sichone" } },
                { id: "3", orderNumber: "#KRY123454", status: "Completed",  total: "2499.00", createdAt: new Date().toISOString(), user: { firstName: "Chanda", lastName: "Kapwepwe" } },
                { id: "4", orderNumber: "#KRY123453", status: "Pending",    total: "129.00",  createdAt: new Date().toISOString(), user: { firstName: "Chanda", lastName: "Kapwepwe" } },
                { id: "5", orderNumber: "#KRY123452", status: "Completed",  total: "899.00",  createdAt: new Date().toISOString(), user: { firstName: "Chansa", lastName: "Mumba" } },
              ] as Order[]).map((o, idx) => {
                const initials = getInitials(o);
                const name = getName(o);
                const color = COLORS[idx % COLORS.length];
                return (
                  <div key={o.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${border}` }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color, flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: textMain }}>{o.orderNumber || `#${o.id.slice(0,8).toUpperCase()}`}</div>
                      <div style={{ fontSize: 10.5, color: textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                    </div>
                    <div style={{ fontSize: 10.5, color: textMuted, whiteSpace: "nowrap" }}>{formatTime(o.createdAt)}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: textMain, whiteSpace: "nowrap" }}>${parseFloat(o.total).toLocaleString("en-US", { minimumFractionDigits: 2 })}</div>
                    <StatusBadge status={o.status} />
                  </div>
                );
              })}
            </div>

            {/* Top Products */}
            <div style={cardStyle({ padding: 16 })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: textMain }}>Top Selling Products</div>
                <span style={{ fontSize: 11.5, color: "#1FA89A", fontWeight: 600, cursor: "pointer" }}>View All</span>
              </div>
              {(products.length > 0 ? products : [
                { id: "1", name: "iPhone 15 Pro Max",        price: 1099, _count: { orderItems: 245 } },
                { id: "2", name: "MacBook Air M2",           price: 1249, _count: { orderItems: 186 } },
                { id: "3", name: "Sony WH-1000XM5",          price:  348, _count: { orderItems: 163 } },
                { id: "4", name: "Apple Watch Series 9",     price:  399, _count: { orderItems: 151 } },
                { id: "5", name: "Samsung Galaxy S24 Ultra", price: 1124, _count: { orderItems: 128 } },
              ] as Product[]).map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: surface, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Package size={14} color="#1FA89A" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 10.5, color: textMuted }}>
                      <b style={{ color: textSec }}>{p._count?.orderItems || 0} Sold</b>
                    </div>
                  </div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: textMain, whiteSpace: "nowrap" }}>
                    ${((p._count?.orderItems || 0) * p.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>

            {/* New Customers */}
            <div style={cardStyle({ padding: 16 })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: textMain }}>New Customers</div>
                <span style={{ fontSize: 11.5, color: "#1FA89A", fontWeight: 600, cursor: "pointer" }}>View All</span>
              </div>
              {(customers.length > 0 ? customers : [
                { id: "1", firstName: "Bwalya",  lastName: "Chileshe",  email: "bc@kry.com",  createdAt: "2025-05-26" },
                { id: "2", firstName: "Mulenga", lastName: "Sichone",   email: "ms@kry.com",  createdAt: "2025-05-26" },
                { id: "3", firstName: "Chansa",  lastName: "Mumba",     email: "cm@kry.com",  createdAt: "2025-05-25" },
                { id: "4", firstName: "Chanda",  lastName: "Kapwepwe",  email: "ck@kry.com",  createdAt: "2025-05-25" },
                { id: "5", firstName: "Mwila",   lastName: "Tembo",     email: "mt@kry.com",  createdAt: "2025-05-25" },
              ] as Customer[]).map((c, idx) => {
                const initials = c.firstName && c.lastName ? `${c.firstName[0]}${c.lastName[0]}`.toUpperCase() : c.email.slice(0,2).toUpperCase();
                const name = [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email;
                const color = COLORS[idx % COLORS.length];
                return (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%", background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>{initials}</div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: textMain }}>{name}</div>
                      <div style={{ fontSize: 11, color: textMuted }}>{formatDate(c.createdAt)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="financial-grid">
            {[
              { label: "Outstanding Balance",  val: "$0.00",     sub: "No outstanding amounts", color: "#6366f1", hl: false },
              { label: "Outstanding Payment",  val: "$0.00",     sub: "No pending payments",    color: "#FFC107", hl: false },
              { label: "Total Expenses",        val: "$0.00",     sub: "This month",             color: "#ef4444", hl: false },
              { label: "Profit / Loss",         val: "$6,162.00", sub: "This month",             color: "#1FA89A", hl: true  },
            ].map(item => (
              <div key={item.label} style={{
                background: item.hl ? "linear-gradient(135deg, #1FA89A, #27B9AF)" : surface,
                border: `1px solid ${item.hl ? "transparent" : border}`,
                borderRadius: 12, padding: "16px 14px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: item.hl ? "rgba(255,255,255,0.2)" : `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Wallet size={16} color={item.hl ? "#fff" : item.color} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 500, color: item.hl ? "rgba(255,255,255,0.85)" : textMuted }}>{item.label}</div>
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: item.hl ? "#FFFFFF" : textMain, marginBottom: 4 }}>{item.val}</div>
                <div style={{ fontSize: 11, color: item.hl ? "rgba(255,255,255,0.7)" : textMuted }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .dash-outer {
          display: grid;
          grid-template-columns: 1fr 290px;
          grid-template-areas: "top sidebar" "bottom sidebar";
          gap: 18px;
          align-items: start;
          width: 100%;
          min-width: 0;
        }
        .dash-top    { grid-area: top;     min-width: 0; }
        .dash-bottom { grid-area: bottom;  min-width: 0; }
        .dash-sidebar { grid-area: sidebar; position: sticky; top: 80px; min-width: 0; }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          width: 100%;
        }
        .kpi-card {
          min-width: 0;
          overflow: hidden;
          min-height: 96px;
        }
        .qa-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border-radius: 9px;
          padding: 12px 6px 10px;
          cursor: pointer;
          width: 100%;
          min-height: 72px;
        }

        .charts-row     { display: grid; grid-template-columns: 1.5fr 1fr; gap: 14px; width: 100%; overflow: hidden; }
        .tables-row     { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 14px; width: 100%; overflow: hidden; }
        .financial-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; width: 100%; }

        @media (max-width: 1100px) {
          .dash-outer { grid-template-columns: 1fr 260px; gap: 14px; }
          .kpi-grid   { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 840px) {
          .dash-outer   { grid-template-columns: 1fr; grid-template-areas: "top" "sidebar" "bottom"; }
          .dash-sidebar { position: static; }
          .kpi-grid     { grid-template-columns: repeat(2, 1fr); }
          .charts-row   { grid-template-columns: 1fr; }
          .tables-row   { grid-template-columns: 1fr; }
          .financial-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .kpi-grid       { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .financial-grid { grid-template-columns: repeat(2, 1fr); }
          .kpi-spark      { display: none !important; }
          .kpi-card       { min-height: 80px; }
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}


