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
  const BG = "#F8F9FA";
  const CARD = "#FFFFFF";
  const BORDER = "#E5E7EB";
  const TEXT = "#111827";
  const TEXT2 = "#4B5563";
  const TEXT3 = "#9CA3AF";
  const HOVER = "#F9FAFB";
  const HEADER_BG = "#FFFFFF";
  const ICON_BG = "#F9FAFB";
  const ACCENT = "#6366F1";

  const { id } = params;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);


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
      CONFIRMED: ["#6366F1", "rgba(18,214,197,0.14)"],
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

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: 24 }}>
      <div style={{ marginBottom: 8 }}>
        <Link href="/admin/orders" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", color: "#4B5563", fontSize: 12, textDecoration: "none" }}>
          <ArrowLeft style={{ width: 13, height: 13 }} /> Back to Orders
        </Link>
      </div>
      {loading && (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 60 }}>
          <RefreshCw style={{ width: 32, height: 32, color: "#9CA3AF", opacity: 0.5 }} />
          <p style={{ color: "#6B7280", fontWeight: 600, fontSize: 13, marginTop: 12 }}>Loading order...</p>
        </div>
      )}
      {!loading && !order && (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 40, textAlign: "center", color: "#9CA3AF" }}>Order not found.</div>
      )}
      {order && (
        <div>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Order #{order.orderNumber || order.id}</h2>
              <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "—"}</p>
            </div>
            <span style={{ padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: order.status === "DELIVERED" ? "#D1FAE5" : order.status === "CANCELLED" ? "#FEE2E2" : order.status === "SHIPPED" ? "#DBEAFE" : "#FEF3C7", color: order.status === "DELIVERED" ? "#065F46" : order.status === "CANCELLED" ? "#991B1B" : order.status === "SHIPPED" ? "#1E40AF" : "#92400E" }}>{order.status}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 20 }}>
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Customer</div>
              <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{order.user?.firstName || order.shippingAddress?.firstName || "—"}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{order.user?.email || order.shippingAddress?.email || "—"}</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Shipping Address</div>
              <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{order.shippingAddress?.firstName ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ""}` : "—"}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{order.shippingAddress?.street || "—"}</div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>Payment</div>
              <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{order.paymentMethod || "—"}</div>
              <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{order.paymentStatus || "—"}</div>
            </div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                  {["Product", "Quantity", "Price", "Total"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, color: "#374151" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px", color: "#111827", fontWeight: 600 }}>{item.name || item.product?.name || "—"}</td>
                    <td style={{ padding: "12px 16px", color: "#6B7280" }}>{item.quantity || 1}</td>
                    <td style={{ padding: "12px 16px", color: "#6B7280" }}>${(item.price || 0).toFixed(2)}</td>
                    <td style={{ padding: "12px 16px", color: "#111827", fontWeight: 600 }}>${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding: "16px 20px", borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "flex-end", gap: 24 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#6B7280" }}>Subtotal</div>
                <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>Shipping</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginTop: 8 }}>Total</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#111827" }}>${(order.subtotal || 0).toFixed(2)}</div>
                <div style={{ fontSize: 12, color: "#111827", marginTop: 4 }}>${(order.shipping || 0).toFixed(2)}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827", marginTop: 8 }}>${(order.total || 0).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
