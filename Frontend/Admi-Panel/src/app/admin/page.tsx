"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell, Settings, Search, Calendar, ChevronDown,
  TrendingUp, TrendingDown, Minus, FileText, FileEdit,
  CreditCard, ShoppingBag, Users, Package, BarChart3,
  ShoppingCart, Activity, DollarSign, AlertCircle,
  CheckCircle, Clock, Menu,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { useTheme } from "@/providers/ThemeProvider";

const DARK_BG = "var(--bg-primary)";
const CARD_BG = "var(--card-bg)";
const BORDER = "var(--card-border)";
const TEXT_PRIMARY = "var(--text-primary)";
const TEXT_SECONDARY = "var(--text-secondary)";
const ACCENT = "#12D6C5";
const HEADER_BG = "var(--bg-secondary)";
const ICON_BG = "var(--icon-bg)";
const TOOLTIP_BG = "var(--tooltip-bg)";

const salesData = [
  { day: "May 20", value: 800 },
  { day: "May 21", value: 1200 },
  { day: "May 22", value: 900 },
  { day: "May 23", value: 2680 },
  { day: "May 24", value: 1500 },
  { day: "May 25", value: 1100 },
  { day: "May 26", value: 2100 },
];

const salesByChannel = [
  { name: "Web Store", value: 56.2, amount: 3467, color: ACCENT },
  { name: "Mobile App", value: 28.4, amount: 1748, color: "#3B82F6" },
  { name: "Get Now (Pay Later)", value: 10.3, amount: 655, color: "#F59E0B" },
  { name: "Wholesale", value: 5.1, amount: 317, color: "#8B5CF6" },
];

const recentOrders = [
  { id: "#KRY123456", customer: "Bwalya Chileshe", time: "10:34 AM", amount: 1099, status: "Completed" },
  { id: "#KRY123455", customer: "Mulenga Sichone", time: "09:15 AM", amount: 349, status: "Processing" },
  { id: "#KRY123454", customer: "Chansa Mumba", time: "08:45 AM", amount: 2499, status: "Completed" },
  { id: "#KRY123453", customer: "Chanda Kapwepwe", time: "07:30 AM", amount: 129, status: "Pending" },
  { id: "#KRY123452", customer: "Chansa Mumba", time: "06:10 AM", amount: 899, status: "Completed" },
];

const topProducts = [
  { name: "iPhone 15 Pro Max", sub: "256GB", sold: 248, amount: 268756 },
  { name: "MacBook Air M2", sub: "13-inch", sold: 186, amount: 232014 },
  { name: "Sony WH-1000XM5", sub: "Headphones", sold: 163, amount: 56687 },
  { name: "Apple Watch Series 9", sub: "45mm", sold: 131, amount: 60349 },
  { name: "Samsung Galaxy S24 Ultra", sub: "256GB", sold: 128, amount: 143872 },
];

const newCustomers = [
  { name: "Bwalya Chileshe", date: "May 26, 2025", initials: "B", color: "#3B82F6" },
  { name: "Mulenga Sichone", date: "May 26, 2025", initials: "M", color: "#8B5CF6" },
  { name: "Chansa Mumba", date: "May 25, 2025", initials: "C", color: "#F59E0B" },
  { name: "Chanda Kapwepwe", date: "May 25, 2025", initials: "C", color: "#EF4444" },
  { name: "Mwila Tembo", date: "May 25, 2025", initials: "M", color: "#10B981" },
];

const recentActivities = [
  { icon: ShoppingCart, color: ACCENT, title: "New order received", sub: "#KRY123456", time: "2 mins ago" },
  { icon: CreditCard, color: "#3B82F6", title: "Payment received", sub: "$1,099.00 from Bwalya Chil...", time: "10 mins ago" },
  { icon: CheckCircle, color: "#22C55E", title: "Order completed", sub: "#KRY123454", time: "25 mins ago" },
  { icon: Users, color: "#F59E0B", title: "New customer registered", sub: "Mulenga Sichone", time: "1 hr ago" },
  { icon: Package, color: "#8B5CF6", title: "Product updated", sub: "iPhone 15 Pro Max", time: "2 hrs ago" },
];

const statusColors: Record<string, string> = {
  Completed: "#22C55E", Processing: "#3B82F6", Pending: "#F59E0B", Cancelled: "#EF4444",
};
const statusBg: Record<string, string> = {
  Completed: "rgba(34,197,94,0.12)", Processing: "rgba(59,130,246,0.12)",
  Pending: "rgba(245,158,11,0.12)", Cancelled: "rgba(239,68,68,0.12)",
};

