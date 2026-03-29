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
  AlertCircle,
  Package,
  ChevronDown
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
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

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
      case "PROCESSING": return "bg-orange-100 text-orange-700 border-orange-200";
      case "SHIPPED": return "bg-purple-100 text-purple-700 border-purple-200";
      case "DELIVERED": return "bg-green-100 text-green-700 border-green-200";
      case "CANCELLED": return "bg-red-100 text-red-700 border-red-200";
      case "PENDING": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-slate-500 text-sm hidden sm:block">Review, confirm, and process customer orders</p>
        </div>
        <button 
          onClick={load} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search orders..."
            className="w-full pl-10 pr-4 py-3 min-h-[44px] bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1 shadow-sm min-h-[44px]">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select 
            className="text-sm bg-transparent outline-none py-2 font-medium text-slate-700 flex-1"
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

      {/* Mobile Card View for small screens */}
      <div className="lg:hidden space-y-3">
        {filteredOrders.map((o) => (
          <div 
            key={o.id} 
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono font-bold text-slate-900">{o.orderNumber}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(o.status)}`}>
                {o.status}
              </span>
            </div>
            <div className="text-sm text-slate-600 mb-2">
              {(o.user?.firstName || o.shippingAddress?.firstName) + " " + (o.user?.lastName || o.shippingAddress?.lastName)}
            </div>
            <div className="text-xs text-slate-400 mb-3">
              {new Date(o.createdAt).toLocaleDateString()}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">{formatPrice(o.total)}</span>
              <Link 
                href={`/admin/orders/${o.id}`}
                className="px-4 py-2 min-h-[44px] bg-slate-900 text-white text-sm rounded-lg font-medium flex items-center gap-1 hover:bg-slate-800 transition-colors"
              >
                View
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ))}
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-slate-500">No orders found.</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 md:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Details</th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Status</th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                <th className="px-4 md:px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono font-bold text-slate-900 text-sm">{o.orderNumber}</span>
                      <span className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex flex-col max-w-[180px]">
                      <span className="text-sm font-bold text-slate-800 truncate">
                        {(o.user?.firstName || o.shippingAddress?.firstName || "") + " " + (o.user?.lastName || o.shippingAddress?.lastName || "")}
                      </span>
                      <span className="text-xs text-slate-400 truncate">
                        {o.user?.email || o.shippingAddress?.email || ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-lg font-bold text-slate-900">{formatPrice(o.total)}</span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadge(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-1">
                      {o.paymentStatus === "PAID" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          <CheckCircle className="h-3 w-3" />
                          Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                          <Clock className="h-3 w-3" />
                          Pending
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <Link 
                      href={`/admin/orders/${o.id}`}
                      className="inline-flex items-center gap-1 px-3 py-2 min-h-[44px] bg-slate-900 text-white text-sm rounded-lg font-medium hover:bg-slate-800 transition-colors"
                    >
                      View Order
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-slate-500">No orders found.</div>
        )}
      </div>
    </div>
  );
}
