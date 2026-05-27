"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  ChevronRight,
  Search, Plus, Edit, Trash2, Tag, Globe, RefreshCcw, X,
  CheckCircle2, XCircle,
} from "lucide-react";


const ROWS_PER_PAGE = 10;
const BRAND_COLORS = ["#6366F1", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444", "#22C55E", "#EC4899"];

type Brand = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  categoryId?: string;
  category?: { id: string; name: string };
};

type Category = { id: string; name: string };

export default function BrandsPage() {
  const BG = "#F5F6FA";
  const CARD = "#FFFFFF";
  const BORDER = "#E5E7EB";
  const TEXT = "#111827";
  const TEXT2 = "#4B5563";
  const TEXT3 = "#9CA3AF";
  const HOVER = "#F9FAFB";
  const HEADER_BG = "#FFFFFF";
  const ICON_BG = "#F9FAFB";
  const ACCENT = "#6366F1";

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", description: "", website: "", isActive: true, categoryId: "" });

  useEffect(() => {}, []);

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data?.data || []);
    } catch {}
  }, []);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/brands", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load brands");
      const data = await res.json();
      setBrands(Array.isArray(data) ? data : data?.data || []);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadBrands(); loadCategories(); }, [loadBrands, loadCategories]);

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setForm({ name: brand.name, slug: brand.slug, description: brand.description || "", website: brand.website || "", isActive: brand.isActive, categoryId: brand.categoryId || "" });
    } else {
      setEditingBrand(null);
      setForm({ name: "", slug: "", description: "", website: "", isActive: true, categoryId: "" });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) { alert("Please enter a brand name"); return; }
    setSaving(true);
    try {
      const url = editingBrand ? `/api/admin/brands/${editingBrand.id}` : "/api/admin/brands";
      const res = await fetch(url, { method: editingBrand ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Failed to save"); }
      await loadBrands();
      setShowModal(false);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this brand? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      await loadBrands();
    } catch (e: any) { alert(e.message); }
  };

  const handleCleanup = async () => {
    if (!confirm("Run database maintenance? This will reset brand data. Continue?")) return;
    try {
      await fetch("/api/admin/brands/cleanup-corrupted-data", { method: "POST" });
      alert("Maintenance complete.");
      await loadBrands();
    } catch (e: any) { alert(e.message); }
  };

  const active = brands.filter(b => b.isActive);
  const inactive = brands.filter(b => !b.isActive);
  const filtered = brands.filter(b => {
    const matchSearch = !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" ? b.isActive : !b.isActive);
    return matchSearch && matchStatus;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageItems = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const toggleSelect = (id: string) => setSelectedIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleAll = () => setSelectedIds(s => s.length === pageItems.length ? [] : pageItems.map(b => String(b.id)));

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };
  const pageNums = (() => {
    const nums: (number | "...")[] = [];
    if (totalPages <= 7) for (let i = 1; i <= totalPages; i++) nums.push(i);
    else if (page <= 4) { for (let i = 1; i <= 5; i++) nums.push(i); nums.push("...", totalPages); }
    else if (page >= totalPages - 3) { nums.push(1, "..."); for (let i = totalPages - 4; i <= totalPages; i++) nums.push(i); }
    else nums.push(1, "...", page - 1, page, page + 1, "...", totalPages);
    return nums;
  })();


  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Brand Management</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: "#4B5563" }}>
            <span>Home</span><span>›</span><span>Products</span><span>›</span>
            <span style={{ color: "#6366F1", fontWeight: 600 }}>Brands</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => handleOpenModal()}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", padding: "10px 20px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
            <Plus style={{ width: 15, height: 15 }} /> Add Brand
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {error}
          <button onClick={handleCleanup} style={{ border: "none", background: "transparent", color: "#EF4444", fontSize: 12, textDecoration: "underline", cursor: "pointer" }}>Run DB Maintenance</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ marginBottom: 20 }}>
        {[
          { label: "Total Brands", value: brands.length, color: "#6366F1", icon: Tag },
          { label: "Active", value: active.length, color: "#22C55E", icon: CheckCircle2 },
          { label: "Inactive", value: inactive.length, color: "#EF4444", icon: XCircle },
          { label: "Categories", value: categories.length, color: "#8B5CF6", icon: Tag },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#111827", marginTop: 4 }}>{s.value}</div>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <s.icon style={{ width: 20, height: 20, color: s.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", width: 15, height: 15 }} />
          <input value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            placeholder="Search brands..."
            style={{ width: "100%", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px 9px 36px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", color: "#374151", fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                <th style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, color: "#374151", whiteSpace: "nowrap" }}>
                  <input type="checkbox" checked={selectedIds.length === pageItems.length && pageItems.length > 0}
                    onChange={toggleAll} style={{ cursor: "pointer" }} />
                </th>
                {["Brand", "Slug", "Category", "Status", "Actions"].map(h => (
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
                        <div style={{ height: 14, borderRadius: 6, background: "#F3F4F6", width: j === 0 ? 20 : j === 1 ? 120 : 80 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>
                    No brands found.
                  </td>
                </tr>
              ) : pageItems.map((brand, idx) => (
                <tr key={brand.id} style={{ borderBottom: "1px solid #F3F4F6", background: selectedIds.includes(String(brand.id)) ? "#EEF2FF" : idx % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <input type="checkbox" checked={selectedIds.includes(String(brand.id))}
                      onChange={() => toggleSelect(String(brand.id))} style={{ cursor: "pointer" }} />
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#6366F1" }}>
                        {brand.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827" }}>{brand.name}</div>
                        {brand.website && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{brand.website}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6B7280", fontFamily: "monospace", fontSize: 12 }}>{brand.slug}</td>
                  <td style={{ padding: "12px 16px", color: "#6B7280" }}>
                    {categories.find(c => c.id === brand.categoryId)?.name || "—"}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: brand.isActive ? "#D1FAE5" : "#FEE2E2", color: brand.isActive ? "#065F46" : "#991B1B" }}>
                      {brand.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleOpenModal(brand)}
                        style={{ display: "flex", alignItems: "center", gap: 4, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 7, padding: "5px 10px", color: "#4338CA", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                        <Edit style={{ width: 13, height: 13 }} /> Edit
                      </button>
                      <button onClick={() => handleDelete(brand.id)}
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
            {filtered.length === 0 ? "0" : `${(page-1)*ROWS_PER_PAGE+1}–${Math.min(page*ROWS_PER_PAGE,filtered.length)}`} of {filtered.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
              style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", cursor: page===1?"not-allowed":"pointer", opacity: page===1?0.4:1, fontSize: 13 }}>‹</button>
            {pageNums.map((n, i) => (
              <button key={i} onClick={() => typeof n === "number" && setPage(n)} disabled={n === "..."}
                style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #E5E7EB", background: n===page?"#6366F1":"#fff", color: n===page?"#fff":"#374151", fontWeight: n===page?700:400, cursor: n==="..."?"default":"pointer", fontSize: 13, minWidth: 32 }}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
              style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", cursor: page===totalPages?"not-allowed":"pointer", opacity: page===totalPages?0.4:1, fontSize: 13 }}>›</button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 480, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>
                {editingBrand ? "Edit Brand" : "Add New Brand"}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6B7280", padding: 4 }}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div style={{ padding: "20px 22px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "Brand Name *", key: "name", placeholder: "e.g. Nike" },
                { label: "Slug", key: "slug", placeholder: "auto-generated" },
                { label: "Website URL", key: "website", placeholder: "https://..." },
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
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Category</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", color: "#111827", fontSize: 13, outline: "none" }}>
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>Active</span>
              </label>
            </div>
            <div style={{ padding: "16px 22px", borderTop: "1px solid #E5E7EB", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "9px 20px", borderRadius: 9, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                style={{ padding: "9px 24px", borderRadius: 9, border: "none", background: "#6366F1", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Saving..." : editingBrand ? "Save Changes" : "Add Brand"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
