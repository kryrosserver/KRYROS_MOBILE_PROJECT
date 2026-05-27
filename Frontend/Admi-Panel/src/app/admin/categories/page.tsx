"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Plus, Edit, Trash2, Search, RefreshCcw, LayoutGrid, X,
  ChevronRight, ChevronDown, ChevronLeft, Bell, Calendar,
  Sun, Moon, Menu, Download, MoreHorizontal, Filter,
  Settings, Upload, Tag, MoreVertical,
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const ROWS_PER_PAGE = 10;

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  showOnHome: boolean;
  parentId?: string;
  sortOrder?: number;
  _count?: { products: number };
  children?: Category[];
};

const CATEGORY_COLORS = ["#6366F1", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444", "#22C55E", "#EC4899"];

function MiniSparkline({ color = "#6366F1", up = true }: { color?: string; up?: boolean }) {
  const pts = up
    ? [10, 18, 14, 24, 20, 32, 28]
    : [32, 26, 28, 18, 22, 14, 12];
  const max = Math.max(...pts), min = Math.min(...pts);
  const w = 80, h = 32;
  const points = pts.map((v, i) => `${(i / (pts.length - 1)) * w},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function CategoriesPage() {
  const BG = "#F8F9FA";
  const CARD = "#FFFFFF";
  const BORDER = "#E5E7EB";
  const TEXT = "#111827";
  const TEXT2 = "#4B5563";
  const TEXT3 = "#9CA3AF";
  const HOVER = "#F9FAFB";
  const HEADER_BG = "#FFFFFF";
  const ICON_BG = "#F9FAFB";
  const ACCENT = "#6366F1";

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [parentFilter, setParentFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", image: "",
    parentId: "", isActive: true, showOnHome: false,
  });


  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  async function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<string> {
    const blobURL = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = blobURL;
    });
    const scale = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale); canvas.height = Math.round(img.height * scale);
    canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(blobURL);
    return canvas.toDataURL("image/jpeg", quality);
  }

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setForm({ name: category.name, slug: category.slug, description: category.description || "", image: category.image || "", parentId: category.parentId || "", isActive: category.isActive, showOnHome: category.showOnHome || false });
    } else {
      setEditingCategory(null);
      setForm({ name: "", slug: "", description: "", image: "", parentId: "", isActive: true, showOnHome: false });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { alert("Please enter a category name"); return; }
    setSaving(true);
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
      const res = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, parentId: form.parentId || null }),
      });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to save category"); }
      await loadCategories();
      setShowModal(false);
    } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category? Products may become unassigned.")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await loadCategories();
    } catch (e: any) { alert(e.message); }
  };

  const active = categories.filter(c => c.isActive);
  const inactive = categories.filter(c => !c.isActive);
  const totalProducts = categories.reduce((s, c) => s + (c._count?.products || 0), 0);
  const rootCategories = categories.filter(c => !c.parentId);

  const filtered = categories.filter(c => {
    const matchSearch = !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? c.isActive : !c.isActive);
    const matchParent = parentFilter === "ALL" || (parentFilter === "ROOT" ? !c.parentId : c.parentId === parentFilter);
    return matchSearch && matchStatus && matchParent;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const toggleSelect = (id: string) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelectedIds(s => s.length === pageItems.length ? [] : pageItems.map(c => c.id));

  const pieData = [
    { name: "Active Categories", value: active.length || 1, color: "#6366F1" },
    { name: "Inactive Categories", value: inactive.length || 0, color: "#EF4444" },
  ];

  const topCategories = [...categories]
    .sort((a, b) => (b._count?.products || 0) - (a._count?.products || 0))
    .slice(0, 5);

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };

  const pageNums = (() => {
    const nums: (number | "...")[] = [];
    if (totalPages <= 7) for (let i = 1; i <= totalPages; i++) nums.push(i);
    else {
      if (page <= 4) { for (let i = 1; i <= 5; i++) nums.push(i); nums.push("...", totalPages); }
      else if (page >= totalPages - 3) { nums.push(1, "..."); for (let i = totalPages - 4; i <= totalPages; i++) nums.push(i); }
      else { nums.push(1, "...", page - 1, page, page + 1, "...", totalPages); }
    }
    return nums;
  })();


  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Category Management</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "#4B5563" }}>
            <span>Home</span><span>›</span><span>Products</span><span>›</span>
            <span style={{ color: "#6366F1", fontWeight: 600 }}>Categories</span>
          </div>
        </div>
        <button onClick={() => handleOpenModal()}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", padding: "10px 20px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
          <Plus style={{ width: 15, height: 15 }} /> Add Category
        </button>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200, maxWidth: 320 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", width: 15, height: 15 }} />
          <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Search categories..."
            style={{ width: "100%", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px 9px 36px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", color: "#374151", fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <select value={parentFilter} onChange={e => { setParentFilter(e.target.value); setPage(1); }}
          style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", color: "#374151", fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="ALL">All Types</option>
          <option value="ROOT">Root Only</option>
          <option value="SUB">Sub-categories</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <th style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, color: "#374151" }}>
                  <input type="checkbox" checked={selectedIds.length === pageItems.length && pageItems.length > 0}
                    onChange={toggleAll} style={{ cursor: "pointer" }} />
                </th>
                {["Category", "Slug", "Parent", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div style={{ height: 14, borderRadius: 6, background: "#F3F4F6", width: j === 0 ? 20 : j === 1 ? 140 : 80 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No categories found.</td>
                </tr>
              ) : pageItems.map((cat, idx) => (
                <tr key={cat.id} style={{ borderBottom: "1px solid #F3F4F6", background: selectedIds.includes(String(cat.id)) ? "#EEF2FF" : idx % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <input type="checkbox" checked={selectedIds.includes(String(cat.id))}
                      onChange={() => toggleSelect(String(cat.id))} style={{ cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", border: "1px solid #E5E7EB" }} />
                      ) : (
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#6366F1" }}>
                          {cat.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{cat.name}</div>
                        {cat.description && <div style={{ fontSize: 11, color: "#9CA3AF", maxWidth: 200 }}>{cat.description.slice(0, 50)}{cat.description.length > 50 ? "…" : ""}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6B7280", fontFamily: "monospace", fontSize: 12 }}>{cat.slug}</td>
                  <td style={{ padding: "12px 16px", color: "#6B7280" }}>
                    {cat.parentId ? (categories.find(c => c.id === cat.parentId)?.name || "—") : <span style={{ color: "#9CA3AF", fontStyle: "italic" }}>Root</span>}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: cat.isActive ? "#D1FAE5" : "#FEE2E2", color: cat.isActive ? "#065F46" : "#991B1B" }}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleOpenModal(cat)}
                        style={{ display: "flex", alignItems: "center", gap: 4, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 7, padding: "5px 10px", color: "#4338CA", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        <Edit style={{ width: 13, height: 13 }} /> Edit
                      </button>
                      <button onClick={() => handleDelete(cat.id)}
                        style={{ display: "flex", alignItems: "center", gap: 4, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 7, padding: "5px 10px", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        <Trash2 style={{ width: 13, height: 13 }} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderTop: "1px solid #E5E7EB" }}>
          <span style={{ fontSize: 12, color: "#6B7280" }}>
            {filtered.length === 0 ? "0" : `${(page-1)*ROWS_PER_PAGE+1}–${Math.min(page*ROWS_PER_PAGE, filtered.length)}`} of {filtered.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", cursor: page===1?"not-allowed":"pointer", opacity: page===1?0.4:1, fontSize: 13 }}>&#8249;</button>
            {pageNums.map((n, i) => (
              <button key={i} onClick={() => typeof n === "number" && setPage(n)} disabled={n === "..."}
                style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #E5E7EB", background: n===page?"#6366F1":"#fff", color: n===page?"#fff":"#374151", fontWeight: n===page?700:400, cursor: n==="..."?"default":"pointer", fontSize: 13, minWidth: 32 }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", cursor: page===totalPages?"not-allowed":"pointer", opacity: page===totalPages?0.4:1, fontSize: 13 }}>&#8250;</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6B7280" }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div style={{ padding: "20px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Category Name *", key: "name", placeholder: "e.g. Electronics" },
                { label: "Slug", key: "slug", placeholder: "auto-generated" },
                { label: "Description", key: "description", placeholder: "Brief description...", type: "textarea" },
              ].map(({ label, key, placeholder, type }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>
                  {type === "textarea" ? (
                    <textarea value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder} rows={3}
                      style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", color: "#111827", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
                  ) : (
                    <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  )}
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Parent Category</label>
                <select value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", color: "#111827", fontSize: 13, outline: "none" }}>
                  <option value="">None (Root Category)</option>
                  {categories.filter(c => !c.parentId && c.id !== editingCategory?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Image URL</label>
                <input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Active</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input type="checkbox" checked={form.showOnHome} onChange={e => setForm(f => ({ ...f, showOnHome: e.target.checked }))} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Show on Home</span>
                </label>
              </div>
            </div>
            <div style={{ padding: "16px 22px", borderTop: "1px solid #E5E7EB", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "9px 20px", borderRadius: 9, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: "9px 24px", borderRadius: 9, border: "none", background: "#6366F1", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : editingCategory ? "Save Changes" : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
