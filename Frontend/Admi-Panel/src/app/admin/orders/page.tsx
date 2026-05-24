"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Clock,
  CheckCircle,
  Package,
  X
} from "lucide-react";
import Link from "next/link";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelectedOrders(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":  return "badge-info";
      case "PROCESSING": return "badge-warning";
      case "SHIPPED":    return "badge-info";
      case "DELIVERED":  return "badge-success";
      case "CANCELLED":  return "badge-danger";
      case "PENDING":    return "badge-warning";
      default:           return "";
    }
  };

  return (
    <div className="space-y-5 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Orders Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Review, confirm, and process customer orders
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            type="text"
            placeholder="Search orders, customers..."
            className="admin-input pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <select
            className="admin-input pl-10 !w-auto pr-8"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedOrders.length > 0 && (
        <div
          className="rounded-xl p-3 flex items-center gap-3 flex-wrap"
          style={{ background: "rgba(18,214,197,0.08)", border: "1px solid rgba(18,214,197,0.25)" }}
        >
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#12D6C5" }}>
            {selectedOrders.length} Selected
          </span>
          <div className="h-4 w-px" style={{ background: "rgba(18,214,197,0.3)" }} />
          <div className="flex gap-2 flex-wrap">
            {["PROCESSING", "SHIPPED", "DELIVERED"].map((s) => (
              <button
                key={s}
                onClick={() => bulkUpdateStatus(s)}
                className="btn-secondary !text-[10px] !px-3 !py-1.5 !min-h-0 !h-8"
              >
                Mark {s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedOrders([])}
            className="ml-auto p-1 rounded transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="admin-card !p-4 animate-pulse">
              <div className="h-4 rounded w-1/3 mb-3" style={{ background: "var(--icon-bg)" }} />
              <div className="h-3 rounded w-1/2 mb-2" style={{ background: "var(--icon-bg)" }} />
              <div className="h-3 rounded w-1/4" style={{ background: "var(--icon-bg)" }} />
            </div>
          ))
        ) : filteredOrders.length === 0 ? (
          <div className="admin-card text-center py-12 text-sm" style={{ color: "var(--text-muted)" }}>
            No orders found.
          </div>
        ) : filteredOrders.map((o) => (
          <div key={o.id} className="admin-card !p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                {o.orderNumber}
              </span>
              <span className={`badge ${getStatusBadge(o.status)}`}>{o.status}</span>
            </div>
            <div className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
              {(o.user?.firstName || o.shippingAddress?.firstName || "") + " " + (o.user?.lastName || o.shippingAddress?.lastName || "")}
            </div>
            <div className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
              {new Date(o.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                {formatPrice(o.total)}
              </span>
              <Link href={`/admin/orders/${o.id}`} className="btn-primary flex items-center gap-1 !px-4 !py-2">
                View <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block admin-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="!px-4 !w-10">
                  <input
                    type="checkbox"
                    checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded"
                    style={{ accentColor: "#12D6C5" }}
                  />
                </th>
                <th>Order Details</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={7}>
                      <div
                        className="h-5 rounded animate-pulse mx-4 my-2"
                        style={{ background: "var(--hover-bg)" }}
                      />
                    </td>
                  </tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14" style={{ color: "var(--text-muted)" }}>
                    No orders found.
                  </td>
                </tr>
              ) : filteredOrders.map((o) => (
                <tr
                  key={o.id}
                  className="group"
                  style={selectedOrders.includes(o.id) ? { background: "rgba(18,214,197,0.05)" } : {}}
                >
                  <td className="!px-4">
                    <input
                      type="checkbox"
                      checked={selectedOrders.includes(o.id)}
                      onChange={() => toggleSelect(o.id)}
                      className="h-4 w-4 rounded"
                      style={{ accentColor: "#12D6C5" }}
                    />
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-sm" style={{ color: "var(--text-primary)" }}>
                        {o.orderNumber}
                      </span>
                      <span className="text-[10px] font-medium uppercase mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {new Date(o.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col max-w-[180px]">
                      <span className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {(o.user?.firstName || o.shippingAddress?.firstName || "") + " " + (o.user?.lastName || o.shippingAddress?.lastName || "")}
                      </span>
                      <span className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                        {o.user?.email || o.shippingAddress?.email || ""}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                      {formatPrice(o.total)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(o.status)}`}>{o.status}</span>
                  </td>
                  <td>
                    {o.paymentStatus === "PAID" ? (
                      <span className="badge badge-success inline-flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Paid
                      </span>
                    ) : (
                      <span className="badge badge-warning inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {o.status === "CONFIRMED" && (
                        <button
                          onClick={(e) => { e.preventDefault(); updateStatus(o.id, "PROCESSING"); }}
                          disabled={updating === o.id}
                          className="p-2 rounded-lg transition-all"
                          style={{ color: "#F59E0B" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          title="Mark Processing"
                        >
                          <Package className="h-4 w-4" />
                        </button>
                      )}
                      {o.status === "PROCESSING" && (
                        <button
                          onClick={(e) => { e.preventDefault(); updateStatus(o.id, "SHIPPED"); }}
                          disabled={updating === o.id}
                          className="p-2 rounded-lg transition-all"
                          style={{ color: "#3B82F6" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,0.1)"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          title="Mark Shipped"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      )}
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="btn-primary inline-flex items-center gap-1 !px-3 !py-2 !text-xs"
                      >
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
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
