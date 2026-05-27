"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import {
  Search, RefreshCw, Clock, CheckCircle, X,
  ShoppingCart, TrendingUp, Eye,
} from "lucide-react";
import Link from "next/link";

const ACCENT = "#6366F1";

type Order = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
  shippingAddress?: { firstName: string; lastName: string; email: string };
};

const STATUS_MAP: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);


  const toggleSelect = (id: string) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) setSelectedOrders([]);
    else setSelectedOrders(filteredOrders.map(o => o.id));
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/internal/admin/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await load();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/internal/admin/orders?limit=200", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (res.status === 503) throw new Error(body?.message || "Backend starting up — wait 15 s then Refresh.");
      if (!res.ok) throw new Error(body?.error || `Server error ${res.status}`);
      const items = Array.isArray(body) ? body : body?.items || body?.data || body?.orders || [];
      setOrders(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredOrders = orders.filter(o => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q
      || (o.orderNumber || "").toLowerCase().includes(q)
      || (o.user?.firstName || "").toLowerCase().includes(q)
      || (o.user?.email || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingCount   = orders.filter(o => o.status === "PENDING").length;
  const deliveredCount = orders.filter(o => o.status === "DELIVERED").length;
  const cancelledCount = orders.filter(o => o.status === "CANCELLED").length;

  const statusBadgeStyle = (s: string) => {
    const map: Record<string, [string, string]> = {
      PENDING:    ["#F59E0B", "rgba(245,158,11,0.14)"],
      CONFIRMED:  [ACCENT,    "rgba(99,102,241,0.14)"],
      PROCESSING: ["#3B82F6", "rgba(59,130,246,0.14)"],
      SHIPPED:    ["#8B5CF6", "rgba(139,92,246,0.14)"],
      DELIVERED:  ["#22C55E", "rgba(34,197,94,0.14)"],
      CANCELLED:  ["#EF4444", "rgba(239,68,68,0.14)"],
    };
    const [color, bg] = map[s] || ["#6B7280", "rgba(107,114,128,0.14)"];
    return { color, background: bg, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 };
  };

  const statCards = [
    { label: "Total Orders",   value: orders.length,           change: "+12.4%", up: true,  color: ACCENT,     icon: ShoppingCart },
    { label: "Total Revenue",  value: formatPrice(totalRevenue), change: "+18.6%", up: true,  color: "#22C55E",  icon: TrendingUp   },
    { label: "Pending",        value: pendingCount,              change: "+3.1%",  up: false, color: "#F59E0B",  icon: Clock        },
    { label: "Delivered",      value: deliveredCount,            change: "+8.3%",  up: true,  color: "#3B82F6",  icon: CheckCircle  },
    { label: "Cancelled",      value: cancelledCount,            change: "-2.1%",  up: false, color: "#EF4444",  icon: X            },
  ];

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: "20px 24px 40px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Orders</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>{orders.length} total orders</p>
        </div>
        <button onClick={() => load()}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 16px", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
          <RefreshCw style={{ width: 14, height: 14 }} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3" style={{ marginBottom: 20 }}>
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 16, height: 16, color: s.color }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.up ? "#16C784" : "#EF4444", background: s.up ? "rgba(22,199,132,0.12)" : "rgba(239,68,68,0.12)", padding: "2px 7px", borderRadius: 20 }}>
                  {s.up ? "↑" : "↓"} {s.change}
                </span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180, maxWidth: 320 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", width: 15, height: 15 }} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search orders..."
            style={{ width: "100%", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px 9px 36px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", color: "#374151", fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="ALL">All Status</option>
          {Object.keys(STATUS_MAP).map(s => <option key={s} value={s}>{STATUS_MAP[s]}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["#", "Order", "Customer", "Total", "Status", "Date", "Action"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, color: "#374151", whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div style={{ height: 14, borderRadius: 6, background: "#F3F4F6", width: j === 1 ? 100 : 60 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No orders found.</td></tr>
              ) : filteredOrders.map((o, idx) => (
                <tr key={o.id} style={{ borderBottom: "1px solid #F3F4F6", background: idx % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "12px 16px", color: "#9CA3AF", fontSize: 12 }}>{idx + 1}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>#{o.orderNumber || o.id?.slice(0, 8)}</td>
                  <td style={{ padding: "12px 16px", color: "#6B7280", whiteSpace: "nowrap" }}>
                    {o.user?.firstName ? `${o.user.firstName} ${o.user.lastName || ""}`.trim() : "—"}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#111827", whiteSpace: "nowrap" }}>${(o.total || 0).toFixed(2)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={statusBadgeStyle(o.status)}>{STATUS_MAP[o.status] || o.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: 12, whiteSpace: "nowrap" }}>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/admin/orders/${o.id}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 7, padding: "5px 10px", color: "#4338CA", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                      <Eye style={{ width: 13, height: 13 }} /> View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
