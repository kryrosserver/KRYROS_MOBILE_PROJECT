"use client";

import { useEffect, useState } from "react";

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

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users & Roles</h1>
          <p className="text-slate-500">Manage users, roles, and permissions</p>
        </div>
        <button onClick={load} className="btn-secondary">Refresh</button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Verified</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium text-slate-900">{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "—"}</td>
                  <td><span className="badge badge-neutral">{u.role}</span></td>
                  <td><span className={`badge ${u.isActive ? "badge-success" : "badge-danger"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
                  <td><span className={`badge ${u.isVerified ? "badge-success" : "badge-warning"}`}>{u.isVerified ? "Yes" : "No"}</span></td>
                  <td className="text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-4 text-sm text-slate-500">Loading...</div>}
          {!loading && !users.length && !error && <div className="p-4 text-sm text-slate-500">No users yet</div>}
          {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
}
