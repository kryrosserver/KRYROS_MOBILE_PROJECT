"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bell, Settings, Search, Calendar, ChevronDown,
  TrendingUp, TrendingDown, Minus, FileText, FileEdit,
  CreditCard, ShoppingBag, Users, Package, BarChart3,
  ShoppingCart, Activity, DollarSign, AlertCircle,
  CheckCircle, Clock, Menu, ChevronLeft, ChevronRight,
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

const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;

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
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const { isDark } = useTheme();

  useEffect(() => {
    let raf: number;

    function applyHeight(nextScale: number) {
      if (!innerRef.current || !outerRef.current) return;
      outerRef.current.style.height = "auto";
      const naturalH = innerRef.current.scrollHeight;
      const visualH = naturalH * nextScale;
      outerRef.current.style.height = `${visualH}px`;
    }

    function recalc() {
      if (!innerRef.current || !outerRef.current) return;
      const vw = outerRef.current.offsetWidth || window.innerWidth;
      const baseW = vw < 960 ? MOBILE_BASE : DESKTOP_BASE;
      if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const nextScale = Math.min(1, vw / baseW);

      innerRef.current.style.width = `${baseW}px`;
      innerRef.current.style.transform = `scale(${nextScale})`;
      innerRef.current.style.transformOrigin = "top left";
      setScale(nextScale);

      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => applyHeight(nextScale));
      });
    }

    recalc();
    const t = setTimeout(recalc, 400);
    window.addEventListener("resize", recalc);
    return () => {
      window.removeEventListener("resize", recalc);
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []);

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
    <div ref={outerRef} style={{ overflow: "hidden", background: DARK_BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: DARK_BG, color: TEXT_PRIMARY }}>

        {/* ── HEADER ── */}
        <header style={{
          background: HEADER_BG,
          borderBottom: `1px solid ${BORDER}`,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          gap: 12,
        }}>
          {/* Left: hamburger + logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT_SECONDARY, padding: 2, display: "flex", alignItems: "center" }}>
              <Menu style={{ width: 20, height: 20 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: "linear-gradient(135deg, #12D6C5 0%, #3B82F6 50%, #F59E0B 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0,
              }}>K</div>
              <span style={{ fontSize: 16, fontWeight: 800, color: TEXT_PRIMARY, letterSpacing: "-0.3px" }}>KRYROS</span>
            </div>
          </div>

          {/* Center: search */}
          <div style={{ flex: 1, maxWidth: 320, position: "relative" }}>
            <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: TEXT_SECONDARY, width: 14, height: 14 }} />
            <input placeholder="Search anything..." style={{
              width: "100%", background: CARD_BG, border: `1px solid ${BORDER}`,
              borderRadius: 10, padding: "7px 38px 7px 32px", color: TEXT_PRIMARY, fontSize: 12, outline: "none",
            }} />
            <span style={{
              position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)",
              fontSize: 9, color: TEXT_SECONDARY, background: ICON_BG, padding: "2px 5px", borderRadius: 4,
            }}>⌘K</span>
          </div>

          {/* Right: date + bell + avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 6, background: CARD_BG,
              border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px",
              color: TEXT_SECONDARY, fontSize: 11, cursor: "pointer", whiteSpace: "nowrap",
            }}>
              <Calendar style={{ width: 13, height: 13 }} />
              May 20 – May 26, 2025
              <ChevronDown style={{ width: 11, height: 11 }} />
            </button>

            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT_SECONDARY, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{
                position: "absolute", top: 0, right: 0, background: "#EF4444",
                borderRadius: "50%", width: 15, height: 15, fontSize: 9,
                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700,
              }}>3</span>
            </button>

            <div style={{
              width: 32, height: 32, borderRadius: "50%", background: ACCENT,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 700, fontSize: 14, color: "#0B1320", flexShrink: 0, cursor: "pointer",
            }}>K</div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Welcome */}
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 4 }}>Welcome back, Admin! 👋</h2>
            <p style={{ fontSize: 13, color: TEXT_SECONDARY }}>Here's what's happening with your business today.</p>
          </div>

          {/* Stat Cards — 5 columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
            {statCards.map((c, i) => (
              <div key={i} style={{ ...card, padding: "12px 12px 8px", display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${c.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Activity style={{ width: 13, height: 13, color: c.color }} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: c.up === true ? "#22C55E" : c.up === false ? "#EF4444" : TEXT_SECONDARY }}>{c.change}</span>
                </div>
                <span style={{ fontSize: 10, color: TEXT_SECONDARY, fontWeight: 600, lineHeight: 1.3, display: "block", whiteSpace: "pre-line" }}>{c.title}</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: TEXT_PRIMARY }}>{c.value}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  {c.up === true && <TrendingUp style={{ width: 10, height: 10, color: "#22C55E" }} />}
                  {c.up === false && <TrendingDown style={{ width: 10, height: 10, color: "#EF4444" }} />}
                  {c.up === null && <Minus style={{ width: 10, height: 10, color: TEXT_SECONDARY }} />}
                  <span style={{ fontSize: 9, color: TEXT_SECONDARY }}>vs last week</span>
                </div>
                <MiniSparkline color={c.color} up={c.up === true} />
              </div>
            ))}
          </div>

          {/* Charts row — 3 columns: Sales Analytics | Sales by Channel | Order Progress */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr", gap: 12 }}>

            {/* Sales Analytics */}
            <div style={{ ...card, padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY }}>Sales Analytics</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: 20, fontWeight: 800, color: TEXT_PRIMARY }}>{formatPrice(summary.sales)}</span>
                    <span style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>↑ 18.6% vs last week</span>
                  </div>
                </div>
                <button style={{ display: "flex", alignItems: "center", gap: 4, background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 7, padding: "5px 10px", color: TEXT_SECONDARY, fontSize: 11, cursor: "pointer", flexShrink: 0 }}>
                  This Week <ChevronDown style={{ width: 11, height: 11 }} />
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
            <div style={{ ...card, padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY }}>Sales by Channel</div>
                <button style={{ display: "flex", alignItems: "center", gap: 4, background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 7, padding: "5px 10px", color: TEXT_SECONDARY, fontSize: 11, cursor: "pointer" }}>
                  This Week <ChevronDown style={{ width: 11, height: 11 }} />
                </button>
              </div>
              <div style={{ position: "relative", height: 140 }}>
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
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: TEXT_PRIMARY }}>{formatPrice(summary.sales)}</div>
                  <div style={{ fontSize: 9, color: TEXT_SECONDARY }}>Total Sales</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 6 }}>
                {salesByChannel.map((ch, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: ch.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: TEXT_SECONDARY }}>{ch.name}</span>
                      <span style={{ fontSize: 10, color: TEXT_SECONDARY }}>{ch.value}%</span>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: TEXT_PRIMARY }}>{formatPrice(ch.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Progress */}
            <div style={{ ...card, padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY }}>Order Progress</div>
                <Link href="/admin/orders" style={{ fontSize: 11, color: ACCENT, textDecoration: "none" }}>View All</Link>
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                <div style={{ position: "relative", width: 100, height: 100 }}>
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={ringR} fill="none" stroke="var(--icon-bg)" strokeWidth="9" />
                    <circle cx="50" cy="50" r={ringR} fill="none" stroke={ACCENT} strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray={`${ringCircumference}`}
                      strokeDashoffset={`${ringOffset}`}
                      transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dashoffset 1s ease" }} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: TEXT_PRIMARY }}>{completionPct}%</div>
                    <div style={{ fontSize: 9, color: TEXT_SECONDARY, textAlign: "center", lineHeight: 1.3 }}>Completion<br />Rate</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {orderProgress.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: p.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 10, color: TEXT_SECONDARY }}>{p.label}</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: TEXT_PRIMARY }}>{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tables row — 3 columns: Recent Orders | Top Selling | New Customers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>

            {/* Recent Orders */}
            <div style={{ ...card, padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_PRIMARY }}>Recent Orders</div>
                <Link href="/admin/orders" style={{ fontSize: 10, color: ACCENT, textDecoration: "none" }}>View All</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recentOrders.map((o, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: ICON_BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <ShoppingCart style={{ width: 13, height: 13, color: ACCENT }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_PRIMARY }}>{o.id}</div>
                      <div style={{ fontSize: 9, color: TEXT_SECONDARY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.customer}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 9, color: TEXT_SECONDARY, marginBottom: 2 }}>{o.time}</div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 2 }}>{formatPrice(o.amount)}</div>
                      <span style={{ fontSize: 9, fontWeight: 700, color: statusColors[o.status], background: statusBg[o.status], padding: "2px 6px", borderRadius: 20 }}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Selling Products */}
            <div style={{ ...card, padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_PRIMARY }}>Top Selling Products</div>
                <Link href="/admin/products" style={{ fontSize: 10, color: ACCENT, textDecoration: "none" }}>View All</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {topProducts.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 7, background: ICON_BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Package style={{ width: 13, height: 13, color: "#8B5CF6" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_PRIMARY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                      <div style={{ fontSize: 9, color: TEXT_SECONDARY }}>{p.sub}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 9, color: TEXT_SECONDARY, marginBottom: 2 }}>{p.sold} Sold</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_PRIMARY }}>{formatPrice(p.amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* New Customers */}
            <div style={{ ...card, padding: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_PRIMARY }}>New Customers</div>
                <Link href="/admin/users" style={{ fontSize: 10, color: ACCENT, textDecoration: "none" }}>View All</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {newCustomers.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, color: "#fff", flexShrink: 0 }}>
                      {c.initials}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_PRIMARY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                      <div style={{ fontSize: 9, color: TEXT_SECONDARY }}>{c.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Recent Activities — full-width horizontal row */}
          <div style={{ ...card, padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY }}>Recent Activities</div>
              <Link href="/admin/reports" style={{ fontSize: 11, color: ACCENT, textDecoration: "none" }}>View All</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
              {recentActivities.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: ICON_BG, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "10px" }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: `${a.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                    <a.icon style={{ width: 13, height: 13, color: a.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 2, lineHeight: 1.3 }}>{a.title}</div>
                    <div style={{ fontSize: 9, color: TEXT_SECONDARY, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>{a.sub}</div>
                    <div style={{ fontSize: 9, color: TEXT_SECONDARY, opacity: 0.7 }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions — full-width single horizontal row */}
          <div style={{ ...card, padding: "14px 16px" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 12 }}>Quick Actions</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 8 }}>
              {quickActions.map((a, i) => (
                <Link key={i} href={a.href} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  padding: "10px 4px", background: ICON_BG, borderRadius: 10,
                  border: `1px solid ${BORDER}`, textDecoration: "none",
                }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `${a.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <a.icon style={{ width: 15, height: 15, color: a.color }} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, color: TEXT_SECONDARY, textAlign: "center", lineHeight: 1.3 }}>{a.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div style={{ paddingBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY, marginBottom: 10 }}>Financial Summary</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { label: "Outstanding\nBalance", value: formatPrice(summary.outstandingBalance), sub: "No outstanding amounts", icon: AlertCircle, color: "#3B82F6" },
                { label: "Outstanding\nPayment", value: formatPrice(summary.outstandingPayment), sub: "No pending payments", icon: Clock, color: "#F59E0B" },
                { label: "Total Expenses", value: formatPrice(summary.expense), sub: "This month", icon: DollarSign, color: "#EF4444" },
                { label: "Profit / Loss", value: formatPrice(summary.profit), sub: "This month", icon: TrendingUp, color: "#22C55E", highlight: true },
              ].map((item, i) => (
                <div key={i} style={{
                  ...card,
                  padding: "16px",
                  background: item.highlight ? "linear-gradient(135deg, #0a6a5f, #12D6C5)" : CARD_BG,
                  border: item.highlight ? "none" : `1px solid ${BORDER}`,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: item.highlight ? "rgba(255,255,255,0.2)" : `${item.color}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <item.icon style={{ width: 14, height: 14, color: item.highlight ? "#fff" : item.color }} />
                    </div>
                    <span style={{ fontSize: 10, color: item.highlight ? "rgba(255,255,255,0.85)" : TEXT_SECONDARY, fontWeight: 600, lineHeight: 1.3, whiteSpace: "pre-line" }}>{item.label}</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: item.highlight ? "#fff" : TEXT_PRIMARY }}>{item.value}</div>
                  <div style={{ fontSize: 10, color: item.highlight ? "rgba(255,255,255,0.65)" : TEXT_SECONDARY, marginTop: 3 }}>{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Swipe navigation */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 4px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: TEXT_SECONDARY, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              <ChevronLeft style={{ width: 16, height: 16 }} />
              <span>Swipe Left</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  width: i === 3 ? 20 : 7, height: 7, borderRadius: 4,
                  background: i === 3 ? ACCENT : "var(--icon-bg)",
                  border: `1px solid ${i === 3 ? ACCENT : BORDER}`,
                  transition: "width 0.2s",
                }} />
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: TEXT_SECONDARY, fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
              <span>Swipe Right</span>
              <ChevronRight style={{ width: 16, height: 16 }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
