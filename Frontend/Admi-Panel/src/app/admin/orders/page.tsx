"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/utils";
import {
  Search, Filter, RefreshCw, ExternalLink, ChevronRight,
  Clock, CheckCircle, Package, X, ChevronDown,
  Bell, Calendar, Sun, Moon, Menu, Download, MoreHorizontal,
  Plus, ShoppingCart, TrendingUp, TrendingDown,
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

  useEffect(() => {}, []);

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
    <div style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── TOP HEADER BAR ── */}
        <header style={{
          background: HEADER_BG, borderBottom: `1px solid ${BORDER}`,
          height: 60, display: "flex", alignItems: "center",
          justifyContent: "space-between", padding: "0 24px", gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Menu style={{ width: 20, height: 20 }} />
            </button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Orders Management</h1>
          </div>

          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input
              placeholder="Search orders by ID, customer, email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }}
            />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: ICON_BG, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              {isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 14px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} />
              May 20 – May 26, 2025
              <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320", flexShrink: 0 }}>K</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1 }}>Admin</div>
                <div style={{ fontSize: 10, color: TEXT2, marginTop: 1 }}>Super Admin</div>
              </div>
              <ChevronDown style={{ width: 14, height: 14, color: TEXT2 }} />
            </div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title + actions */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Orders Management</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <Link href="/admin" style={{ color: TEXT2, textDecoration: "none" }}>Home</Link>
                <ChevronRight style={{ width: 13, height: 13 }} />
                <span style={{ color: ACCENT }}>Orders</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Download style={{ width: 15, height: 15 }} /> Export <ChevronDown style={{ width: 13, height: 13 }} />
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

          {/* Stat Cards — full width 5-column grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">>
            {statCards.map((s, i) => (
              <div key={i} style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon style={{ width: 20, height: 20, color: s.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.up ? "#22C55E" : "#EF4444" }}>
                    {s.up ? "▲" : "▼"} {s.change}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: typeof s.value === "string" ? 18 : 26, fontWeight: 800, color: TEXT, lineHeight: 1, marginBottom: 4 }}>{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</div>
                <div style={{ marginTop: 8 }}>
                  <MiniSparkline color={s.color} up={s.up} />
                </div>
              </div>
            ))}
          </div>

          {/* Filters + Bulk Actions */}
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <Filter style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2 }} />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 36px 10px 32px", color: TEXT2, fontSize: 13, outline: "none", appearance: "none", cursor: "pointer" }}>
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2, pointerEvents: "none" }} />
            </div>
            <button
              onClick={load}
              disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 16px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
              <RefreshCw style={{ width: 13, height: 13 }} />
              Refresh
            </button>
            {selectedOrders.length > 0 && (
              <>
                <div style={{ height: 24, width: 1, background: BORDER }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT }}>{selectedOrders.length} Selected</span>
                {["PROCESSING", "SHIPPED", "DELIVERED"].map(s => (
                  <button key={s} onClick={() => bulkUpdateStatus(s)}
                    style={{ background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 12px", color: TEXT2, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    Mark {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
                <button onClick={() => setSelectedOrders([])}
                  style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4, marginLeft: "auto" }}>
                  <X style={{ width: 14, height: 14 }} />
                </button>
              </>
            )}
          </div>

          {/* Table */}
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, background: HOVER }}>
                    <th style={{ padding: "12px 16px", width: 40, textAlign: "left" }}>
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onChange={toggleSelectAll}
                        style={{ accentColor: ACCENT, width: 14, height: 14 }}
                      />
                    </th>
                    {["Order Details", "Customer", "Total", "Status", "Payment", "Action"].map(h => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: h === "Action" ? "right" : "left" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td colSpan={7} style={{ padding: "14px 16px" }}>
                          <div style={{ height: 16, borderRadius: 6, background: HOVER }} />
                        </td>
                      </tr>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 48, textAlign: "center", fontSize: 13, color: TEXT2 }}>
                        <ShoppingCart style={{ width: 36, height: 36, margin: "0 auto 10px", opacity: 0.3 }} />
                        <div>No orders found.</div>
                      </td>
                    </tr>
                  ) : filteredOrders.map(o => {
                    const customerName = (o.user?.firstName || o.shippingAddress?.firstName || "") + " " + (o.user?.lastName || o.shippingAddress?.lastName || "");
                    const customerEmail = o.user?.email || o.shippingAddress?.email || "";
                    const isSelected = selectedOrders.includes(o.id);
                    return (
                      <tr
                        key={o.id}
                        style={{ borderBottom: `1px solid ${BORDER}`, background: isSelected ? `${ACCENT}08` : "transparent" }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = HOVER; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                        <td style={{ padding: "14px 16px" }}>
                          <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(o.id)} style={{ accentColor: ACCENT, width: 14, height: 14 }} />
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, color: TEXT }}>{o.orderNumber}</div>
                          <div style={{ fontSize: 11, color: TEXT2, marginTop: 2 }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customerName.trim() || "Guest"}</div>
                          <div style={{ fontSize: 11, color: TEXT2, marginTop: 2, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{customerEmail}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: 15, fontWeight: 800, color: TEXT }}>{formatPrice(o.total)}</span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={statusBadgeStyle(o.status)}>{STATUS_MAP[o.status] || o.status}</span>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          {o.paymentStatus === "PAID" ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...statusBadgeStyle("DELIVERED") }}>
                              <CheckCircle style={{ width: 11, height: 11 }} /> Paid
                            </span>
                          ) : o.paymentStatus === "FAILED" ? (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...statusBadgeStyle("CANCELLED") }}>Failed</span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...statusBadgeStyle("PENDING") }}>
                              <Clock style={{ width: 11, height: 11 }} /> Pending
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                            {o.status === "CONFIRMED" && (
                              <button onClick={e => { e.preventDefault(); updateStatus(o.id, "PROCESSING"); }} disabled={updating === o.id}
                                title="Mark Processing"
                                style={{ background: "rgba(245,158,11,0.1)", border: "none", borderRadius: 8, padding: 8, color: "#F59E0B", cursor: "pointer" }}>
                                <Package style={{ width: 14, height: 14 }} />
                              </button>
                            )}
                            {o.status === "PROCESSING" && (
                              <button onClick={e => { e.preventDefault(); updateStatus(o.id, "SHIPPED"); }} disabled={updating === o.id}
                                title="Mark Shipped"
                                style={{ background: "rgba(59,130,246,0.1)", border: "none", borderRadius: 8, padding: 8, color: "#3B82F6", cursor: "pointer" }}>
                                <ExternalLink style={{ width: 14, height: 14 }} />
                              </button>
                            )}
                            <Link href={`/admin/orders/${o.id}`}
                              style={{ display: "inline-flex", alignItems: "center", gap: 5, background: ACCENT, color: "#000", borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                              View <ChevronRight style={{ width: 13, height: 13 }} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}