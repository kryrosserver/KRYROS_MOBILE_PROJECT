"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  Eye, 
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Download
} from "lucide-react";

const orders = [
  { 
    id: "ORD-001", 
    orderNumber: "KRY2024001001",
    customer: "John Moyo", 
    email: "john@example.com",
    items: 3,
    total: 28500,
    status: "pending",
    payment: "pending",
    date: "2024-01-15"
  },
  { 
    id: "ORD-002", 
    orderNumber: "KRY2024001000",
    customer: "Sarah Chanda", 
    email: "sarah@example.com",
    items: 2,
    total: 18500,
    status: "processing",
    payment: "paid",
    date: "2024-01-14"
  },
  { 
    id: "ORD-003", 
    orderNumber: "KRY2024000999",
    customer: "Emmanuel Phiri", 
    email: "emmanuel@example.com",
    items: 1,
    total: 45000,
    status: "shipped",
    payment: "paid",
    date: "2024-01-13"
  },
  { 
    id: "ORD-004", 
    orderNumber: "KRY2024000998",
    customer: "Grace Mwape", 
    email: "grace@example.com",
    items: 5,
    total: 52000,
    status: "delivered",
    payment: "paid",
    date: "2024-01-12"
  },
  { 
    id: "ORD-005", 
    orderNumber: "KRY2024000997",
    customer: "Joseph Banda", 
    email: "joseph@example.com",
    items: 2,
    total: 12500,
    status: "cancelled",
    payment: "refunded",
    date: "2024-01-11"
  },
];

const statusOptions = ["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing": return <Package className="h-4 w-4 text-blue-500" />;
      case "shipped": return <Truck className="h-4 w-4 text-purple-500" />;
      case "delivered": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "cancelled": return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (selectedStatus !== "All" && order.status !== selectedStatus.toLowerCase()) return false;
    if (searchQuery && !order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !order.customer.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-slate-500">Manage and track customer orders</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Orders
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-5">
        {statusOptions.slice(1).map((status) => {
          const count = orders.filter(o => o.status === status.toLowerCase()).length;
          return (
            <button
              key={status}
              onClick={() => setSelectedStatus(status === selectedStatus ? "All" : status)}
              className={`admin-card p-4 text-left transition-all ${
                selectedStatus === status ? "ring-2 ring-green-500" : ""
              }`}
            >
              <p className="text-2xl font-bold text-slate-900">{count}</p>
              <p className="text-sm text-slate-500">{status}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="admin-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by order number or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedStatus === status
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div>
                      <p className="font-medium text-slate-900">{order.orderNumber}</p>
                      <p className="text-xs text-slate-500">ID: {order.id}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-slate-900">{order.customer}</p>
                      <p className="text-xs text-slate-500">{order.email}</p>
                    </div>
                  </td>
                  <td>{order.items} items</td>
                  <td className="font-medium">K {order.total.toLocaleString()}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 badge ${
                      order.status === "delivered" ? "badge-success" :
                      order.status === "shipped" ? "badge-info" :
                      order.status === "processing" ? "badge-warning" :
                      order.status === "cancelled" ? "badge-danger" :
                      "badge-neutral"
                    }`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      order.payment === "paid" ? "badge-success" :
                      order.payment === "pending" ? "badge-warning" :
                      "badge-danger"
                    }`}>
                      {order.payment.charAt(0).toUpperCase() + order.payment.slice(1)}
                    </span>
                  </td>
                  <td className="text-slate-500">{order.date}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <Eye className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <Package className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <MoreHorizontal className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">Showing {filteredOrders.length} of {orders.length} orders</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">2</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
