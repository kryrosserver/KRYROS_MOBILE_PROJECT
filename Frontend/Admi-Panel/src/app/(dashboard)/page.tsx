"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell, Settings, Search, Calendar, Sun, ChevronDown,
  TrendingUp, TrendingDown, Minus, FileText, FileEdit,
  CreditCard, ShoppingBag, Users, Package, BarChart3,
  Plus, ShoppingCart, Activity, DollarSign, AlertCircle,
  CheckCircle, Clock, X,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const DARK_BG = "#0D1626";
const CARD_BG = "#132035";
const BORDER = "#1E2D42";
const TEXT_PRIMARY = "#FFFFFF";
const TEXT_SECONDARY = "#AAB4C5";
const ACCENT = "#12D6C5";

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
  { name: "Web Store", value: 56.2, amount: 3462, color: ACCENT },
  { name: "Mobile App", value: 28.4, amount: 1748, color: "#3B82F6" },
  { name: "Get Now (Pay Later)", value: 10.3, amount: 635, color: "#F59E0B" },
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
  { name: "iPhone 15 Pro Max", sub: "256GB", sold: 245, amount: 268756 },
  { name: "MacBook Air M2", sub: "13-inch", sold: 186, amount: 232014 },
  { name: "Sony WH-1000XM5", sub: "Headphones", sold: 163, amount: 56687 },
  { name: "Apple Watch Series 9", sub: "45mm", sold: 151, amount: 60349 },
  { name: "Samsung Galaxy S24 Ultra", sub: "256GB", sold: 128, amount: 143872 },
];

const newCustomers = [
  { name: "Bwalya Chileshe", date: "May 26, 2025", initials: "BC", color: "#3B82F6" },
  { name: "Mulenga Sichone", date: "May 26, 2025", initials: "MS", color: "#8B5CF6" },
  { name: "Chansa Mumba", date: "May 25, 2025", initials: "CM", color: "#F59E0B" },
  { name: "Chanda Kapwepwe", date: "May 25, 2025", initials: "CK", color: "#EF4444" },
  { name: "Mwila Tembo", date: "May 25, 2025", initials: "MT", color: "#10B981" },
];

