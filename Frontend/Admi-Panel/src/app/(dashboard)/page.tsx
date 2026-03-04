"use client";

import { 
  Users, 
  ShoppingBag, 
  CreditCard, 
  Wallet,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Eye,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const stats = [
  { 
    label: "Total Revenue", 
    value: "K 1,250,000", 
    change: "+12.5%", 
    trend: "up",
    icon: DollarSign,
    color: "bg-green-500"
  },
  { 
    label: "Total Orders", 
    value: "1,234", 
    change: "+8.2%", 
    trend: "up",
    icon: ShoppingBag,
    color: "bg-blue-500"
  },
  { 
    label: "Active Users", 
    value: "5,678", 
    change: "+15.3%", 
    trend: "up",
    icon: Users,
    color: "bg-purple-500"
  },
  { 
    label: "Credit Applications", 
    value: "89", 
    change: "-3.1%", 
    trend: "down",
    icon: CreditCard,
    color: "bg-orange-500"
  },
];

const recentOrders = [
  { id: "ORD-001", customer: "John Moyo", amount: "K 12,500", status: "Pending", date: "2 mins ago" },
  { id: "ORD-002", customer: "Sarah Chanda", amount: "K 8,900", status: "Processing", date: "15 mins ago" },
  { id: "ORD-003", customer: "Emmanuel Phiri", amount: "K 4,500", status: "Shipped", date: "1 hour ago" },
  { id: "ORD-004", customer: "Grace Mwape", amount: "K 22,000", status: "Delivered", date: "2 hours ago" },
  { id: "ORD-005", customer: "Joseph Banda", amount: "K 6,700", status: "Pending", date: "3 hours ago" },
];

const creditRequests = [
  { id: "CR-001", customer: "Brian Sampa", amount: "K 15,000", plan: "6 months", status: "Pending", date: "1 hour ago" },
  { id: "CR-002", customer: "Agness Phiri", amount: "K 8,000", plan: "3 months", status: "Approved", date: "2 hours ago" },
  { id: "CR-003", customer: "David Sinkamba", amount: "K 25,000", plan: "12 months", status: "Reviewing", date: "3 hours ago" },
];

const topProducts = [
  { name: "iPhone 15 Pro Max", sales: 145, revenue: "K 3,625,000", stock: 23 },
  { name: "Samsung Galaxy S24", sales: 98, revenue: "K 2,156,000", stock: 45 },
  { name: "MacBook Air M2", sales: 56, revenue: "K 2,240,000", stock: 12 },
  { name: "AirPods Pro", sales: 234, revenue: "K 819,000", stock: 156 },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50">
            Download Report
          </button>
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600">
            + Add Product
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-card p-6">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === "up" ? "text-green-600" : "text-red-600"
              }`}>
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="lg:col-span-2 admin-card">
          <div className="admin-card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-green-600 hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium text-slate-900">{order.id}</td>
                    <td>{order.customer}</td>
                    <td className="font-medium">{order.amount}</td>
                    <td>
                      <span className={`badge ${
                        order.status === "Delivered" ? "badge-success" :
                        order.status === "Shipped" ? "badge-info" :
                        order.status === "Processing" ? "badge-warning" :
                        "badge-neutral"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-slate-500">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Credit Requests */}
        <div className="admin-card">
          <div className="admin-card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Credit Requests</h2>
            <a href="/admin/credit" className="text-sm text-green-600 hover:underline">View All</a>
          </div>
          <div className="p-4 space-y-4">
            {creditRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{request.customer}</p>
                  <p className="text-sm text-slate-500">{request.amount} • {request.plan}</p>
                </div>
                <span className={`badge ${
                  request.status === "Approved" ? "badge-success" :
                  request.status === "Pending" ? "badge-warning" :
                  "badge-info"
                }`}>
                  {request.status}
                </span>
              </div>
            ))}
            <button className="w-full py-2 text-sm text-green-600 font-medium hover:underline">
              View All Requests →
            </button>
          </div>
        </div>
      </div>

      {/* Top Products & Alerts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Products */}
        <div className="admin-card">
          <div className="admin-card-header flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Top Products</h2>
            <a href="/admin/products" className="text-sm text-green-600 hover:underline">View All</a>
          </div>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.name}>
                    <td className="font-medium text-slate-900">{product.name}</td>
                    <td>{product.sales}</td>
                    <td className="font-medium">{product.revenue}</td>
                    <td>
                      <span className={product.stock < 20 ? "text-red-500 font-medium" : "text-slate-600"}>
                        {product.stock} units
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="text-lg font-semibold text-slate-900">System Alerts</h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-700">Low Stock Alert</p>
                <p className="text-sm text-red-600">MacBook Air M2 is running low (12 units remaining)</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <Wallet className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-700">Pending Payments</p>
                <p className="text-sm text-yellow-600">5 orders awaiting payment confirmation</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-green-700">System Healthy</p>
                <p className="text-sm text-green-600">All systems operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
