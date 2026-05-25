"use client";

import { useEffect, useRef, useState } from "react";
import {
  RefreshCw, Search, ChevronDown, ArrowLeft, Clock, Package,
  FileText, User, MapPin, CreditCard, ChevronRight, Filter, Box,
  Bell, Calendar, Sun, Moon, Menu,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 960;
const DESKTOP_BASE = 1380;

type OrderItem = {
  id: string;
  quantity: number;
  price: number;
  total: number;
  product: { name: string; images?: { url: string }[] };
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  notes: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string; phone?: string };
  shippingAddress?: {
    firstName: string; lastName: string; email: string; phone: string;
    street: string; cityName?: string; stateName?: string; country: string; manual: boolean;
  };
  items: OrderItem[];
  logs?: { id: string; status: string; notes: string; createdAt: string }[];
};

const STATUS_STEPS = [
  "Order Placed",
  "Payment Confirmed",
  "Order Confirmed",
  "Order Processing",
  "Order Shipped",
  "Order Delivered",
];

const STATUS_MAP: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const PAYMENT_STATUS_MAP: Record<string, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

function getStepState(step: string, order: Order): "completed" | "failed" | "pending" {
  const s = order.status;
  const ps = order.paymentStatus;
  if (step === "Order Placed") return "completed";
  if (step === "Payment Confirmed") {
    if (ps === "PAID") return "completed";
    if (ps === "FAILED") return "failed";
    return "pending";
  }
  const order2 = ["Order Confirmed", "Order Processing", "Order Shipped", "Order Delivered"];
  const statusOrder = ["CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];
  const idx = order2.indexOf(step);
  const curIdx = statusOrder.indexOf(s);
  if (idx !== -1 && curIdx >= idx) return "completed";
  if (s === "CANCELLED" && idx !== -1) return "failed";
  return "pending";
}

const stepColor: Record<string, string> = {
  completed: "#22C55E",
  failed: "#EF4444",
  pending: "#6B7280",
};
const stepBg: Record<string, string> = {
  completed: "rgba(34,197,94,0.14)",
  failed: "rgba(239,68,68,0.14)",
  pending: "rgba(107,114,128,0.14)",
};

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const [order, setOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [sideSearch, setSideSearch] = useState("");
  const [sideStatus, setSideStatus] = useState("ALL");

  const { isDark, toggleTheme } = useTheme();

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";
  const HOVER = "var(--hover-bg)";

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
  }, [order]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`);
      const data = await res.json();
      if (res.ok) setOrder(data);
    } catch {}
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders", { cache: "no-store" });
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data?.data || [];
      setOrders(arr);
    } catch {}
  };

  useEffect(() => {
    fetchOrder();
    fetchOrders();
  }, [id]);

  const updateOrder = async (status: string, paymentStatus?: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
      });
      await fetchOrder();
    } catch {}
    setUpdating(false);
  };

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

  const filteredOrders = orders.filter(o => {
    const name = `${o.orderNumber} ${o.user?.firstName || ""} ${o.user?.lastName || ""} ${o.user?.email || ""}`.toLowerCase();
    const matchSearch = !sideSearch || name.includes(sideSearch.toLowerCase());
    const matchStatus = sideStatus === "ALL" || o.status === sideStatus;
    return matchSearch && matchStatus;
  });

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12 };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column" }}>

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
          </div>

          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search orders by ID, customer, email..." style={{
              width: "100%", background: CARD, border: `1px solid ${BORDER}`,
              borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none",
            }} />
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

        {/* ── BODY: 3 columns ── */}
        <div style={{ display: "flex", gap: 0, minHeight: "100vh" }}>

          {/* LEFT: Orders list panel */}
          <div style={{ width: 224, flexShrink: 0, background: CARD, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 12px", borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: TEXT2, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>Orders Management</div>

              <button
                onClick={() => { fetchOrders(); fetchOrder(); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 12px", color: TEXT2, fontSize: 12, cursor: "pointer", marginBottom: 8 }}>
                <RefreshCw style={{ width: 13, height: 13 }} />
                Refresh
              </button>

              <div style={{ position: "relative", marginBottom: 8 }}>
                <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: TEXT2 }} />
                <input
                  value={sideSearch}
                  onChange={e => setSideSearch(e.target.value)}
                  placeholder="Search orders..."
                  style={{ width: "100%", background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "7px 10px 7px 28px", color: TEXT, fontSize: 12, outline: "none" }}
                />
              </div>

              <div style={{ position: "relative" }}>
                <Filter style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: TEXT2 }} />
                <select
                  value={sideStatus}
                  onChange={e => setSideStatus(e.target.value)}
                  style={{ width: "100%", background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "7px 26px 7px 28px", color: TEXT2, fontSize: 12, outline: "none", appearance: "none" }}>
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <ChevronDown style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: TEXT2, pointerEvents: "none" }} />
              </div>
            </div>

            {/* Order cards */}
            <div style={{ flex: 1, overflowY: "auto" }}>
              {filteredOrders.length === 0 ? (
                <div style={{ padding: 16, color: TEXT2, fontSize: 12, textAlign: "center" }}>No orders found</div>
              ) : filteredOrders.map(o => {
                const isActive = o.id === id;
                const customer = o.user ? `${o.user.firstName} ${o.user.lastName}` : "Guest";
                return (
                  <Link key={o.id} href={`/admin/orders/${o.id}`}
                    style={{ display: "block", padding: "12px 12px", borderBottom: `1px solid ${BORDER}`, background: isActive ? `${ACCENT}10` : "transparent", textDecoration: "none", borderLeft: isActive ? `3px solid ${ACCENT}` : "3px solid transparent" }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = HOVER; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: TEXT, fontFamily: "monospace" }}>{o.orderNumber}</span>
                      <span style={{ ...statusBadgeStyle(o.status), fontSize: 9, padding: "2px 7px" }}>{STATUS_MAP[o.status] || o.status}</span>
                    </div>
                    <div style={{ fontSize: 11, color: TEXT2, marginBottom: 2 }}>{customer}</div>
                    <div style={{ fontSize: 10, color: "var(--text-muted)", marginBottom: 8 }}>{new Date(o.createdAt).toLocaleDateString()}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: TEXT }}>{formatPrice(o.total)}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, display: "flex", alignItems: "center", gap: 2 }}>
                        View <ChevronRight style={{ width: 10, height: 10 }} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* CENTER: Order detail */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 0 }}>

            {/* Page header */}
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", background: HEADER_BG }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: TEXT, margin: 0 }}>Order Details</h1>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, fontSize: 12, color: TEXT2 }}>
                  <Link href="/admin" style={{ color: TEXT2, textDecoration: "none" }}>Home</Link>
                  <ChevronRight style={{ width: 12, height: 12 }} />
                  <Link href="/admin/orders" style={{ color: TEXT2, textDecoration: "none" }}>Orders</Link>
                  <ChevronRight style={{ width: 12, height: 12 }} />
                  <span style={{ color: ACCENT }}>Order Details</span>
                </div>
              </div>
              <Link href="/admin/orders" style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", color: TEXT2, fontSize: 13, textDecoration: "none" }}>
                <ArrowLeft style={{ width: 14, height: 14 }} />
                Back to Orders
              </Link>
            </div>

            <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14 }}>
              {loading || !order ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48, color: TEXT2 }}>
                  Loading order details...
                </div>
              ) : (
                <>
                  {/* Management Actions + Price Summary — side by side */}
                  <div style={{ display: "flex", gap: 14 }}>
                    {/* Management Actions */}
                    <div style={{ ...card, padding: 18, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <Clock style={{ width: 16, height: 16, color: ACCENT }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Management Actions</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        <div>
                          <label style={{ fontSize: 10, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Order Status</label>
                          <div style={{ position: "relative" }}>
                            <select
                              value={order.status}
                              onChange={e => updateOrder(e.target.value, order.paymentStatus)}
                              disabled={updating}
                              style={{ width: "100%", background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 32px 9px 12px", color: TEXT, fontSize: 13, outline: "none", appearance: "none", cursor: "pointer" }}>
                              {Object.entries(STATUS_MAP).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: TEXT2, pointerEvents: "none" }} />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 10, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>Payment Status</label>
                          <div style={{ position: "relative" }}>
                            <select
                              value={order.paymentStatus}
                              onChange={e => updateOrder(order.status, e.target.value)}
                              disabled={updating}
                              style={{ width: "100%", background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "9px 32px 9px 12px", color: TEXT, fontSize: 13, outline: "none", appearance: "none", cursor: "pointer" }}>
                              {Object.entries(PAYMENT_STATUS_MAP).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                            </select>
                            <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: TEXT2, pointerEvents: "none" }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Price Summary */}
                    <div style={{ ...card, padding: 18, minWidth: 200 }}>
                      {[
                        { label: "Subtotal", value: order.subtotal },
                        { label: "Shipping", value: order.shipping },
                        { label: "Tax", value: order.tax },
                      ].map(r => (
                        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                          <span style={{ fontSize: 13, color: TEXT2 }}>{r.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{formatPrice(r.value)}</span>
                        </div>
                      ))}
                      <div style={{ height: 1, background: BORDER, margin: "10px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>Total</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ ...card, overflow: "hidden" }}>
                    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
                      <Package style={{ width: 15, height: 15, color: TEXT2 }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Order Items</span>
                    </div>
                    <div style={{ padding: "0 18px" }}>
                      {order.items && order.items.length > 0 ? order.items.map(item => (
                        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${BORDER}` }}>
                          <div style={{ width: 40, height: 40, borderRadius: 8, background: ICON_BG, flexShrink: 0, overflow: "hidden" }}>
                            {item.product.images?.[0] && <img src={item.product.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product.name}</div>
                            <div style={{ fontSize: 11, color: TEXT2 }}>{item.quantity} × {formatPrice(item.price)}</div>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{formatPrice(item.total)}</div>
                        </div>
                      )) : null}
                    </div>
                    <div style={{ padding: "12px 18px" }}>
                      {[
                        { label: "Subtotal", value: order.subtotal },
                        { label: "Shipping", value: order.shipping },
                        { label: "Tax", value: order.tax },
                      ].map(r => (
                        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 13, color: TEXT2 }}>{r.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{formatPrice(r.value)}</span>
                        </div>
                      ))}
                      <div style={{ height: 1, background: BORDER, margin: "8px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>Total</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div style={{ ...card, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <Clock style={{ width: 15, height: 15, color: ACCENT }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Order Timeline</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {STATUS_STEPS.map((step, i) => {
                        const state = getStepState(step, order);
                        const logEntry = order.logs?.find(l => l.status.toLowerCase().includes(step.toLowerCase().split(" ")[1]));
                        const isLast = i === STATUS_STEPS.length - 1;
                        return (
                          <div key={step} style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingBottom: isLast ? 0 : 18, position: "relative" }}>
                            {/* Dot + line */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 16 }}>
                              <div style={{ width: 14, height: 14, borderRadius: "50%", background: stepColor[state], flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                                {state === "completed" && <span style={{ color: "#fff", fontSize: 8, fontWeight: 700 }}>✓</span>}
                                {state === "failed" && <span style={{ color: "#fff", fontSize: 8, fontWeight: 700 }}>✕</span>}
                              </div>
                              {!isLast && <div style={{ width: 2, flex: 1, background: state === "completed" ? stepColor[state] + "50" : BORDER, minHeight: 18, marginTop: 3 }} />}
                            </div>
                            {/* Content */}
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, color: state === "pending" ? TEXT2 : TEXT }}>{step}</div>
                                {logEntry ? (
                                  <div style={{ fontSize: 11, color: TEXT2, marginTop: 2 }}>{new Date(logEntry.createdAt).toLocaleString()}</div>
                                ) : (
                                  state !== "pending" && order.createdAt ? (
                                    <div style={{ fontSize: 11, color: TEXT2, marginTop: 2 }}>{new Date(order.createdAt).toLocaleString()}</div>
                                  ) : <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>—</div>
                                )}
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 700, color: stepColor[state], background: stepBg[state], padding: "3px 10px", borderRadius: 20, flexShrink: 0, marginLeft: 12 }}>
                                {state === "completed" ? "Completed" : state === "failed" ? "Failed" : "Pending"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div style={{ width: 280, flexShrink: 0, borderLeft: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", gap: 0 }}>
            {order && (
              <>
                {/* Order Notes */}
                <div style={{ padding: 18, borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <FileText style={{ width: 15, height: 15, color: TEXT2 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Order Notes</span>
                  </div>
                  <div style={{ background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: order.notes ? TEXT : TEXT2, fontStyle: order.notes ? "normal" : "italic", minHeight: 60 }}>
                    {order.notes || "No notes provided."}
                  </div>
                </div>

                {/* Package Notes */}
                <div style={{ padding: 18, borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <Box style={{ width: 15, height: 15, color: TEXT2 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Order Notes</span>
                  </div>
                  <div style={{ background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: order.notes ? TEXT : TEXT2, fontStyle: order.notes ? "normal" : "italic", minHeight: 60 }}>
                    {order.notes || "No notes provided."}
                  </div>
                </div>

                {/* Customer Details */}
                <div style={{ padding: 18, borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <User style={{ width: 15, height: 15, color: TEXT2 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Customer Details</span>
                  </div>
                  {order.user ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{order.user.firstName} {order.user.lastName}</div>
                      <div style={{ fontSize: 12, color: TEXT2 }}>{order.user.email}</div>
                      {order.user.phone && <div style={{ fontSize: 12, color: TEXT2 }}>{order.user.phone}</div>}
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 6 }}>
                        {order.shippingAddress ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : "Unknown"}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, background: `${ACCENT}18`, padding: "3px 10px", borderRadius: 6 }}>Guest Order</span>
                    </div>
                  )}
                </div>

                {/* Shipping Address */}
                <div style={{ padding: 18, borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <MapPin style={{ width: 15, height: 15, color: TEXT2 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Shipping Address</span>
                  </div>
                  {order.shippingAddress ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: TEXT2 }}>
                      <div style={{ fontWeight: 600, color: TEXT }}>{order.shippingAddress.street}</div>
                      <div>{order.shippingAddress.cityName}{order.shippingAddress.stateName ? `, ${order.shippingAddress.stateName}` : ""}</div>
                      <div>{order.shippingAddress.country}</div>
                      <div style={{ marginTop: 4, fontWeight: 700, color: TEXT }}>{order.shippingAddress.phone}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: TEXT2 }}>No address provided</div>
                  )}
                </div>

                {/* Payment Info */}
                <div style={{ padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <CreditCard style={{ width: 15, height: 15, color: TEXT2 }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Payment Info</span>
                  </div>
                  {order.paymentMethod ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{order.paymentMethod}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: order.paymentStatus === "PAID" ? "#22C55E" : order.paymentStatus === "FAILED" ? "#EF4444" : "#F59E0B", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: TEXT2 }}>{PAYMENT_STATUS_MAP[order.paymentStatus] || order.paymentStatus}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: TEXT2 }}>No payment information available</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