const recentActivities = [
  { icon: ShoppingCart, color: ACCENT, title: "New order received", sub: "#KRY123456", time: "2 mins ago" },
  { icon: CreditCard, color: "#3B82F6", title: "Payment received", sub: "$1,099.00 from Bwalya", time: "10 mins ago" },
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

const MiniSparkline = ({ color = ACCENT, up = true }: { color?: string; up?: boolean }) => {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sg-${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: "#1E2D42", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px" }}>
        <p style={{ color: TEXT_SECONDARY, fontSize: 11, marginBottom: 2 }}>{label}</p>
        <p style={{ color: TEXT_PRIMARY, fontSize: 13, fontWeight: 700 }}>{formatPrice(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [summary, setSummary] = useState({
    sales: 6162, orders: 102, purchases: 0,
    paymentReceived: 6162, paymentPaid: 0,
    outstandingBalance: 0, outstandingPayment: 0,
    expense: 0, profit: 6162,
  });

  useEffect(() => {
    fetch("/internal/admin/reports/summary?range=month", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data?.stats) {
          setSummary(s => ({
            ...s,
            sales: data.stats.totalRevenue || s.sales,
            paymentReceived: data.stats.totalRevenue || s.paymentReceived,
            profit: data.stats.totalRevenue || s.profit,
          }));
        }
      })
      .catch(() => {});
  }, []);

  const statCards = [
    { title: "Total Sales", value: formatPrice(summary.sales), change: "+18.6%", up: true, color: "#F59E0B" },
    { title: "Total Orders", value: String(summary.orders), change: "+12.4%", up: true, color: ACCENT },
    { title: "Total Purchases", value: formatPrice(summary.purchases), change: "—0.0%", up: null, color: "#8B5CF6" },
    { title: "Payment Received", value: formatPrice(summary.paymentReceived), change: "+18.6%", up: true, color: "#22C55E" },
    { title: "Payment Paid", value: formatPrice(summary.paymentPaid), change: "—0.0%", up: null, color: "#EF4444" },
  ];

  const quickActions = [
    { label: "New Invoice", icon: FileText, href: "/admin/invoice/new" },
    { label: "New Estimate", icon: FileEdit, href: "/admin/estimate/new" },
    { label: "New Payment", icon: CreditCard, href: "/admin/payment/new" },
    { label: "Add Product", icon: Package, href: "/admin/products" },
    { label: "New Purchase", icon: ShoppingBag, href: "/admin/purchases" },
    { label: "New Customer", icon: Users, href: "/admin/contacts" },
    { label: "View Reports", icon: BarChart3, href: "/admin/reports" },
    { label: "Settings", icon: Settings, href: "/admin/settings" },
  ];

  const orderProgress = [
    { label: "Total Orders", value: 102, color: TEXT_SECONDARY },
    { label: "Completed", value: 68, color: "#22C55E" },
    { label: "Processing", value: 20, color: "#3B82F6" },
    { label: "Pending", value: 10, color: "#F59E0B" },
    { label: "Cancelled", value: 4, color: "#EF4444" },
  ];

  const completionPct = Math.round((68 / 102) * 100);
  const ringCircumference = 2 * Math.PI * 54;
  const ringOffset = ringCircumference * (1 - completionPct / 100);

  const cardStyle = {
    background: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: 14,
  };

  return (
    <div style={{ background: DARK_BG, minHeight: "100vh", color: TEXT_PRIMARY }}>

      {/* ── TOP HEADER ───────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 md:px-6"
        style={{ background: "#0B1320", borderBottom: `1px solid ${BORDER}`, height: 60 }}
      >
        {/* Left: title */}
        <h1 className="text-base md:text-lg font-bold shrink-0" style={{ color: TEXT_PRIMARY }}>
          Dashboard
        </h1>

        {/* Center: search — hidden on small, visible md+ */}
        <div className="hidden md:flex flex-1 max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: TEXT_SECONDARY }} />
          <input
            placeholder="Search anything..."
            className="w-full pl-9 pr-10 py-2 text-sm rounded-lg outline-none"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT_PRIMARY }}
          />
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded"
            style={{ color: TEXT_SECONDARY, background: "#1E2D42" }}
          >⌘K</span>
        </div>

        {/* Right: icons */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Mobile search toggle */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: TEXT_SECONDARY }}
            onClick={() => setSearchOpen(o => !o)}
          >
            {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {/* Date — hidden on mobile */}
          <button
            className="hidden lg:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg shrink-0"
            style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT_SECONDARY }}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>May 20 – May 26, 2025</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Bell */}
          <button className="relative p-1.5" style={{ color: TEXT_SECONDARY }}>
            <Bell className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white" style={{ background: "#EF4444" }}>3</span>
          </button>

          {/* Sun — hidden on mobile */}
          <button className="hidden sm:block p-1.5" style={{ color: TEXT_SECONDARY }}>
            <Sun className="w-5 h-5" />
          </button>

          {/* Admin profile */}
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0" style={{ background: ACCENT, color: "#0B1320" }}>K</div>
            <div className="hidden sm:block">
              <div className="text-sm font-bold leading-none" style={{ color: TEXT_PRIMARY }}>Admin</div>
              <div className="text-[10px] mt-0.5" style={{ color: TEXT_SECONDARY }}>Super Admin</div>
            </div>
            <ChevronDown className="hidden sm:block w-3.5 h-3.5" style={{ color: TEXT_SECONDARY }} />
          </div>
        </div>
      </header>

      {/* Mobile search bar (expands below header) */}
      {searchOpen && (
        <div className="md:hidden px-4 py-2" style={{ background: "#0B1320", borderBottom: `1px solid ${BORDER}` }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: TEXT_SECONDARY }} />
            <input
              autoFocus
              placeholder="Search anything..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none"
              style={{ background: CARD_BG, border: `1px solid ${BORDER}`, color: TEXT_PRIMARY }}
            />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ────────────────────────────────────── */}
      <div className="p-4 md:p-5 xl:p-6 flex flex-col xl:flex-row gap-5">

        {/* LEFT: main dashboard content */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Welcome */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>
              Welcome back, Admin! 👋
            </h2>
            <p className="text-sm mt-1" style={{ color: TEXT_SECONDARY }}>
              Here's what's happening with your business today.
            </p>
          </div>

          {/* ── STAT CARDS ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
            {statCards.map((card, i) => (
              <div key={i} className="flex flex-col gap-2 p-4" style={cardStyle}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${card.color}20` }}>
                    <Activity className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <span className="text-xs font-semibold leading-tight" style={{ color: TEXT_SECONDARY }}>
                    {card.title}
                  </span>
                </div>
                <div className="text-xl md:text-2xl font-extrabold" style={{ color: TEXT_PRIMARY }}>
                  {card.value}
                </div>
                <div className="flex items-center gap-1.5">
                  {card.up === true && <TrendingUp className="w-3 h-3" style={{ color: "#22C55E" }} />}
                  {card.up === false && <TrendingDown className="w-3 h-3" style={{ color: "#EF4444" }} />}
                  {card.up === null && <Minus className="w-3 h-3" style={{ color: TEXT_SECONDARY }} />}
                  <span className="text-xs font-semibold"
                    style={{ color: card.up === true ? "#22C55E" : card.up === false ? "#EF4444" : TEXT_SECONDARY }}>
                    {card.change}
                  </span>
                  <span className="text-[10px]" style={{ color: TEXT_SECONDARY }}>vs last week</span>
                </div>
                <MiniSparkline color={card.color} up={card.up === true} />
              </div>
            ))}
          </div>

          {/* ── CHARTS ROW ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">

            {/* Sales Analytics */}
            <div className="p-4 md:p-5" style={cardStyle}>
              <div className="flex items-start justify-between mb-4 gap-2">
                <div>
                  <div className="text-sm font-bold" style={{ color: TEXT_PRIMARY }}>Sales Analytics</div>
                  <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                    <span className="text-xl md:text-2xl font-extrabold" style={{ color: TEXT_PRIMARY }}>
                      {formatPrice(summary.sales)}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "#22C55E" }}>↑ 18.6% vs last week</span>
                  </div>
                </div>
                <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg shrink-0"
                  style={{ background: "#1E2D42", border: `1px solid ${BORDER}`, color: TEXT_SECONDARY }}>
                  This Week <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={salesData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={ACCENT} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fill: TEXT_SECONDARY, fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: TEXT_SECONDARY, fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="value" stroke={ACCENT} strokeWidth={2} fill="url(#salesGrad)"
                    dot={{ r: 3, fill: ACCENT, strokeWidth: 0 }} activeDot={{ r: 5, fill: ACCENT }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Sales by Channel */}
            <div className="p-4 md:p-5" style={cardStyle}>
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="text-sm font-bold" style={{ color: TEXT_PRIMARY }}>Sales by Channel</div>
                <button className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg shrink-0"
                  style={{ background: "#1E2D42", border: `1px solid ${BORDER}`, color: TEXT_SECONDARY }}>
                  This Week <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div className="relative flex justify-center" style={{ height: 150 }}>
                <ResponsiveContainer width="100%" height={150}>
                  <PieChart>
                    <Pie data={salesByChannel} cx="50%" cy="50%" innerRadius={45} outerRadius={68} dataKey="value" paddingAngle={3}>
                      {salesByChannel.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip formatter={(val: any) => `${val}%`}
                      contentStyle={{ background: "#1E2D42", border: `1px solid ${BORDER}`, borderRadius: 8 }}
                      labelStyle={{ color: TEXT_SECONDARY }} itemStyle={{ color: TEXT_PRIMARY }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-sm font-extrabold" style={{ color: TEXT_PRIMARY }}>{formatPrice(summary.sales)}</div>
                  <div className="text-[10px]" style={{ color: TEXT_SECONDARY }}>Total Sales</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 mt-3">
                {salesByChannel.map((ch, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: ch.color }} />
                      <span className="text-xs" style={{ color: TEXT_SECONDARY }}>{ch.name}</span>
                      <span className="text-xs" style={{ color: TEXT_SECONDARY }}>{ch.value}%</span>
                    </div>
                    <span className="text-xs font-bold" style={{ color: TEXT_PRIMARY }}>{formatPrice(ch.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── BOTTOM TABLES ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">

            {/* Recent Orders */}
            <div className="p-4 md:p-5" style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold" style={{ color: TEXT_PRIMARY }}>Recent Orders</div>
                <Link href="/admin/orders" className="text-xs font-semibold" style={{ color: ACCENT }}>View All</Link>
              </div>
              <div className="flex flex-col gap-3">
                {recentOrders.map((o, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "#1E2D42" }}>
                      <ShoppingCart className="w-4 h-4" style={{ color: ACCENT }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold" style={{ color: TEXT_PRIMARY }}>{o.id}</div>
                      <div className="text-xs truncate" style={{ color: TEXT_SECONDARY }}>{o.customer}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] mb-1" style={{ color: TEXT_SECONDARY }}>{o.time}</div>
                      <div className="text-xs font-semibold mb-1" style={{ color: TEXT_PRIMARY }}>{formatPrice(o.amount)}</div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ color: statusColors[o.status], background: statusBg[o.status] }}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Selling Products */}
            <div className="p-4 md:p-5" style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold" style={{ color: TEXT_PRIMARY }}>Top Selling Products</div>
                <Link href="/admin/products" className="text-xs font-semibold" style={{ color: ACCENT }}>View All</Link>
              </div>
              <div className="flex flex-col gap-3">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "#1E2D42" }}>
                      <Package className="w-4 h-4" style={{ color: "#8B5CF6" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: TEXT_PRIMARY }}>{p.name}</div>
                      <div className="text-xs" style={{ color: TEXT_SECONDARY }}>{p.sub}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] mb-1" style={{ color: TEXT_SECONDARY }}>{p.sold} Sold</div>
                      <div className="text-xs font-bold" style={{ color: TEXT_PRIMARY }}>{formatPrice(p.amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Customers */}
            <div className="p-4 md:p-5 md:col-span-2 xl:col-span-1" style={cardStyle}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-bold" style={{ color: TEXT_PRIMARY }}>New Customers</div>
                <Link href="/admin/users" className="text-xs font-semibold" style={{ color: ACCENT }}>View All</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                {newCustomers.map((c, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                      style={{ background: c.color, color: "#fff" }}>
                      {c.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: TEXT_PRIMARY }}>{c.name}</div>
                      <div className="text-xs" style={{ color: TEXT_SECONDARY }}>{c.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FINANCIAL SUMMARY ─── */}
          <div>
            <div className="text-sm font-bold mb-3" style={{ color: TEXT_PRIMARY }}>Financial Summary</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
              {[
                { label: "Outstanding Balance", value: formatPrice(summary.outstandingBalance), sub: "No outstanding amounts", icon: AlertCircle, color: "#3B82F6" },
                { label: "Outstanding Payment", value: formatPrice(summary.outstandingPayment), sub: "No pending payments", icon: Clock, color: "#F59E0B" },
                { label: "Total Expenses", value: formatPrice(summary.expense), sub: "This month", icon: DollarSign, color: "#EF4444" },
                { label: "Profit / Loss", value: formatPrice(summary.profit), sub: "This month", icon: TrendingUp, color: "#22C55E", highlight: true },
              ].map((item, i) => (
                <div key={i} className="p-4" style={{
                  ...cardStyle,
                  background: item.highlight ? "linear-gradient(135deg, #0a6a5f, #12D6C5)" : CARD_BG,
                  border: item.highlight ? "none" : `1px solid ${BORDER}`,
                }}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: item.highlight ? "rgba(255,255,255,0.2)" : `${item.color}20` }}>
                      <item.icon className="w-4 h-4" style={{ color: item.highlight ? "#fff" : item.color }} />
                    </div>
                    <span className="text-xs font-semibold leading-tight"
                      style={{ color: item.highlight ? "rgba(255,255,255,0.85)" : TEXT_SECONDARY }}>
                      {item.label}
                    </span>
                  </div>
                  <div className="text-xl md:text-2xl font-extrabold"
                    style={{ color: item.highlight ? "#fff" : TEXT_PRIMARY }}>
                    {item.value}
                  </div>
                  <div className="text-xs mt-1"
                    style={{ color: item.highlight ? "rgba(255,255,255,0.65)" : TEXT_SECONDARY }}>
                    {item.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────────── */}
        <div className="w-full xl:w-60 shrink-0 flex flex-col gap-4">

          {/* Quick Actions */}
          <div className="p-4" style={cardStyle}>
            <div className="text-sm font-bold mb-3" style={{ color: TEXT_PRIMARY }}>Quick Actions</div>
            <div className="grid grid-cols-4 sm:grid-cols-8 xl:grid-cols-4 gap-2">
              {quickActions.map((a, i) => (
                <Link key={i} href={a.href}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors"
                  style={{ background: "#1E2D42", border: `1px solid ${BORDER}`, textDecoration: "none" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: `${ACCENT}20` }}>
                    <a.icon className="w-4 h-4" style={{ color: ACCENT }} />
                  </div>
                  <span className="text-[10px] font-semibold text-center leading-tight"
                    style={{ color: TEXT_SECONDARY }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Order Progress */}
          <div className="p-4" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold" style={{ color: TEXT_PRIMARY }}>Order Progress</div>
              <Link href="/admin/orders" className="text-xs font-semibold" style={{ color: ACCENT }}>View All</Link>
            </div>

            {/* Ring */}
            <div className="flex justify-center mb-4">
              <div className="relative" style={{ width: 130, height: 130 }}>
                <svg width="130" height="130" viewBox="0 0 130 130">
                  <circle cx="65" cy="65" r="54" fill="none" stroke="#1E2D42" strokeWidth="10" />
                  <circle cx="65" cy="65" r="54" fill="none" stroke={ACCENT} strokeWidth="10"
                    strokeLinecap="round" strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset} transform="rotate(-90 65 65)"
                    style={{ transition: "stroke-dashoffset 1s ease" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-extrabold" style={{ color: TEXT_PRIMARY }}>{completionPct}%</div>
                  <div className="text-[10px] text-center" style={{ color: TEXT_SECONDARY }}>Completion<br />Rate</div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {orderProgress.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
                    <span className="text-xs" style={{ color: TEXT_SECONDARY }}>{p.label}</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: TEXT_PRIMARY }}>{p.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="p-4" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-bold" style={{ color: TEXT_PRIMARY }}>Recent Activities</div>
              <Link href="/admin/reports" className="text-xs font-semibold" style={{ color: ACCENT }}>View All</Link>
            </div>
            <div className="flex flex-col gap-3">
              {recentActivities.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: `${a.color}20` }}>
                    <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold" style={{ color: TEXT_PRIMARY }}>{a.title}</div>
                    <div className="text-xs truncate" style={{ color: TEXT_SECONDARY }}>{a.sub}</div>
                    <div className="text-[10px] mt-0.5" style={{ color: TEXT_SECONDARY, opacity: 0.7 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
