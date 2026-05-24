"use client";

import { useEffect, useRef, useState } from "react";
import { formatPrice } from "@/lib/utils";
import {
  Search, Filter, RefreshCw, ExternalLink, ChevronRight,
  Clock, CheckCircle, Package, X, ChevronDown,
} from "lucide-react";
import Link from "next/link";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 960;
const DESKTOP_BASE = 1380;

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
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) {
      if (!innerRef.current || !outerRef.current) return;
      outerRef.current.style.height = "auto";
      const naturalH = innerRef.current.scrollHeight;
      const visualH = naturalH * s;
      const isMob = window.innerWidth < 1024;
      const avail = isMob ? window.innerHeight - 64 : Infinity;
      outerRef.current.style.height = `${Math.max(visualH, avail)}px`;
    }
    function recalc() {
      if (!innerRef.current || !outerRef.current) return;
      const vw = outerRef.current.offsetWidth || window.innerWidth;
      const baseW = vw < 960 ? MOBILE_BASE : DESKTOP_BASE;
      const s = Math.min(1, vw / baseW);
      innerRef.current.style.width = `${baseW}px`;
      innerRef.current.style.transform = `scale(${s})`;
      innerRef.current.style.transformOrigin = "top left";
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s)));
    }
    recalc();
    const t = setTimeout(recalc, 400);
    window.addEventListener("resize", recalc);
    return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, [orders]);

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
      if (!res.ok) throw new Error(body?.error || "Failed to load orders");
      const items = Array.isArray(body) ? body : body?.data || [];
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

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12 };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Page Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${BORDER}`, background: HEADER_BG, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Orders Management</h1>
            <p style={{ fontSize: 13, color: TEXT2, margin: "4px 0 0" }}>Review, confirm, and process customer orders</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
            <RefreshCw style={{ width: 14, height: 14, ...(loading ? { animation: "spin 1s linear infinite" } : {}) }} />
            Refresh
          </button>
        </div>

        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 14 }}>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444" }}>
              {error}
            </div>
          )}

          {/* Filters */}
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: TEXT2 }} />
              <input
                type="text"
                placeholder="Search orders by ID, customer, email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px 10px 34px", color: TEXT, fontSize: 13, outline: "none" }}
              />
            </div>
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
          </div>

          {/* Bulk Actions */}
          {selectedOrders.length > 0 && (
            <div style={{ background: `${ACCENT}0D`, border: `1px solid ${ACCENT}40`, borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: ACCENT, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {selectedOrders.length} Selected
              </span>
              <div style={{ width: 1, height: 16, background: `${ACCENT}40` }} />
              <div style={{ display: "flex", gap: 8 }}>
                {["PROCESSING", "SHIPPED", "DELIVERED"].map(s => (
                  <button
                    key={s}
                    onClick={() => bulkUpdateStatus(s)}
                    style={{ background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                    Mark {s.charAt(0) + s.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setSelectedOrders([])}
                style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
                <X style={{ width: 14, height: 14 }} />
              </button>
            </div>
          )}

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
                          <div style={{ height: 16, borderRadius: 6, background: HOVER, animation: "pulse 1.5s ease-in-out infinite" }} />
                        </td>
                      </tr>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: 48, textAlign: "center", fontSize: 13, color: TEXT2 }}>
                        No orders found.
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
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(o.id)}
                            style={{ accentColor: ACCENT, width: 14, height: 14 }}
                          />
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
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...statusBadgeStyle("CANCELLED") }}>
                              Failed
                            </span>
                          ) : (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, ...statusBadgeStyle("PENDING") }}>
                              <Clock style={{ width: 11, height: 11 }} /> Pending
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                            {o.status === "CONFIRMED" && (
                              <button
                                onClick={e => { e.preventDefault(); updateStatus(o.id, "PROCESSING"); }}
                                disabled={updating === o.id}
                                title="Mark Processing"
                                style={{ background: "rgba(245,158,11,0.1)", border: "none", borderRadius: 8, padding: 8, color: "#F59E0B", cursor: "pointer" }}>
                                <Package style={{ width: 14, height: 14 }} />
                              </button>
                            )}
                            {o.status === "PROCESSING" && (
                              <button
                                onClick={e => { e.preventDefault(); updateStatus(o.id, "SHIPPED"); }}
                                disabled={updating === o.id}
                                title="Mark Shipped"
                                style={{ background: "rgba(59,130,246,0.1)", border: "none", borderRadius: 8, padding: 8, color: "#3B82F6", cursor: "pointer" }}>
                                <ExternalLink style={{ width: 14, height: 14 }} />
                              </button>
                            )}
                            <Link
                              href={`/admin/orders/${o.id}`}
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
