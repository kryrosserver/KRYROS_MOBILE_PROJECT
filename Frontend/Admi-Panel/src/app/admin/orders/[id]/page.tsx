"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown, ArrowLeft, Clock, Package,
  FileText, User, MapPin, CreditCard, ChevronRight, Box,
  Bell, Calendar, Sun, Moon, Menu, CheckCircle, XCircle,
  Download, MoreHorizontal, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
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
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
      outerRef.current.style.height = `${innerRef.current.scrollHeight * s}px`;
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

  useEffect(() => { fetchOrder(); }, [id]);

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

  const payBadgeStyle = (s: string) => {
    const map: Record<string, [string, string]> = {
      PAID: ["#22C55E", "rgba(34,197,94,0.14)"],
      PENDING: ["#F59E0B", "rgba(245,158,11,0.14)"],
      FAILED: ["#EF4444", "rgba(239,68,68,0.14)"],
      REFUNDED: ["#8B5CF6", "rgba(139,92,246,0.14)"],
    };
    const [color, bg] = map[s] || ["#6B7280", "rgba(107,114,128,0.14)"];
    return { color, background: bg, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 };
  };

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

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
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Order Details</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, fontSize: 13 }}>🔍</span>
            <input placeholder="Search anything..." style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
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

          {/* Page title row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <Link href="/admin/orders" style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, textDecoration: "none" }}>
                  <ArrowLeft style={{ width: 13, height: 13 }} /> Back to Orders
                </Link>
                {order && <span style={statusBadgeStyle(order.status)}>{STATUS_MAP[order.status] || order.status}</span>}
                {order && <span style={payBadgeStyle(order.paymentStatus)}>{PAYMENT_STATUS_MAP[order.paymentStatus] || order.paymentStatus}</span>}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>
                {order ? `Order ${order.orderNumber}` : "Order Details"}
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <Link href="/admin" style={{ color: TEXT2, textDecoration: "none" }}>Home</Link>
                <ChevronRight style={{ width: 13, height: 13 }} />
                <Link href="/admin/orders" style={{ color: TEXT2, textDecoration: "none" }}>Orders</Link>
                <ChevronRight style={{ width: 13, height: 13 }} />
                <span style={{ color: ACCENT }}>Order Details</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={fetchOrder} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 38, height: 38, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, color: TEXT2, cursor: "pointer" }}>
                <RefreshCw style={{ width: 15, height: 15 }} />
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
                <Download style={{ width: 14, height: 14 }} /> Export
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT2, cursor: "pointer" }}>
                <MoreHorizontal style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {/* ── STATUS STEPPER — full width ── */}
          {order && (
            <div style={{ ...card, padding: "20px 24px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {STATUS_STEPS.map((step, i) => {
                  const state = getStepState(step, order);
                  const isLast = i === STATUS_STEPS.length - 1;
                  return (
                    <div key={step} style={{ display: "flex", alignItems: "center", flex: isLast ? "0 0 auto" : 1 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: stepBg[state], border: `2px solid ${stepColor[state]}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {state === "completed" && <CheckCircle style={{ width: 16, height: 16, color: stepColor[state] }} />}
                          {state === "failed" && <XCircle style={{ width: 16, height: 16, color: stepColor[state] }} />}
                          {state === "pending" && <div style={{ width: 10, height: 10, borderRadius: "50%", background: stepColor[state] }} />}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: state === "pending" ? TEXT2 : TEXT, textAlign: "center", whiteSpace: "nowrap", maxWidth: 90 }}>{step}</div>
                      </div>
                      {!isLast && (
                        <div style={{ flex: 1, height: 2, background: state === "completed" ? stepColor.completed : BORDER, margin: "0 8px", marginBottom: 24 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: TEXT2, fontSize: 14 }}>
              Loading order details...
            </div>
          ) : !order ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 60, color: "#EF4444", fontSize: 14 }}>
              Order not found.
            </div>
          ) : (
            <>
              {/* ── MAIN 2-COLUMN CONTENT ── */}
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

                {/* LEFT — main content */}
                <div style={{ flex: "1 1 0", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Management Actions + Price Summary side by side */}
                  <div style={{ display: "flex", gap: 16 }}>
                    {/* Management Actions */}
                    <div style={{ ...card, padding: 18, flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <Clock style={{ width: 15, height: 15, color: ACCENT }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Management Actions</span>
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        <div style={{ flex: 1 }}>
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
                        <div style={{ flex: 1 }}>
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

                    {/* Quick summary stats */}
                    <div style={{ ...card, padding: 18, minWidth: 180 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                        <CreditCard style={{ width: 15, height: 15, color: ACCENT }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Order Summary</span>
                      </div>
                      {[
                        { label: "Subtotal", value: order.subtotal },
                        { label: "Shipping", value: order.shipping },
                        { label: "Tax", value: order.tax },
                      ].map(r => (
                        <div key={r.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, color: TEXT2 }}>{r.label}</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{formatPrice(r.value)}</span>
                        </div>
                      ))}
                      <div style={{ height: 1, background: BORDER, margin: "8px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: TEXT }}>Total</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: ACCENT }}>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ ...card, overflow: "hidden" }}>
                    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
                      <Package style={{ width: 15, height: 15, color: TEXT2 }} />
                      <span style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>Order Items</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, color: TEXT2 }}>{order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? "s" : ""}</span>
                    </div>
                    <div style={{ padding: "0 18px" }}>
                      {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                        <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: idx < order.items.length - 1 ? `1px solid ${BORDER}` : "none" }}>
                          <div style={{ width: 48, height: 48, borderRadius: 10, background: ICON_BG, flexShrink: 0, overflow: "hidden" }}>
                            {item.product.images?.[0] && <img src={item.product.images[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.product.name}</div>
                            <div style={{ fontSize: 11, color: TEXT2, marginTop: 2 }}>Qty: {item.quantity} × {formatPrice(item.price)}</div>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, flexShrink: 0 }}>{formatPrice(item.total)}</div>
                        </div>
                      )) : (
                        <div style={{ padding: "20px 0", color: TEXT2, fontSize: 13, textAlign: "center" }}>No items found</div>
                      )}
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
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, width: 16 }}>
                              <div style={{ width: 14, height: 14, borderRadius: "50%", background: stepColor[state], flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2 }}>
                                {state === "completed" && <span style={{ color: "#fff", fontSize: 8, fontWeight: 700 }}>✓</span>}
                                {state === "failed" && <span style={{ color: "#fff", fontSize: 8, fontWeight: 700 }}>✕</span>}
                              </div>
                              {!isLast && <div style={{ width: 2, flex: 1, background: state === "completed" ? stepColor[state] + "50" : BORDER, minHeight: 18, marginTop: 3 }} />}
                            </div>
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
                </div>

                {/* RIGHT SIDEBAR — customer info, notes, payment */}
                <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 14 }}>

                  {/* Customer Details */}
                  <div style={{ ...card, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <User style={{ width: 15, height: 15, color: ACCENT }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Customer</span>
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
                  <div style={{ ...card, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <MapPin style={{ width: 15, height: 15, color: ACCENT }} />
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
                  <div style={{ ...card, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <CreditCard style={{ width: 15, height: 15, color: ACCENT }} />
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

                  {/* Order Notes */}
                  <div style={{ ...card, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <FileText style={{ width: 15, height: 15, color: ACCENT }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Order Notes</span>
                    </div>
                    <div style={{ background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: order.notes ? TEXT : TEXT2, fontStyle: order.notes ? "normal" : "italic", minHeight: 60 }}>
                      {order.notes || "No notes provided."}
                    </div>
                  </div>

                  {/* Package / Delivery Notes */}
                  <div style={{ ...card, padding: 18 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Box style={{ width: 15, height: 15, color: ACCENT }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Package Notes</span>
                    </div>
                    <div style={{ background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, color: TEXT2, fontStyle: "italic", minHeight: 60 }}>
                      No special packaging notes.
                    </div>
                  </div>

                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