function MiniSparkline({ color = ACCENT, up = true }: { color?: string; up?: boolean }) {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5}
          fill={`url(#sg${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: TOOLTIP_BG, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px" }}>
      <p style={{ color: TEXT_SECONDARY, fontSize: 11, marginBottom: 2 }}>{label}</p>
      <p style={{ color: TEXT_PRIMARY, fontSize: 13, fontWeight: 700 }}>{formatPrice(payload[0].value)}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const { isDark } = useTheme();

  const [summary, setSummary] = useState({
    sales: 3682, orders: 102, purchases: 0,
    paymentReceived: 3682, paymentPaid: 0,
    outstandingBalance: 0, outstandingPayment: 0,
    expense: 0, profit: 3682,
  });

  useEffect(() => {
    fetch("/internal/admin/reports/summary?range=month", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data?.stats) setSummary(s => ({
          ...s,
          sales: data.stats.totalRevenue || s.sales,
          paymentReceived: data.stats.totalRevenue || s.paymentReceived,
          profit: data.stats.totalRevenue || s.profit,
        }));
      })
      .catch(() => {});
  }, []);

  const statCards = [
    { title: "Total Sales", value: formatPrice(summary.sales), change: "+18.6%", up: true, color: "#F59E0B" },
    { title: "Total Orders", value: String(summary.orders), change: "+12.4%", up: true, color: ACCENT },
    { title: "Total\nPurchases", value: formatPrice(summary.purchases), change: "—0.0%", up: null, color: "#8B5CF6" },
    { title: "Payment\nReceived", value: formatPrice(summary.paymentReceived), change: "+18.6%", up: true, color: "#22C55E" },
    { title: "Payment\nPaid", value: formatPrice(summary.paymentPaid), change: "—0.0%", up: null, color: "#EF4444" },
  ];

  const quickActions = [
    { label: "New Invoice", icon: FileText, href: "/admin/invoice/new", color: ACCENT },
    { label: "New Estimate", icon: FileEdit, href: "/admin/estimate/new", color: "#3B82F6" },
    { label: "New Payment", icon: CreditCard, href: "/admin/payment/new", color: "#22C55E" },
    { label: "Add Product", icon: Package, href: "/admin/products", color: "#F59E0B" },
    { label: "New Purchase", icon: ShoppingBag, href: "/admin/purchases", color: "#8B5CF6" },
    { label: "New Customer", icon: Users, href: "/admin/contacts", color: "#EF4444" },
    { label: "View Reports", icon: BarChart3, href: "/admin/reports", color: "#06B6D4" },
    { label: "Settings", icon: Settings, href: "/admin/settings", color: "#6B7280" },
  ];

  const orderProgress = [
    { label: "Total Orders", value: 102, color: TEXT_SECONDARY },
    { label: "Completed", value: 68, color: "#22C55E" },
    { label: "Processing", value: 20, color: "#3B82F6" },
    { label: "Pending", value: 10, color: "#F59E0B" },
    { label: "Cancelled", value: 4, color: "#EF4444" },
  ];

  const completionPct = Math.round((68 / 102) * 100);
  const ringR = 40;
  const ringCircumference = 2 * Math.PI * ringR;
  const ringOffset = ringCircumference * (1 - completionPct / 100);

  const card = { background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 14 };

  return (
    <div className="-m-6 overflow-hidden" style={{ background: DARK_BG, color: TEXT_PRIMARY, width: "calc(100% + 48px)" }}>

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-5 h-[60px] gap-3" style={{
        background: HEADER_BG,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button className="flex items-center bg-transparent border-none cursor-pointer p-0.5" style={{ color: TEXT_SECONDARY }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-[7px]">
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: "linear-gradient(135deg, #12D6C5 0%, #3B82F6 50%, #F59E0B 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: 14, color: "#fff",
            }}>K</div>
            <span className="text-base font-extrabold tracking-tight" style={{ color: TEXT_PRIMARY }}>KRYROS</span>
          </div>
        </div>

        {/* Center: search (hidden on mobile) */}
        <div className="hidden md:block" style={{ flex: 1, maxWidth: 320, position: "relative" }}>
          <Search className="absolute left-[11px] top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: TEXT_SECONDARY }} />
          <input placeholder="Search anything..." className="w-full outline-none" style={{
            background: CARD_BG, border: `1px solid ${BORDER}`,
            borderRadius: 10, padding: "7px 38px 7px 32px", color: TEXT_PRIMARY, fontSize: 12,
          }} />
          <span className="absolute right-[9px] top-1/2 -translate-y-1/2 text-[9px] px-[5px] py-[2px] rounded" style={{ color: TEXT_SECONDARY, background: ICON_BG }}>⌘K</span>
        </div>

        {/* Right: date + bell + avatar */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button className="hidden md:flex items-center gap-1.5 whitespace-nowrap cursor-pointer" style={{
            background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 8,
            padding: "6px 10px", color: TEXT_SECONDARY, fontSize: 11,
          }}>
            <Calendar className="w-[13px] h-[13px]" />
            May 20 – May 26, 2025
            <ChevronDown className="w-[11px] h-[11px]" />
          </button>

          <button className="relative bg-transparent border-none cursor-pointer p-1" style={{ color: TEXT_SECONDARY }}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 rounded-full w-[15px] h-[15px] text-[9px] flex items-center justify-center text-white font-bold"
              style={{ background: "#EF4444" }}>3</span>
          </button>

          <div className="rounded-full shrink-0 cursor-pointer flex items-center justify-center font-bold text-sm"
            style={{ width: 32, height: 32, background: ACCENT, color: "#0B1320" }}>K</div>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="p-4 flex flex-col gap-3.5">

        {/* Welcome */}
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: TEXT_PRIMARY }}>Welcome back, Admin! 👋</h2>
          <p className="text-[13px]" style={{ color: TEXT_SECONDARY }}>Here&apos;s what&apos;s happening with your business today.</p>
        </div>

        {/* Stat Cards — 5 cols desktop, 2 cols mobile */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
          {statCards.map((c, i) => (
            <div key={i} className="flex flex-col gap-1 p-3 pb-2" style={{ ...card }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-center shrink-0" style={{
                  width: 28, height: 28, borderRadius: 7, background: `${c.color}20`,
                }}>
                  <Activity className="w-[13px] h-[13px]" style={{ color: c.color }} />
                </div>
                <span className="text-[10px] font-bold" style={{
                  color: c.up === true ? "#22C55E" : c.up === false ? "#EF4444" : TEXT_SECONDARY,
                }}>{c.change}</span>
              </div>
              <span className="text-[10px] font-semibold leading-tight block whitespace-pre-line" style={{ color: TEXT_SECONDARY }}>{c.title}</span>
              <div className="text-lg font-extrabold" style={{ color: TEXT_PRIMARY }}>{c.value}</div>
              <div className="flex items-center gap-[3px]">
                {c.up === true && <TrendingUp className="w-2.5 h-2.5" style={{ color: "#22C55E" }} />}
                {c.up === false && <TrendingDown className="w-2.5 h-2.5" style={{ color: "#EF4444" }} />}
                {c.up === null && <Minus className="w-2.5 h-2.5" style={{ color: TEXT_SECONDARY }} />}
                <span className="text-[9px]" style={{ color: TEXT_SECONDARY }}>vs last week</span>
              </div>
              <MiniSparkline color={c.color} up={c.up === true} />
            </div>
          ))}
        </div>

        {/* Charts row — 3 cols desktop, stacked mobile */}
        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_1fr] gap-3">

          {/* Sales Analytics */}
          <div className="p-4" style={{ ...card }}>
            <div className="flex items-start justify-between mb-2.5">
              <div>
                <div className="text-[13px] font-bold" style={{ color: TEXT_PRIMARY }}>Sales Analytics</div>
                <div className="flex items-baseline gap-1.5 mt-[3px]">
                  <span className="text-xl font-extrabold" style={{ color: TEXT_PRIMARY }}>{formatPrice(summary.sales)}</span>
                  <span className="text-[11px] font-semibold" style={{ color: "#22C55E" }}>↑ 18.6% vs last week</span>
                </div>
              </div>
              <button className="flex items-center gap-1 shrink-0 cursor-pointer" style={{
                background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 7,
                padding: "5px 10px", color: TEXT_SECONDARY, fontSize: 11,
              }}>
                This Week <ChevronDown className="w-[11px] h-[11px]" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={salesData} margin={{ top: 6, right: 2, left: -22, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={ACCENT} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fill: TEXT_SECONDARY, fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: TEXT_SECONDARY, fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={2} fill="url(#salesGrad)"
                  dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }} activeDot={{ r: 5, fill: ACCENT }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Sales by Channel */}
          <div className="p-4" style={{ ...card }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[13px] font-bold" style={{ color: TEXT_PRIMARY }}>Sales by Channel</div>
              <button className="flex items-center gap-1 cursor-pointer" style={{
                background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 7,
                padding: "5px 10px", color: TEXT_SECONDARY, fontSize: 11,
              }}>
                This Week <ChevronDown className="w-[11px] h-[11px]" />
              </button>
            </div>
            <div className="relative h-[140px]">
              <ResponsiveContainer width="100%" height={140}>
                <PieChart>
                  <Pie data={salesByChannel} cx="50%" cy="50%" innerRadius={42} outerRadius={62} dataKey="value" paddingAngle={3}>
                    {salesByChannel.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => `${v}%`}
                    contentStyle={{ background: TOOLTIP_BG, border: `1px solid ${BORDER}`, borderRadius: 8 }}
                    labelStyle={{ color: TEXT_SECONDARY }} itemStyle={{ color: TEXT_PRIMARY }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-xs font-extrabold" style={{ color: TEXT_PRIMARY }}>{formatPrice(summary.sales)}</div>
                <div className="text-[9px]" style={{ color: TEXT_SECONDARY }}>Total Sales</div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mt-1.5">
              {salesByChannel.map((ch, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-[5px]">
                    <div className="rounded-full shrink-0" style={{ width: 7, height: 7, background: ch.color }} />
                    <span className="text-[10px]" style={{ color: TEXT_SECONDARY }}>{ch.name}</span>
                    <span className="text-[10px]" style={{ color: TEXT_SECONDARY }}>{ch.value}%</span>
                  </div>
                  <span className="text-[10px] font-bold" style={{ color: TEXT_PRIMARY }}>{formatPrice(ch.amount)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Progress */}
          <div className="p-4" style={{ ...card }}>
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[13px] font-bold" style={{ color: TEXT_PRIMARY }}>Order Progress</div>
              <Link href="/admin/orders" className="text-[11px] no-underline" style={{ color: ACCENT }}>View All</Link>
            </div>
            <div className="flex justify-center mb-2.5">
              <div className="relative" style={{ width: 100, height: 100 }}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={ringR} fill="none" stroke="var(--icon-bg)" strokeWidth="9" />
                  <circle cx="50" cy="50" r={ringR} fill="none" stroke={ACCENT} strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={`${ringCircumference}`}
                    strokeDashoffset={`${ringOffset}`}
                    transform="rotate(-90 50 50)"
                    style={{ transition: "stroke-dashoffset 1s ease" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-lg font-extrabold" style={{ color: TEXT_PRIMARY }}>{completionPct}%</div>
                  <div className="text-[9px] text-center leading-tight" style={{ color: TEXT_SECONDARY }}>Completion<br />Rate</div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {orderProgress.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="rounded-full shrink-0" style={{ width: 7, height: 7, background: p.color }} />
                    <span className="text-[10px]" style={{ color: TEXT_SECONDARY }}>{p.label}</span>
                  </div>
                  <span className="text-[11px] font-bold" style={{ color: TEXT_PRIMARY }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tables row — 3 cols desktop, stacked mobile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

          {/* Recent Orders */}
          <div className="p-3.5" style={{ ...card }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold" style={{ color: TEXT_PRIMARY }}>Recent Orders</div>
              <Link href="/admin/orders" className="text-[10px] no-underline" style={{ color: ACCENT }}>View All</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              {recentOrders.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center justify-center shrink-0 rounded-lg" style={{
                    width: 30, height: 30, background: ICON_BG,
                  }}>
                    <ShoppingCart className="w-[13px] h-[13px]" style={{ color: ACCENT }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold" style={{ color: TEXT_PRIMARY }}>{o.id}</div>
                    <div className="text-[9px] truncate" style={{ color: TEXT_SECONDARY }}>{o.customer}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] mb-0.5" style={{ color: TEXT_SECONDARY }}>{o.time}</div>
                    <div className="text-[10px] font-semibold mb-0.5" style={{ color: TEXT_PRIMARY }}>{formatPrice(o.amount)}</div>
                    <span className="text-[9px] font-bold px-1.5 py-[2px] rounded-[20px]" style={{
                      color: statusColors[o.status], background: statusBg[o.status],
                    }}>{o.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Selling Products */}
          <div className="p-3.5" style={{ ...card }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold" style={{ color: TEXT_PRIMARY }}>Top Selling Products</div>
              <Link href="/admin/products" className="text-[10px] no-underline" style={{ color: ACCENT }}>View All</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center justify-center shrink-0 rounded-lg" style={{
                    width: 30, height: 30, background: ICON_BG,
                  }}>
                    <Package className="w-[13px] h-[13px]" style={{ color: "#8B5CF6" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold truncate" style={{ color: TEXT_PRIMARY }}>{p.name}</div>
                    <div className="text-[9px]" style={{ color: TEXT_SECONDARY }}>{p.sub}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[9px] mb-0.5" style={{ color: TEXT_SECONDARY }}>{p.sold} Sold</div>
                    <div className="text-[10px] font-bold" style={{ color: TEXT_PRIMARY }}>{formatPrice(p.amount)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Customers */}
          <div className="p-3.5" style={{ ...card }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold" style={{ color: TEXT_PRIMARY }}>New Customers</div>
              <Link href="/admin/users" className="text-[10px] no-underline" style={{ color: ACCENT }}>View All</Link>
            </div>
            <div className="flex flex-col gap-2.5">
              {newCustomers.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center justify-center shrink-0 rounded-full text-white text-[11px] font-bold"
                    style={{ width: 30, height: 30, background: c.color }}>{c.initials}</div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold truncate" style={{ color: TEXT_PRIMARY }}>{c.name}</div>
                    <div className="text-[9px]" style={{ color: TEXT_SECONDARY }}>{c.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities — 5 cols desktop, 2 cols mobile */}
        <div className="p-3.5" style={{ ...card }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[13px] font-bold" style={{ color: TEXT_PRIMARY }}>Recent Activities</div>
            <Link href="/admin/reports" className="text-[11px] no-underline" style={{ color: ACCENT }}>View All</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
            {recentActivities.map((a, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-[10px]" style={{
                background: ICON_BG, border: `1px solid ${BORDER}`,
              }}>
                <div className="flex items-center justify-center shrink-0 rounded-lg mt-px" style={{
                  width: 28, height: 28, background: `${a.color}20`,
                }}>
                  <a.icon className="w-[13px] h-[13px]" style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-bold mb-0.5 leading-tight" style={{ color: TEXT_PRIMARY }}>{a.title}</div>
                  <div className="text-[9px] truncate mb-0.5" style={{ color: TEXT_SECONDARY }}>{a.sub}</div>
                  <div className="text-[9px]" style={{ color: TEXT_SECONDARY, opacity: 0.7 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions — 8 cols desktop, 4 cols mobile */}
        <div className="p-3.5" style={{ ...card }}>
          <div className="text-[13px] font-bold mb-3" style={{ color: TEXT_PRIMARY }}>Quick Actions</div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {quickActions.map((a, i) => (
              <Link key={i} href={a.href} className="flex flex-col items-center gap-[5px] p-2.5 px-1 rounded-[10px] no-underline" style={{
                background: ICON_BG, border: `1px solid ${BORDER}`,
              }}>
                <div className="flex items-center justify-center rounded-lg" style={{
                  width: 32, height: 32, background: `${a.color}18`,
                }}>
                  <a.icon className="w-[15px] h-[15px]" style={{ color: a.color }} />
                </div>
                <span className="text-[9px] font-semibold text-center leading-tight" style={{ color: TEXT_SECONDARY }}>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Financial Summary — 4 cols desktop, 2 cols mobile */}
        <div className="pb-2">
          <div className="text-[13px] font-bold mb-2.5" style={{ color: TEXT_PRIMARY }}>Financial Summary</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
            {[
              { label: "Outstanding\nBalance", value: formatPrice(summary.outstandingBalance), sub: "No outstanding amounts", icon: AlertCircle, color: "#3B82F6" },
              { label: "Outstanding\nPayment", value: formatPrice(summary.outstandingPayment), sub: "No pending payments", icon: Clock, color: "#F59E0B" },
              { label: "Total Expenses", value: formatPrice(summary.expense), sub: "This month", icon: DollarSign, color: "#EF4444" },
              { label: "Profit / Loss", value: formatPrice(summary.profit), sub: "This month", icon: TrendingUp, color: "#22C55E", highlight: true },
            ].map((item, i) => (
              <div key={i} className="p-4" style={{
                ...card,
                background: item.highlight ? "linear-gradient(135deg, #0a6a5f, #12D6C5)" : CARD_BG,
                border: item.highlight ? "none" : `1px solid ${BORDER}`,
              }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center justify-center shrink-0 rounded-lg" style={{
                    width: 30, height: 30, background: item.highlight ? "rgba(255,255,255,0.2)" : `${item.color}20`,
                  }}>
                    <item.icon className="w-3.5 h-3.5" style={{ color: item.highlight ? "#fff" : item.color }} />
                  </div>
                  <span className="text-[10px] font-semibold leading-tight whitespace-pre-line" style={{
                    color: item.highlight ? "rgba(255,255,255,0.85)" : TEXT_SECONDARY,
                  }}>{item.label}</span>
                </div>
                <div className="text-lg font-extrabold" style={{ color: item.highlight ? "#fff" : TEXT_PRIMARY }}>{item.value}</div>
                <div className="text-[10px] mt-[3px]" style={{ color: item.highlight ? "rgba(255,255,255,0.65)" : TEXT_SECONDARY }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
