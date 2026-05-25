"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCcw,
  Globe,
  Tag,
  CheckCircle2,
  XCircle,
  X
} from "lucide-react";

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

type Category = {
  id: string;
  name: string;
};

export default function BrandsPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(nextScale: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const naturalH = innerRef.current.scrollHeight; const visualH = naturalH * nextScale; const isMobile = window.innerWidth < 1024; const screenAvail = isMobile ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(visualH, screenAvail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? 750 : 1380; const nextScale = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${nextScale})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(nextScale))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    website: "",
    isActive: true,
    categoryId: "",
  });

  const loadCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data.filter((c: any) => c.isActive !== false));
    } catch (e: any) {}
  }, []);

  const loadBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/brands", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load brands");
      const data = await res.json();
      setBrands(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCleanup = async () => {
    if (!confirm("This will fix database inconsistencies by clearing all brand data and resetting product brand assignments. This is required because the brand system was upgraded from UUIDs to Numbers. Continue?")) return;
    try {
      const res = await fetch("/api/admin/brands/cleanup-corrupted-data", { method: "POST" });
      if (!res.ok) throw new Error("Maintenance failed");
      alert("Database maintenance complete! Your store should now load correctly. You can now re-add your brands.");
      await loadBrands();
    } catch (e: any) {
      alert(e.message);
    }
  };

  useEffect(() => {
    loadBrands();
    loadCategories();
  }, [loadBrands, loadCategories]);

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setForm({
        name: brand.name,
        slug: brand.slug,
        description: brand.description || "",
        website: brand.website || "",
        isActive: brand.isActive,
        categoryId: brand.categoryId || "",
      });
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
      const res = await fetch(url, {
        method: editingBrand ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save brand");
      }
      await loadBrands();
      setShowModal(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this brand? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete brand");
      await loadBrands();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredBrands = brands.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={outerRef} style={{ overflow: "auto", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
            Brand Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage your product brands and manufacturers
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadBrands} className="btn-secondary flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span className="inline">Refresh</span>
          </button>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Brand
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl p-4 text-sm flex items-center gap-2"
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {error}
          <button
            onClick={handleCleanup}
            className="ml-auto underline text-xs font-semibold"
          >
            Run DB Maintenance
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="admin-card !p-0 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-10 w-full"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th className="table-cell">Category</th>
                <th className="table-cell">Slug</th>
                <th className="table-cell">Website</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6}>
                      <div
                        className="h-5 rounded animate-pulse my-1 mx-2"
                        style={{ background: "var(--icon-bg)" }}
                      />
                    </td>
                  </tr>
                ))
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14" style={{ color: "var(--text-muted)" }}>
                    <Tag className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-sm">No brands found</p>
                  </td>
                </tr>
              ) : filteredBrands.map((brand) => (
                <tr key={brand.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: "var(--icon-bg)", color: "var(--text-muted)" }}
                      >
                        <Tag className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-semibold text-sm truncate max-w-[140px] max-w-[200px]"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {brand.name}
                        </p>
                        {brand.description && (
                          <p
                            className="text-xs truncate max-w-[140px] mt-0.5 "
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {brand.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    {brand.category ? (
                      <span className="badge badge-info">{brand.category.name}</span>
                    ) : (
                      <span className="text-xs italic" style={{ color: "var(--text-muted)" }}>Unassigned</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <code
                      className="text-xs px-2 py-1 rounded font-mono"
                      style={{ background: "var(--icon-bg)", color: "#12D6C5" }}
                    >
                      {brand.slug}
                    </code>
                  </td>
                  <td className="table-cell">
                    {brand.website ? (
                      <a
                        href={brand.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm font-medium"
                        style={{ color: "#12D6C5" }}
                      >
                        <Globe className="h-3.5 w-3.5" /> Visit
                      </a>
                    ) : (
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>—</span>
                    )}
                  </td>
                  <td>
                    {brand.isActive ? (
                      <span className="badge badge-success inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span
                        className="badge inline-flex items-center gap-1"
                        style={{ background: "var(--icon-bg)", color: "var(--text-muted)" }}
                      >
                        <XCircle className="h-3 w-3" /> Inactive
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenModal(brand)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#3B82F6"; e.currentTarget.style.background = "rgba(59,130,246,0.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                        title="Edit brand"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(brand.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                        title="Delete brand"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ background: "var(--modal-overlay)" }}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
            style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
          >
            {/* Modal Header */}
            <div
              className="px-6 py-4 flex items-center justify-between shrink-0"
              style={{ borderBottom: "1px solid var(--card-border)" }}
            >
              <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                {editingBrand ? "Edit Brand" : "Add New Brand"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Brand Name <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  placeholder="e.g. Apple, Samsung, HP"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Custom Slug <span className="font-normal text-xs" style={{ color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <input
                  placeholder="e.g. apple (auto-generated if empty)"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Website URL
                </label>
                <input
                  placeholder="https://www.example.com"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Description
                </label>
                <textarea
                  placeholder="Brief brand overview..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="admin-input w-full h-24 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="admin-input w-full"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Brands under this category will show up in the Mega Menu
                </p>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Active and visible in shop
                </span>
              </label>
            </div>

            {/* Modal Footer */}
            <div
              className="px-6 py-4 flex justify-end gap-3 shrink-0"
              style={{ borderTop: "1px solid var(--card-border)" }}
            >
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary min-w-[110px] flex items-center justify-center"
              >
                {saving ? "Saving..." : "Save Brand"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
      </div>
    </div>
  );
}
