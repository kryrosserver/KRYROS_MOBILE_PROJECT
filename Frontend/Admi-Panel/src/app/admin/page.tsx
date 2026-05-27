"use client";

import { useEffect, useState } from "react";

const ORANGE = "#F97316";
const VIOLET = "#8B5CF6";
const TEAL = "#0891B2";
const PINK = "#EC4899";
const GREEN = "#10B981";
const YELLOW = "#F59E0B";
const ACCENT = "#6366F1";
const SIDEBAR_BG = "#12172B";

/*    Inline SVG icons    */
const IconSales = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>;
const IconOrders = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>;
const IconCheck = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
const IconProfit = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>;
const IconExport = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>;
const IconPlus = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /*    Stat cards data    */
  const stats = [
    { label: "Total Sales", val: "$3,682", chg: "↑ 18.6% vs last month", color: ORANGE, grad: "linear-gradient(140deg,#F97316,#FB923C)", ico: IconSales, spark: "M0,34 L12,26 L26,30 L40,16 L55,8 L70,12 L76,3" },
    { label: "Total Orders", val: "102", chg: "↑ 12.4% vs last month", color: VIOLET, grad: "linear-gradient(140deg,#8B5CF6,#A78BFA)", ico: IconOrders, spark: "M0,36 L14,28 L28,32 L42,18 L56,10 L70,6 L76,2" },
    { label: "Payment Received", val: "$3,682", chg: "↑ 18.6% vs last month", color: TEAL, grad: "linear-gradient(140deg,#0891B2,#06B6D4)", ico: IconCheck, spark: "M0,38 L16,30 L30,34 L44,20 L58,12 L72,6 L76,1" },
    { label: "Profit / Loss", val: "$3,682", chg: "↑ All-time high", color: "#1E293B", grad: "linear-gradient(140deg,#1E293B,#334155)", ico: IconProfit, spark: "M0,38 L18,30 L34,34 L46,18 L58,10 L70,4 L76,0", chgColor: "#FB923C", icoBg: "rgba(249,115,22,.2)", icoStroke: "#F97316" },
  ];

  /*    Orders data    */
  const orders = [
    { id: "#KRY123456", name: "Bwalya Chileshe", amt: "$1,099", status: "Completed", statusClass: "pg", time: "10:34" },
    { id: "#KRY123455", name: "Mulenga Sichone", amt: "$349", status: "Processing", statusClass: "pb", time: "09:15" },
    { id: "#KRY123454", name: "Chansa Mumba", amt: "$2,499", status: "Completed", statusClass: "pg", time: "08:45" },
    { id: "#KRY123453", name: "Chanda Kapwepwe", amt: "$129", status: "Pending", statusClass: "py", time: "07:30" },
    { id: "#KRY123452", name: "Chansa Mumba", amt: "$899", status: "Completed", statusClass: "pg", time: "06:10" },
  ];

  /*    Top products    */
  const products = [
    { rank: 1, abbr: "IP", name: "iPhone 15 Pro Max", units: "248 units", rev: "$268k", bg: "linear-gradient(135deg,#6366F1,#8B5CF6)", rankColor: ORANGE },
    { rank: 2, abbr: "MB", name: "MacBook Air M2", units: "186 units", rev: "$232k", bg: "linear-gradient(135deg,#0891B2,#06B6D4)" },
    { rank: 3, abbr: "SW", name: "Sony WH-1000XM5", units: "163 units", rev: "$57k", bg: "linear-gradient(135deg,#F97316,#FB923C)" },
    { rank: 4, abbr: "AW", name: "Apple Watch S9", units: "131 units", rev: "$60k", bg: "linear-gradient(135deg,#EC4899,#F43F5E)" },
    { rank: 5, abbr: "SS", name: "Samsung S24 Ultra", units: "128 units", rev: "$144k", bg: "linear-gradient(135deg,#10B981,#34D399)" },
  ];

  /*    Activity data    */
  const activities = [
    { title: "New order #KRY123456", sub: "Bwalya Chileshe · $1,099", dot: ORANGE, time: "2m" },
    { title: "Payment confirmed", sub: "Paystack · $1,099", dot: ACCENT, time: "10m" },
    { title: "Order delivered #KRY123454", sub: "Chansa Mumba", dot: GREEN, time: "25m" },
    { title: "New customer joined", sub: "Mulenga Sichone", dot: YELLOW, time: "1h" },
    { title: "Stock updated", sub: "iPhone 15 Pro Max → 142", dot: PINK, time: "2h" },
  ];

  /*    Customers data    */
  const customers = [
    { name: "Bwalya Chileshe", date: "May 26", badge: "Active", badgeClass: "pg", bg: "linear-gradient(135deg,#3B82F6,#6366F1)", initial: "B" },
    { name: "Mulenga Sichone", date: "May 26", badge: "Active", badgeClass: "pg", bg: "linear-gradient(135deg,#F97316,#EC4899)", initial: "M" },
    { name: "Chansa Mumba", date: "May 25", badge: "Active", badgeClass: "pg", bg: "linear-gradient(135deg,#10B981,#6366F1)", initial: "C" },
    { name: "Chanda Kapwepwe", date: "May 25", badge: "New", badgeClass: "pb", bg: "linear-gradient(135deg,#F59E0B,#F97316)", initial: "C", textColor: "#0a0a0a" },
    { name: "Mwila Tembo", date: "May 25", badge: "New", badgeClass: "pb", bg: "linear-gradient(135deg,#06B6D4,#10B981)", initial: "M" },
  ];

  /*    Quick actions    */
  const quickActions = [
    { label: "New Invoice", bg: "#FFF7ED", color: ORANGE, ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> },
    { label: "New Estimate", bg: "#EEF2FF", color: ACCENT, ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
    { label: "New Payment", bg: "#ECFDF5", color: GREEN, ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
    { label: "Add Product", bg: "#FFF7ED", color: ORANGE, ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg> },
    { label: "New Purchase", bg: "#EEF2FF", color: ACCENT, ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/></svg> },
    { label: "New Customer", bg: "#F0FDF4", color: "#16A34A", ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
    { label: "View Reports", bg: "#EFF6FF", color: "#3B82F6", ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
    { label: "Settings", bg: "#F8FAFC", color: "#64748B", ico: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 20.1 8"/></svg> },
  ];

  if (!mounted) return null;

  return (
    <div style={{ padding: "20px 20px 40px", color: "#111827", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, gap: 10, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>Good morning, Admin 👋</div>
          <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 3 }}>May 20 – May 26, 2025 · Here&apos;s your store performance</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "8px 14px", borderRadius: 9, fontSize: 11.5, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", border: "1px solid #E5E7EB",
            whiteSpace: "nowrap", background: "#fff", color: "#4B5563",
          }}>
            <span style={{ width: 12, height: 12 }}><IconExport /></span>Export
          </button>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "8px 14px", borderRadius: 9, fontSize: 11.5, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit", border: "none",
            whiteSpace: "nowrap", background: `linear-gradient(135deg,${ORANGE},${PINK})`, color: "#fff",
          }}>
            <span style={{ width: 12, height: 12 }}><IconPlus /></span>New Order
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }} className="stat-grid">
        {stats.map((s, i) => (
          <div key={i} style={{
            borderRadius: 14, padding: "16px 18px", minHeight: 120,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            position: "relative", overflow: "hidden", cursor: "pointer",
            transition: "transform .18s,box-shadow .18s",
            background: s.grad, color: "#fff",
          }} className="sc" onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.12)"; }} onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".07em", opacity: .7 }}>{s.label}</div>
            <div style={{
              width: 32, height: 32, borderRadius: 9,
              background: s.icoBg || "rgba(255,255,255,.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "absolute", right: 14, top: 14,
            }}>
              <span style={{ width: 14, height: 14, color: s.icoStroke || "#fff" }}><s.ico /></span>
            </div>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-.5px", lineHeight: 1, margin: "10px 0 4px" }}>{s.val}</div>
              <div style={{ fontSize: 10.5, fontWeight: 600, opacity: .8, color: s.chgColor || "#fff" }}>{s.chg}</div>
            </div>
            <svg style={{ position: "absolute", bottom: 0, right: 0, width: 76, height: 40, opacity: .2 }} viewBox="0 0 76 40" preserveAspectRatio="none">
              <path d={s.spark} fill="none" stroke={s.icoStroke || "#fff"} strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        ))}
      </div>

      {/* Chart + Donut */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 12, marginBottom: 12 }} className="g2">
        {/* Revenue Chart */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #E5E7EB" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Revenue Overview</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>May 20 – May 26, 2025</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, justifyContent: "flex-end" }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: "#111827", letterSpacing: "-.3px" }}>$10,280</span>
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: "#ECFDF5", color: "#059669" }}>↑ 14.3%</span>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 5, justifyContent: "flex-end" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "#9CA3AF" }}><div style={{ width: 8, height: 3, borderRadius: 2, background: ORANGE }} />Revenue</div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: "#9CA3AF" }}><div style={{ width: 8, height: 0, borderTop: "2px dashed #8B5CF6", marginTop: 1 }} />Orders</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "14px 18px 16px" }}>
            <svg style={{ width: "100%", height: 150, display: "block" }} viewBox="0 0 540 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ORANGE} stopOpacity=".2"/>
                  <stop offset="100%" stopColor={ORANGE} stopOpacity="0"/>
                </linearGradient>
              </defs>
              <line x1="0" y1="30" x2="540" y2="30" stroke="#F3F4F6" strokeWidth="1"/>
              <line x1="0" y1="60" x2="540" y2="60" stroke="#F3F4F6" strokeWidth="1"/>
              <line x1="0" y1="90" x2="540" y2="90" stroke="#F3F4F6" strokeWidth="1"/>
              <line x1="0" y1="120" x2="540" y2="120" stroke="#F3F4F6" strokeWidth="1"/>
              <path d="M0,112 C60,100 100,75 160,85 C220,95 270,48 330,62 C390,76 435,28 540,16 L540,150 L0,150 Z" fill="url(#cg1)"/>
              <path d="M0,112 C60,100 100,75 160,85 C220,95 270,48 330,62 C390,76 435,28 540,16" fill="none" stroke={ORANGE} strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="330" cy="62" r="4" fill={ORANGE} stroke="#fff" strokeWidth="2"/>
              <circle cx="435" cy="28" r="5" fill={ORANGE} stroke="#fff" strokeWidth="2.5"/>
              <rect x="412" y="8" width="48" height="17" rx="5" fill={ORANGE}/>
              <text x="436" y="20" textAnchor="middle" fill="white" fontSize="8.5" fontWeight="700" fontFamily="Inter,sans-serif">$2,680</text>
              <path d="M0,130 C70,126 120,108 180,115 C240,122 290,96 350,102 C410,108 460,78 540,70" fill="none" stroke={VIOLET} strokeWidth="2" strokeLinecap="round" strokeDasharray="5 3"/>
              <text x="0" y="148" fill="#9CA3AF" fontSize="8.5" fontFamily="Inter,sans-serif">May 20</text>
              <text x="74" y="148" fill="#9CA3AF" fontSize="8.5" fontFamily="Inter,sans-serif">May 21</text>
              <text x="154" y="148" fill="#9CA3AF" fontSize="8.5" fontFamily="Inter,sans-serif">May 22</text>
              <text x="234" y="148" fill="#9CA3AF" fontSize="8.5" fontFamily="Inter,sans-serif">May 23</text>
              <text x="314" y="148" fill="#9CA3AF" fontSize="8.5" fontFamily="Inter,sans-serif">May 24</text>
              <text x="392" y="148" fill="#9CA3AF" fontSize="8.5" fontFamily="Inter,sans-serif">May 25</text>
              <text x="472" y="148" fill="#9CA3AF" fontSize="8.5" fontFamily="Inter,sans-serif">May 26</text>
            </svg>
          </div>
        </div>

        {/* Donut */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #E5E7EB" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Order Status</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>This month</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 18px 16px" }}>
            <svg width="130" height="130" viewBox="0 0 130 130">
              <circle cx="65" cy="65" r="46" fill="none" stroke="#F3F4F6" strokeWidth="14"/>
              <circle cx="65" cy="65" r="46" fill="none" stroke={ORANGE} strokeWidth="14" strokeDasharray="289" strokeDashoffset="95" transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="46" fill="none" stroke={VIOLET} strokeWidth="14" strokeDasharray="58 231" strokeDashoffset="153" transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="46" fill="none" stroke={YELLOW} strokeWidth="14" strokeDasharray="29 260" strokeDashoffset="182" transform="rotate(-90 65 65)"/>
              <circle cx="65" cy="65" r="46" fill="none" stroke={PINK} strokeWidth="14" strokeDasharray="11 278" strokeDashoffset="211" transform="rotate(-90 65 65)"/>
              <text x="65" y="60" textAnchor="middle" fill="#111827" fontSize="20" fontWeight="800" fontFamily="Inter,sans-serif">67%</text>
              <text x="65" y="74" textAnchor="middle" fill="#9CA3AF" fontSize="9" fontFamily="Inter,sans-serif">Completion</text>
            </svg>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {[
                { c: ORANGE, l: "Completed", v: "68", p: "67%" },
                { c: VIOLET, l: "Processing", v: "20", p: "20%" },
                { c: YELLOW, l: "Pending", v: "10", p: "10%" },
                { c: PINK, l: "Cancelled", v: "4", p: "3%" },
              ].map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 9, height: 9, borderRadius: 3, background: d.c, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 11.5, color: "#4B5563" }}>{d.l}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#111827" }}>{d.v}</span>
                  <span style={{ fontSize: 10.5, color: "#9CA3AF" }}>{d.p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ background: "#fff", borderRadius: "14px 14px 0 0", border: "1px solid #E5E7EB", borderBottom: "none" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Quick Actions</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Jump to common tasks</div>
            </div>
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: "0 0 14px 14px", border: "1px solid #E5E7EB", borderTop: "none", padding: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }} className="qa-grid">
            {quickActions.map((qa, i) => (
              <div key={i} style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: 10, padding: "20px 10px", background: "#fff", borderRadius: 14,
                border: "1.5px solid #E5E7EB", cursor: "pointer", transition: "all .15s",
                textAlign: "center", minHeight: 100,
              }} onMouseEnter={e => { e.currentTarget.style.borderColor = ACCENT; e.currentTarget.style.background = "#EEF2FF"; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "none"; }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: qa.bg, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ width: 20, height: 20, color: qa.color }}>{qa.ico}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#4B5563", lineHeight: 1.3 }}>{qa.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #E5E7EB" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Recent Orders</div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Today</div>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT, padding: "3px 10px", border: "1px solid #E0E7FF", borderRadius: 99, cursor: "pointer" }}>View all →</span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Order ID", "Customer", "Amount", "Status", "Time"].map((h, i) => (
                  <th key={i} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "#9CA3AF", padding: "9px 18px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={i} style={{ transition: "background .12s" }} onMouseEnter={e => { e.currentTarget.style.background = "#FAFBFF"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                  <td style={{ padding: "10px 18px", borderTop: "1px solid #E5E7EB", fontSize: 11.5, color: "#4B5563" }}><span style={{ fontFamily: "monospace", fontSize: 10.5, color: "#9CA3AF" }}>{o.id}</span></td>
                  <td style={{ padding: "10px 18px", borderTop: "1px solid #E5E7EB", fontSize: 11.5, color: "#111827", fontWeight: 600 }}>{o.name}</td>
                  <td style={{ padding: "10px 18px", borderTop: "1px solid #E5E7EB", fontSize: 11.5, color: "#111827", fontWeight: 700 }}>{o.amt}</td>
                  <td style={{ padding: "10px 18px", borderTop: "1px solid #E5E7EB" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 99,
                      fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
                      background: o.statusClass === "pg" ? "#ECFDF5" : o.statusClass === "pb" ? "#EEF2FF" : o.statusClass === "py" ? "#FFFBEB" : "#FFF1F2",
                      color: o.statusClass === "pg" ? "#059669" : o.statusClass === "pb" ? "#4F46E5" : o.statusClass === "py" ? "#B45309" : "#BE123C",
                    }}>{o.status}</span>
                  </td>
                  <td style={{ padding: "10px 18px", borderTop: "1px solid #E5E7EB", fontSize: 11.5, color: "#4B5563" }}>{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products + Activity + Customers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 12 }} className="g3">
        {/* Top Products */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #E5E7EB" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Top Products</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>By revenue</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT, padding: "3px 10px", border: "1px solid #E0E7FF", borderRadius: 99, cursor: "pointer" }}>All →</span>
          </div>
          {products.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", borderTop: i === 0 ? "none" : "1px solid #E5E7EB", transition: "background .12s" }} onMouseEnter={e => { e.currentTarget.style.background = "#FAFBFF"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <span style={{ width: 18, textAlign: "center", fontSize: 11.5, fontWeight: 700, color: p.rankColor || "#9CA3AF", flexShrink: 0 }}>{p.rank}</span>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10.5, fontWeight: 800, color: "#fff" }}>{p.abbr}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
                <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{p.units}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{p.rev}</div>
            </div>
          ))}
        </div>

        {/* Live Activity */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #E5E7EB" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Live Activity</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, fontWeight: 700, color: "#10B981" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981", animation: "pulse 2s infinite" }} />
              Live
            </div>
          </div>
          {activities.map((a, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "9px 18px", borderTop: i === 0 ? "none" : "1px solid #E5E7EB" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, marginTop: 4, background: a.dot }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "#111827" }}>{a.title}</div>
                <div style={{ fontSize: 10.5, color: "#9CA3AF", marginTop: 1 }}>{a.sub}</div>
              </div>
              <span style={{ fontSize: 10, color: "#9CA3AF", whiteSpace: "nowrap", flexShrink: 0, paddingTop: 2 }}>{a.time}</span>
            </div>
          ))}
        </div>

        {/* New Customers */}
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderBottom: "1px solid #E5E7EB" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>New Customers</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>Joined recently</div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: ACCENT, padding: "3px 10px", border: "1px solid #E0E7FF", borderRadius: 99, cursor: "pointer" }}>All →</span>
          </div>
          {customers.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 18px", borderTop: i === 0 ? "none" : "1px solid #E5E7EB", transition: "background .12s" }} onMouseEnter={e => { e.currentTarget.style.background = "#FAFBFF"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: c.textColor || "#fff", flexShrink: 0 }}>{c.initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 600, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>{c.date}</div>
              </div>
              <span style={{
                display: "inline-flex", alignItems: "center", padding: "2px 9px", borderRadius: 99,
                fontSize: 10, fontWeight: 700, whiteSpace: "nowrap",
                background: c.badgeClass === "pg" ? "#ECFDF5" : "#EEF2FF",
                color: c.badgeClass === "pg" ? "#059669" : "#4F46E5",
              }}>{c.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 12 }} className="fin">
        {[
          { label: "Outstanding Balance", val: "$0.00", sub: "No outstanding amounts" },
          { label: "Outstanding Payment", val: "$0.00", sub: "No pending payments" },
          { label: "Total Expenses", val: "$0.00", sub: "No expenses logged", valColor: PINK },
          { label: "Net Profit This Month", val: "$3,682", sub: "↑ Best month yet 🔥", highlight: true },
        ].map((f, i) => (
          <div key={i} style={{
            background: f.highlight ? SIDEBAR_BG : "#fff",
            borderRadius: 14, border: f.highlight ? `1px solid ${SIDEBAR_BG}` : "1px solid #E5E7EB",
            padding: "14px 16px",
          }}>
            <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: f.highlight ? "rgba(255,255,255,.3)" : "#9CA3AF", marginBottom: 4 }}>{f.label}</div>
            <div style={{ fontSize: 19, fontWeight: 800, color: f.highlight ? "#fff" : f.valColor || "#111827", letterSpacing: "-.3px" }}>{f.val}</div>
            <div style={{ fontSize: 10.5, color: f.highlight ? "rgba(249,115,22,.8)" : "#9CA3AF", marginTop: 2 }}>{f.sub}</div>
          </div>
        ))}
      </div>

      {/* pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .3; }
        }
        @media (max-width: 1100px) {
          .g2 { grid-template-columns: 1fr !important; }
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .fin { grid-template-columns: 1fr 1fr !important; }
          .g3 { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 860px) {
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .fin { grid-template-columns: 1fr 1fr !important; }
          .g3 { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .sc { min-height: 110px !important; }
          .qa-grid { grid-template-columns: repeat(4, 1fr) !important; gap: 7px !important; }
          .fin { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
