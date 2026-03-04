"use client";

import { useState } from "react";
import { 
  Search, 
  CreditCard, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Users,
  Ban
} from "lucide-react";

const creditRequests = [
  { 
    id: "CR-001", 
    customer: "Brian Sampa",
    email: "brian@example.com",
    phone: "+260 966 123 456",
    amount: 15000,
    plan: "6 months",
    product: "iPhone 15 Pro Max",
    monthlyPayment: 2750,
    status: "pending",
    creditScore: 650,
    date: "2024-01-15"
  },
  { 
    id: "CR-002", 
    customer: "Agness Phiri",
    email: "agness@example.com",
    phone: "+260 955 234 567",
    amount: 8000,
    plan: "3 months",
    product: "Samsung Galaxy S24",
    monthlyPayment: 2867,
    status: "approved",
    creditScore: 720,
    date: "2024-01-14"
  },
  { 
    id: "CR-003", 
    customer: "David Sinkamba",
    email: "david@example.com",
    phone: "+260 977 345 678",
    amount: 25000,
    plan: "12 months",
    product: "MacBook Pro 16-inch",
    monthlyPayment: 2333,
    status: "reviewing",
    creditScore: 580,
    date: "2024-01-13"
  },
  { 
    id: "CR-004", 
    customer: "Mary Ngoma",
    email: "mary@example.com",
    phone: "+260 966 456 789",
    amount: 5000,
    plan: "3 months",
    product: "iPad Air",
    monthlyPayment: 1800,
    status: "rejected",
    creditScore: 420,
    date: "2024-01-12"
  },
  { 
    id: "CR-005", 
    customer: "Peter Chishala",
    email: "peter@example.com",
    phone: "+260 955 567 890",
    amount: 12000,
    plan: "6 months",
    product: "MacBook Air M2",
    monthlyPayment: 2200,
    status: "blacklisted",
    creditScore: 0,
    date: "2024-01-11"
  },
];

const stats = [
  { 
    label: "Total Credit Extended", 
    value: "K 2,450,000", 
    icon: DollarSign,
    color: "bg-green-500",
    change: "+18.2%"
  },
  { 
    label: "Active Plans", 
    value: "156", 
    icon: CreditCard,
    color: "bg-blue-500",
    change: "+12.5%"
  },
  { 
    label: "Pending Applications", 
    value: "23", 
    icon: Clock,
    color: "bg-yellow-500",
    change: "-5.3%"
  },
  { 
    label: "Default Rate", 
    value: "2.4%", 
    icon: AlertTriangle,
    color: "bg-red-500",
    change: "-1.2%"
  },
];

export default function CreditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected": return <XCircle className="h-4 w-4 text-red-500" />;
      case "reviewing": return <Eye className="h-4 w-4 text-blue-500" />;
      case "blacklisted": return <Ban className="h-4 w-4 text-red-700" />;
      default: return null;
    }
  };

  const filteredRequests = creditRequests.filter(req => {
    if (selectedStatus !== "All" && req.status !== selectedStatus.toLowerCase()) return false;
    if (searchQuery && !req.customer.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !req.id.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credit Management</h1>
          <p className="text-slate-500">Manage credit applications and installment plans</p>
        </div>
        <button className="btn-primary">
          Configure Credit Plans
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-card p-6">
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <div className="mt-4">
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <button className="admin-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-green-100">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-slate-900">Approve Credit</p>
            <p className="text-sm text-slate-500">Review pending applications</p>
          </div>
        </button>
        <button className="admin-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-blue-100">
            <TrendingUp className="h-6 w-6 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-slate-900">Risk Analytics</p>
            <p className="text-sm text-slate-500">View credit risk dashboard</p>
          </div>
        </button>
        <button className="admin-card p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 rounded-xl bg-red-100">
            <Ban className="h-6 w-6 text-red-600" />
          </div>
          <div className="text-left">
            <p className="font-medium text-slate-900">Blacklist</p>
            <p className="text-sm text-slate-500">Manage blacklisted customers</p>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer or application ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <div className="flex gap-2">
            {["All", "Pending", "Reviewing", "Approved", "Rejected", "Blacklisted"].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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

      {/* Credit Requests Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Application</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Plan</th>
                <th>Credit Score</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div>
                      <p className="font-medium text-slate-900">{request.id}</p>
                      <p className="text-xs text-slate-500">{request.date}</p>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-slate-900">{request.customer}</p>
                      <p className="text-xs text-slate-500">{request.email}</p>
                    </div>
                  </td>
                  <td>{request.product}</td>
                  <td className="font-medium">K {request.amount.toLocaleString()}</td>
                  <td>
                    <div>
                      <p>{request.plan}</p>
                      <p className="text-xs text-slate-500">K {request.monthlyPayment}/mo</p>
                    </div>
                  </td>
                  <td>
                    <span className={`font-medium ${
                      request.creditScore >= 700 ? "text-green-600" :
                      request.creditScore >= 500 ? "text-yellow-600" :
                      request.creditScore > 0 ? "text-red-600" : "text-slate-400"
                    }`}>
                      {request.creditScore > 0 ? request.creditScore : "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className={`inline-flex items-center gap-1.5 badge ${
                      request.status === "approved" ? "badge-success" :
                      request.status === "pending" ? "badge-warning" :
                      request.status === "reviewing" ? "badge-info" :
                      request.status === "blacklisted" ? "bg-red-700 text-white" :
                      "badge-danger"
                    }`}>
                      {getStatusIcon(request.status)}
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <Eye className="h-4 w-4 text-slate-600" />
                      </button>
                      {request.status === "pending" && (
                        <>
                          <button className="p-2 hover:bg-green-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg">
                            <XCircle className="h-4 w-4 text-red-500" />
                          </button>
                        </>
                      )}
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
          <p className="text-sm text-slate-500">Showing {filteredRequests.length} of {creditRequests.length} requests</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
            <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">2</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
