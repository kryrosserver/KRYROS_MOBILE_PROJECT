"use client";

import { useState } from "react";
import { 
  Search, 
  Plus, 
  MoreHorizontal,
  Mail,
  Phone,
  Shield,
  Edit,
  Trash2,
  Eye,
  UserCheck,
  UserX
} from "lucide-react";

const users = [
  { 
    id: "1", 
    name: "John Moyo",
    email: "john@example.com",
    phone: "+260 966 123 456",
    role: "CUSTOMER",
    creditLimit: 10000,
    status: "active",
    orders: 12,
    joined: "2023-06-15"
  },
  { 
    id: "2", 
    name: "Sarah Chanda",
    email: "sarah@example.com",
    phone: "+260 955 234 567",
    role: "WHOLESALER",
    creditLimit: 50000,
    status: "active",
    orders: 45,
    joined: "2023-03-10"
  },
  { 
    id: "3", 
    name: "Emmanuel Phiri",
    email: "emmanuel@example.com",
    phone: "+260 977 345 678",
    role: "ADMIN",
    creditLimit: 0,
    status: "active",
    orders: 0,
    joined: "2023-01-01"
  },
  { 
    id: "4", 
    name: "Grace Mwape",
    email: "grace@example.com",
    phone: "+260 966 456 789",
    role: "CUSTOMER",
    creditLimit: 5000,
    status: "active",
    orders: 8,
    joined: "2023-08-20"
  },
  { 
    id: "5", 
    name: "Joseph Banda",
    email: "joseph@example.com",
    phone: "+260 955 567 890",
    role: "CUSTOMER",
    creditLimit: 0,
    status: "suspended",
    orders: 3,
    joined: "2023-09-05"
  },
];

const roles = ["All", "CUSTOMER", "WHOLESALER", "ADMIN", "SUPER_ADMIN"];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = users.filter(user => {
    if (selectedRole !== "All" && user.role !== selectedRole) return false;
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !user.email.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN": 
      case "SUPER_ADMIN":
        return "badge-danger";
      case "WHOLESALER":
        return "badge-info";
      default:
        return "badge-success";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users & Roles</h1>
          <p className="text-slate-500">Manage users, roles, and permissions</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Manage Roles
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="admin-card p-6">
          <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          <p className="text-sm text-slate-500">Total Users</p>
        </div>
        <div className="admin-card p-6">
          <p className="text-2xl font-bold text-slate-900">
            {users.filter(u => u.role === "CUSTOMER").length}
          </p>
          <p className="text-sm text-slate-500">Customers</p>
        </div>
        <div className="admin-card p-6">
          <p className="text-2xl font-bold text-slate-900">
            {users.filter(u => u.role === "WHOLESALER").length}
          </p>
          <p className="text-sm text-slate-500">Wholesalers</p>
        </div>
        <div className="admin-card p-6">
          <p className="text-2xl font-bold text-slate-900">
            {users.filter(u => u.status === "suspended").length}
          </p>
          <p className="text-sm text-slate-500">Suspended</p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedRole === role
                    ? "bg-green-500 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {role === "All" ? "All Roles" : role}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Credit Limit</th>
                <th>Orders</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 font-medium">
                          {user.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">ID: {user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      <p className="text-xs text-slate-500">{user.phone}</p>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="font-medium">
                    {user.creditLimit > 0 ? `K ${user.creditLimit.toLocaleString()}` : "-"}
                  </td>
                  <td>{user.orders}</td>
                  <td>
                    <span className={`badge ${user.status === "active" ? "badge-success" : "badge-danger"}`}>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </span>
                  </td>
                  <td className="text-slate-500">{user.joined}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <Eye className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <Edit className="h-4 w-4 text-slate-600" />
                      </button>
                      {user.status === "active" ? (
                        <button className="p-2 hover:bg-red-50 rounded-lg">
                          <UserX className="h-4 w-4 text-red-500" />
                        </button>
                      ) : (
                        <button className="p-2 hover:bg-green-50 rounded-lg">
                          <UserCheck className="h-4 w-4 text-green-500" />
                        </button>
                      )}
                      <button className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4 text-red-500" />
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
          <p className="text-sm text-slate-500">Showing {filteredUsers.length} of {users.length} users</p>
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
