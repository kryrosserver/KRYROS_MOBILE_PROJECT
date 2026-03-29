"use client";

import { useEffect, useState } from "react";
import { Search, RefreshCw, User, Mail, Phone, Shield } from "lucide-react";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/internal/admin/users", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed to load users");
      setUsers(Array.isArray(body) ? body : body?.users || body?.data || []);
    } catch (e: any) {
      setError(e?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredUsers = users.filter(u => 
    u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Users & Roles</h1>
          <p className="text-slate-500 text-sm hidden sm:block">Manage users, roles, and permissions</p>
        </div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 min-h-[44px] px-4 py-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="admin-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          />
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm text-center">
            <User className="h-12 w-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">
              {searchTerm ? "No users match your search." : "No users found."}
            </p>
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div key={u.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {u.firstName} {u.lastName}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-slate-500">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Phone className="h-3 w-3 shrink-0" />
                      <span>{u.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  <Shield className="h-3 w-3" />
                  {u.role}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                  {u.isActive ? "Active" : "Inactive"}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {u.isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Joined: {new Date(u.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block admin-card overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="admin-table min-w-[700px]">
            <thead>
              <tr>
                <th className="px-4 md:px-6 py-4">Name</th>
                <th className="px-4 md:px-6 py-4">Email</th>
                <th className="px-4 md:px-6 py-4 hidden sm:table-cell">Phone</th>
                <th className="px-4 md:px-6 py-4">Role</th>
                <th className="px-4 md:px-6 py-4">Status</th>
                <th className="px-4 md:px-6 py-4">Verified</th>
                <th className="px-4 md:px-6 py-4 hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 md:px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-4 md:px-6 py-4"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
                    <td className="px-4 md:px-6 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                    <td className="px-4 md:px-6 py-4"><div className="h-6 bg-slate-100 rounded w-16"></div></td>
                    <td className="px-4 md:px-6 py-4"><div className="h-6 bg-slate-100 rounded w-16"></div></td>
                    <td className="px-4 md:px-6 py-4"><div className="h-6 bg-slate-100 rounded w-16"></div></td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 md:px-6 py-12 text-center text-slate-500">
                    <User className="h-12 w-12 text-slate-200 mx-auto mb-2" />
                    <p>{searchTerm ? "No users match your search." : "No users found."}</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-slate-400" />
                        </div>
                        <span className="font-medium text-slate-900">{u.firstName} {u.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-600">{u.email}</td>
                    <td className="px-4 md:px-6 py-4 text-slate-600 hidden sm:table-cell">{u.phone || "—"}</td>
                    <td className="px-4 md:px-6 py-4">
                      <span className="badge badge-info flex items-center gap-1 w-fit">
                        <Shield className="h-3 w-3" />
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`badge ${u.isActive ? "badge-success" : "badge-danger"}`}>
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`badge ${u.isVerified ? "badge-success" : "badge-warning"}`}>
                        {u.isVerified ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-slate-500 hidden md:table-cell">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {loading && <div className="p-4 text-sm text-slate-500 text-center">Loading...</div>}
        {!loading && !users.length && !error && <div className="p-4 text-sm text-slate-500 text-center">No users yet</div>}
        {error && <div className="p-4 text-sm text-red-600 text-center">{error}</div>}
      </div>
    </div>
  );
}
