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
  AlertCircle
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

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/internal/admin/orders", { cache: "no-store" });
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
      case "CONFIRMED": return "bg-blue-100 text-blue-700 border-blue-200";
      case "DELIVERED": return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
      case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-slate-500 text-sm">Review, confirm, and process customer orders</p>
        </div>
        <button 
          onClick={load} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Order #, Email, or Name..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1 shadow-sm">
          <Filter className="h-4 w-4 text-slate-400" />
          <select 
            className="text-sm bg-transparent outline-none py-1 font-medium text-slate-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-slate-900 text-sm">{o.orderNumber}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col max-w-[180px]">
                      <span className="text-sm font-bold text-slate-800 truncate">
                        {o.user ? `${o.user.firstName} ${o.user.lastName}` : (o.shippingAddress ? `${o.shippingAddress.firstName} ${o.shippingAddress.lastName}` : "Guest User")}
                      </span>
                      <span className="text-xs text-slate-500 truncate">{o.user?.email || o.shippingAddress?.email || "—"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900 text-sm">{formatPrice(Number(o.total))}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusBadge(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                      o.paymentStatus === "PAID" 
                        ? "bg-green-100 text-green-700 border-green-200" 
                        : o.paymentStatus === "PENDING" 
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200" 
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}>
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      href={`/orders/${o.id}`}
                      className="inline-flex items-center justify-center p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm group-hover:shadow-md"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium">Fetching orders...</p>
            </div>
          )}
          
          {!loading && !filteredOrders.length && (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Package className="h-12 w-12 opacity-20" />
              <p className="text-sm font-medium">No orders found matching your criteria</p>
            </div>
          )}
          
          {error && (
            <div className="p-6 bg-red-50 text-red-600 flex items-center gap-2 text-sm font-medium border-t border-red-100">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
