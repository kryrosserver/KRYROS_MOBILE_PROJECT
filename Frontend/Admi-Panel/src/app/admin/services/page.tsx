"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Wrench, CheckCircle, XCircle, Tag, Search, RefreshCw,
  ChevronLeft, ChevronRight, Plus, Edit2, Trash2,
  DollarSign, Package, Clock,
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  category?: string;
  isActive: boolean;
  createdAt: string;
};

function Modal({ open, onClose, onSave, initial }: {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Service>) => void;
  initial: Partial<Service> | null;
}) {
  const [form, setForm] = useState<Partial<Service>>(initial || { name: "", price: 0, isActive: true });
  useEffect(() => { setForm(initial || { name: "", price: 0, isActive: true }); }, [initial]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.45)" }}>
      <div className="w-full max-w-md rounded-2xl p-6"
        style={{ background: "#fff", boxShadow: "0 20px 60px rgba(0,0,0,.2)" }}>
        <h2 className="text-base font-bold mb-5" style={{ color: "#111827" }}>
          {initial?.id ? "Edit Service" : "Add Service"}
        </h2>
        <div className="space-y-4">
          {[
            { label: "Service Name", field: "name", type: "text", placeholder: "e.g. Installation" },
            { label: "Price ($)", field: "price", type: "number", placeholder: "0.00" },
            { label: "Category", field: "category", type: "text", placeholder: "e.g. Maintenance" },
            { label: "Duration (min)", field: "duration", type: "number", placeholder: "60" },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-medium mb-1" style={{ color: "#6B7280" }}>{label}</label>
              <input type={type} placeholder={placeholder}
                value={(form as Record<string, unknown>)[field] as string || ""}
                onChange={e => setForm(f => ({ ...f, [field]: type === "number" ? parseFloat(e.target.value) || 0 : e.target.value }))}
                className="w-full h-9 px-3 rounded-xl text-sm outline-none"
                style={{ border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827" }} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "#6B7280" }}>Description</label>
            <textarea placeholder="Optional description…"
              value={form.description || ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
              style={{ border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827" }} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={!!form.isActive}
              onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
            <span className="text-sm font-medium" style={{ color: "#374151" }}>Active</span>
          </label>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 h-9 rounded-xl border text-sm font-semibold"
            style={{ border: "1px solid #E5E7EB", color: "#6B7280" }}>Cancel</button>
          <button onClick={() => onSave(form)}
            className="flex-1 h-9 rounded-xl text-sm font-semibold text-white"
            style={{ background: "#6366F1" }}>Save</button>
        </div>
      </div>
    </div>
  );
}

const ROWS = 12;

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/services");
      const data = await res.json();
      if (res.ok) setServices(Array.isArray(data) ? data : data.services ?? data.items ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    load().finally(() => setTimeout(() => setIsRefreshing(false), 400));
  };

  const handleSave = async (form: Partial<Service>) => {
    try {
      const method = form.id ? "PUT" : "POST";
      const url = form.id ? `/api/admin/services/${form.id}` : "/api/admin/services";
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setModalOpen(false);
      load();
    } catch { /* silent */ }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      setServices(s => s.filter(x => x.id !== id));
    } catch { /* silent */ }
  };

  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !q || (s.name || "").toLowerCase().includes(q) || (s.category || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || (statusFilter === "active" ? s.isActive : !s.isActive);
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS));
  const rows = filtered.slice((page - 1) * ROWS, page * ROWS);

  const stats = [
    { label: "Total Services", value: services.length,                              color: "#6366F1", bg: "rgba(99,102,241,.1)",  icon: Wrench },
    { label: "Active",         value: services.filter(s => s.isActive).length,      color: "#16C784", bg: "rgba(22,199,132,.1)",  icon: CheckCircle },
    { label: "Inactive",       value: services.filter(s => !s.isActive).length,     color: "#EF4444", bg: "rgba(239,68,68,.1)",   icon: XCircle },
    { label: "Categories",     value: new Set(services.map(s => s.category).filter(Boolean)).size, color: "#F59E0B", bg: "rgba(245,158,11,.1)", icon: Tag },
  ];

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: "20px 16px 40px" }}>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} initial={editing} />

      <div className="max-w-full mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#111827" }}>Services</h1>
            <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Manage service offerings and pricing</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleRefresh}
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} style={{ color: "#6B7280" }} />
            </button>
            <button onClick={() => { setEditing(null); setModalOpen(true); }}
              className="h-9 px-4 rounded-xl flex items-center gap-2 text-sm font-semibold text-white"
              style={{ background: "#6366F1" }}>
              <Plus className="h-4 w-4" /> Add Service
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

        {/* Filters */}
        <div className="rounded-2xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center"
          style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#9CA3AF" }} />
            <input placeholder="Search service name or category…" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-9 pl-9 pr-3 rounded-xl text-sm outline-none"
              style={{ border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827" }} />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="h-9 px-3 rounded-xl text-sm outline-none shrink-0"
            style={{ border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827", minWidth: 120 }}>
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                  {["Service","Category","Price","Duration","Status","Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: "#6B7280", textAlign: h === "Actions" ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-5 rounded-lg animate-pulse" style={{ background: "#F3F4F6", width: `${50 + (i % 4) * 12}%` }} />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <Wrench className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: "#9CA3AF" }} />
                      <p className="text-sm font-medium mb-1" style={{ color: "#9CA3AF" }}>No services found</p>
                      <button onClick={() => { setEditing(null); setModalOpen(true); }}
                        className="text-xs font-semibold mt-1" style={{ color: "#6366F1" }}>
                        + Add your first service
                      </button>
                    </td>
                  </tr>
                ) : rows.map(s => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #F3F4F6" }} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: "rgba(99,102,241,.08)" }}>
                          <Wrench className="h-4 w-4" style={{ color: "#6366F1" }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm" style={{ color: "#111827" }}>{s.name}</p>
                          {s.description && (
                            <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: "#9CA3AF" }}>{s.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {s.category ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium"
                          style={{ background: "rgba(245,158,11,.1)", color: "#F59E0B" }}>
                          <Tag className="h-2.5 w-2.5" />{s.category}
                        </span>
                      ) : <span style={{ color: "#9CA3AF" }}>—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-bold text-sm flex items-center gap-1" style={{ color: "#111827" }}>
                        <DollarSign className="h-3 w-3" style={{ color: "#16C784" }} />
                        {(s.price || 0).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {s.duration ? (
                        <p className="text-xs flex items-center gap-1" style={{ color: "#6B7280" }}>
                          <Clock className="h-3 w-3" />{s.duration} min
                        </p>
                      ) : <span style={{ color: "#9CA3AF" }}>—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                        style={s.isActive
                          ? { background: "rgba(22,199,132,.12)", color: "#16C784" }
                          : { background: "rgba(239,68,68,.1)", color: "#EF4444" }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.isActive ? "#16C784" : "#EF4444" }} />
                        {s.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(s); setModalOpen(true); }}
                          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-gray-100">
                          <Edit2 className="h-3.5 w-3.5" style={{ color: "#6B7280" }} />
                        </button>
                        <button onClick={() => handleDelete(s.id)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-50">
                          <Trash2 className="h-3.5 w-3.5" style={{ color: "#EF4444" }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid #F3F4F6" }}>
            <span className="text-xs" style={{ color: "#9CA3AF" }}>
              {filtered.length === 0 ? "0 results" : `${(page-1)*ROWS+1}–${Math.min(page*ROWS, filtered.length)} of ${filtered.length}`}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                className="h-8 w-8 rounded-lg flex items-center justify-center disabled:opacity-40"
                style={{ border: "1px solid #E5E7EB", background: "#fff" }}>
                <ChevronLeft className="h-4 w-4" style={{ color: "#6B7280" }} />
              </button>
              <span className="text-xs px-2" style={{ color: "#6B7280" }}>{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
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
