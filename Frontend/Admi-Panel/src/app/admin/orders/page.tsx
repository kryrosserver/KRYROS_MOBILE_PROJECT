"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/utils";
import {
  Search, Filter, RefreshCw, ExternalLink, ChevronRight,
  Clock, CheckCircle, Package, X, ChevronDown,
  Bell, Calendar, Sun, Moon, Menu, Download, MoreHorizontal,
  Plus, ShoppingCart, TrendingUp, TrendingDown, Eye,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "@/providers/ThemeProvider";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const ACCENT = "#12D6C5";

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

function MiniSparkline({ color = ACCENT, up = true }: { color?: string; up?: boolean }) {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sgo${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sgo${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function OrdersPage() {

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  const { isDark, toggleTheme } = useTheme();

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";


  const toggleSelect = (id: string) => {
    setSelectedOrders(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) setSelectedOrders([]);
    else setSelectedOrders(filteredOrders.map(o => o.id));
  };

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdating(null);
    }
  };

  const bulkUpdateStatus = async (status: string) => {
    if (!selectedOrders.length) return;
    setLoading(true);
    try {
      await Promise.all(
        selectedOrders.map(id =>
          fetch(`/api/admin/orders/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          })
        )
      );
      setSelectedOrders([]);
      await load();
    } catch (e: any) {
      alert("Bulk update failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = orders.filter(o => {
    const matchesSearch = !searchTerm || o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || o.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (res.status === 503) throw new Error(body?.message || "The backend server is starting up. Please wait a moment and click Refresh.");
      if (!res.ok) throw new Error(body?.error || `Server error ${res.status} — please try refreshing.`);
      const items = Array.isArray(body) ? body : body?.items || body?.data || [];
      setOrders(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.user?.email || o.shippingAddress?.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.user?.firstName || o.shippingAddress?.firstName || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pendingCount = orders.filter(o => o.status === "PENDING").length;
  const processingCount = orders.filter(o => o.status === "PROCESSING" || o.status === "CONFIRMED").length;
  const deliveredCount = orders.filter(o => o.status === "DELIVERED").length;
  const cancelledCount = orders.filter(o => o.status === "CANCELLED").length;

  const statusBadgeStyle = (s: string) => {
    const map: Record<string, [string, string]> = {
      PENDING: ["#F59E0B", "rgba(245,158,11,0.14)"],
      CONFIRMED: [ACCENT, "rgba(18,214,197,0.14)"],
      PROCESSING: ["#3B82F6", "rgba(59,130,246,0.14)"],
      SHIPPED: ["#8B5CF6", "rgba(139,92,246,0.14)"],
      DELIVERED: ["#22C55E", "rgba(34,197,94,0.14)"],
      CANCELLED: ["#EF4444", "rgba(239,68,68,0.14)"],
    };
    const [color, bg] = map[s] || ["#6B7280", "rgba(107,114,128,0.14)"];
    return { color, background: bg, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 };
  };

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  const statCards = [
    { label: "Total Orders", value: orders.length, change: "+12.4%", up: true, color: ACCENT, icon: ShoppingCart },
    { label: "Total Revenue", value: formatPrice(totalRevenue), change: "+18.6%", up: true, color: "#22C55E", icon: TrendingUp },
    { label: "Pending", value: pendingCount, change: "+3.1%", up: false, color: "#F59E0B", icon: Clock },
    { label: "Delivered", value: deliveredCount, change: "+8.3%", up: true, color: "#3B82F6", icon: CheckCircle },
    { label: "Cancelled", value: cancelledCount, change: "-2.1%", up: false, color: "#EF4444", icon: X },
  ];

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Orders</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>{orders.length} orders</p>
        </div>
      </div>
      {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 16 }}>{error}</div>}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", width: 15, height: 15 }} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search orders..."
            style={{ width: "100%", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px 9px 36px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", color: "#374151", fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <th style={{ padding: "11px 16px" }}><input type="checkbox" onChange={toggleSelectAll} checked={selectedOrders.length > 0 && selectedOrders.length === orders.length} /></th>
                {["Order", "Customer", "Total", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}><div style={{ height: 14, borderRadius: 6, background: "#F3F4F6", width: j === 0 ? 20 : j === 1 ? 100 : 80 }} /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No orders found.</td></tr>
              ) : filtered.map((o, idx) => (
                <tr key={o.id} style={{ borderBottom: "1px solid #F3F4F6", background: selectedOrders.includes(o.id) ? "#EEF2FF" : idx % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "12px 16px" }}><input type="checkbox" checked={selectedOrders.includes(o.id)} onChange={() => toggleSelect(o.id)} /></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontWeight: 600, color: "#111827" }}>#{o.orderNumber || o.id}</div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6B7280" }}>{o.user?.firstName || o.user?.lastName ? `${o.user.firstName} ${o.user.lastName}` : o.shippingAddress?.firstName ? `${o.shippingAddress.firstName} ${o.shippingAddress.lastName || ""}` : "—"}</td>
                  <td style={{ padding: "12px 16px", fontWeight: 600, color: "#111827" }}>${(o.total || 0).toFixed(2)}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: o.status === "DELIVERED" ? "#D1FAE5" : o.status === "CANCELLED" ? "#FEE2E2" : o.status === "SHIPPED" ? "#DBEAFE" : "#FEF3C7", color: o.status === "DELIVERED" ? "#065F46" : o.status === "CANCELLED" ? "#991B1B" : o.status === "SHIPPED" ? "#1E40AF" : "#92400E" }}>{o.status}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: 12 }}>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Link href={`/admin/orders/${o.id}`} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 7, padding: "5px 10px", color: "#4338CA", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
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
