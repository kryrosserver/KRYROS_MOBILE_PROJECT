"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, UserCheck, UserX, ShieldCheck, Search, RefreshCw,
  ChevronLeft, ChevronRight, Mail, Phone, Calendar,
  UserPlus, Eye, Lock, Unlock,
} from "lucide-react";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    ADMIN:     { bg: "rgba(99,102,241,.12)",  color: "#6366F1" },
    MANAGER:   { bg: "rgba(245,158,11,.12)",  color: "#F59E0B" },
    CUSTOMER:  { bg: "rgba(22,199,132,.12)",  color: "#16C784" },
    AGENT:     { bg: "rgba(59,130,246,.12)",  color: "#3B82F6" },
    WHOLESALE: { bg: "rgba(236,72,153,.12)",  color: "#EC4899" },
  };
  const s = map[role?.toUpperCase()] ?? { bg: "rgba(107,114,128,.1)", color: "#6B7280" };
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold" style={{ background: s.bg, color: s.color }}>
      {role || "USER"}
    </span>
  );
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0] || "").slice(0, 2).join("").toUpperCase();
  const colors = ["#6366F1","#F59E0B","#16C784","#3B82F6","#EC4899","#8B5CF6","#EF4444"];
  const bg = colors[(name.charCodeAt(0) || 0) % colors.length];
  return (
    <div className="flex items-center justify-center rounded-full shrink-0 font-bold text-white"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.33 }}>
      {initials || "?"}
    </div>
  );
}

const ROWS = 15;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(Array.isArray(data) ? data : data.users ?? data.items ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error loading users");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    load().finally(() => setTimeout(() => setIsRefreshing(false), 400));
  };

  const toggleStatus = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/users/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      setUsers(u => u.map(x => x.id === id ? { ...x, isActive: !current } : x));
    } catch { /* silent */ }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone || "").includes(q);
    const matchRole = roleFilter === "all" || (u.role || "CUSTOMER").toUpperCase() === roleFilter;
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? u.isActive : !u.isActive);
    return matchSearch && matchRole && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS));
  const rows = filtered.slice((page - 1) * ROWS, page * ROWS);

  const stats = [
    { label: "Total Users",  value: users.length,                                                        color: "#6366F1", bg: "rgba(99,102,241,.1)",  icon: Users },
    { label: "Active",       value: users.filter(u => u.isActive).length,                                color: "#16C784", bg: "rgba(22,199,132,.1)",  icon: UserCheck },
    { label: "Inactive",     value: users.filter(u => !u.isActive).length,                               color: "#EF4444", bg: "rgba(239,68,68,.1)",   icon: UserX },
    { label: "Admins",       value: users.filter(u => u.role?.toUpperCase() === "ADMIN").length,         color: "#F59E0B", bg: "rgba(245,158,11,.1)",  icon: ShieldCheck },
  ];

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100vh", padding: "20px 16px 40px" }}>
      <div className="max-w-full mx-auto space-y-5">

        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#111827" }}>Users</h1>
            <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Manage customer accounts &amp; roles</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleRefresh}
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} style={{ color: "#6B7280" }} />
            </button>
            <button className="h-9 px-4 rounded-xl flex items-center gap-2 text-sm font-semibold text-white"
              style={{ background: "#6366F1" }}>
              <UserPlus className="h-4 w-4" /> Add User
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl p-4"
              style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                <s.icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <p className="text-xs font-medium" style={{ color: "#6B7280" }}>{s.label}</p>
              <p className="text-2xl font-bold mt-0.5" style={{ color: s.color }}>{loading ? "—" : s.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(239,68,68,.08)", color: "#EF4444", border: "1px solid rgba(239,68,68,.2)" }}>
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center"
          style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#9CA3AF" }} />
            <input placeholder="Search name, email, phone…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm outline-none"
              style={{ border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827" }} />
          </div>
          <div className="flex gap-2 shrink-0">
            <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 rounded-xl text-sm outline-none flex-1 sm:flex-none"
              style={{ border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827", minWidth: 110 }}>
              <option value="all">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="CUSTOMER">Customer</option>
              <option value="AGENT">Agent</option>
              <option value="WHOLESALE">Wholesale</option>
            </select>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-9 px-3 rounded-xl text-sm outline-none flex-1 sm:flex-none"
              style={{ border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827", minWidth: 110 }}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                  {["User","Contact","Role","Status","Joined","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "#6B7280", textAlign: h === "Actions" ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-5 rounded-lg animate-pulse" style={{ background: "#F3F4F6", width: `${55 + (i % 3) * 15}%` }} />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Users className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: "#9CA3AF" }} />
                      <p className="text-sm font-medium" style={{ color: "#9CA3AF" }}>No users found</p>
                    </td>
                  </tr>
                ) : rows.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #F3F4F6" }} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${u.firstName} ${u.lastName}`} />
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate" style={{ color: "#111827" }}>{u.firstName} {u.lastName}</p>
                          <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>#{u.id.slice(-6).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-xs flex items-center gap-1.5 whitespace-nowrap" style={{ color: "#4B5563" }}>
                        <Mail className="h-3 w-3 shrink-0" style={{ color: "#9CA3AF" }} />{u.email}
                      </p>
                      {u.phone && (
                        <p className="text-xs flex items-center gap-1.5 mt-0.5 whitespace-nowrap" style={{ color: "#4B5563" }}>
                          <Phone className="h-3 w-3 shrink-0" style={{ color: "#9CA3AF" }} />{u.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <RoleBadge role={u.role || "CUSTOMER"} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={u.isActive
                          ? { background: "rgba(22,199,132,.12)", color: "#16C784" }
                          : { background: "rgba(239,68,68,.1)", color: "#EF4444" }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: u.isActive ? "#16C784" : "#EF4444" }} />
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs flex items-center gap-1.5" style={{ color: "#6B7280" }}>
                        <Calendar className="h-3 w-3 shrink-0" />
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100" title="View">
                          <Eye className="h-3.5 w-3.5" style={{ color: "#6B7280" }} />
                        </button>
                        <button onClick={() => toggleStatus(u.id, u.isActive)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
                          title={u.isActive ? "Deactivate" : "Activate"}>
                          {u.isActive
                            ? <Lock className="h-3.5 w-3.5" style={{ color: "#EF4444" }} />
                            : <Unlock className="h-3.5 w-3.5" style={{ color: "#16C784" }} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid #F3F4F6" }}>
            <span className="text-xs" style={{ color: "#9CA3AF" }}>
              {filtered.length === 0 ? "0 results" : `${(page - 1) * ROWS + 1}–${Math.min(page * ROWS, filtered.length)} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="h-8 w-8 rounded-lg flex items-center justify-center disabled:opacity-40"
                style={{ border: "1px solid #E5E7EB", background: "#fff" }}>
                <ChevronLeft className="h-4 w-4" style={{ color: "#6B7280" }} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const n = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                return (
                  <button key={n} onClick={() => setPage(n)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                    style={n === page ? { background: "#6366F1", color: "#fff" } : { color: "#6B7280" }}>
                    {n}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="h-8 w-8 rounded-lg flex items-center justify-center disabled:opacity-40"
                style={{ border: "1px solid #E5E7EB", background: "#fff" }}>
                <ChevronRight className="h-4 w-4" style={{ color: "#6B7280" }} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
