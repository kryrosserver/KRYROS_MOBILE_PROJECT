"use client";

import { useEffect, useState } from "react";

type Order = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  user?: { firstName: string; lastName: string; email: string };
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500">Track and manage customer orders</p>
        </div>
        <button onClick={load} className="btn-secondary">Refresh</button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Email</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td className="font-mono">{o.orderNumber}</td>
                  <td>{o.user ? `${o.user.firstName} ${o.user.lastName}` : "—"}</td>
                  <td>{o.user?.email || "—"}</td>
                  <td>K {Number(o.total).toLocaleString()}</td>
                  <td><span className="badge badge-neutral">{o.status}</span></td>
                  <td><span className={`badge ${o.paymentStatus === "PAID" ? "badge-success" : o.paymentStatus === "PENDING" ? "badge-warning" : "badge-danger"}`}>{o.paymentStatus}</span></td>
                  <td className="text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-4 text-sm text-slate-500">Loading...</div>}
          {!loading && !orders.length && !error && <div className="p-4 text-sm text-slate-500">No orders yet</div>}
          {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
}
