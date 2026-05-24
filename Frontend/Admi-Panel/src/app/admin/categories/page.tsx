"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCcw,
  LayoutGrid,
  CheckCircle2,
  XCircle,
  X,
  ChevronRight,
  Sparkles
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  showOnHome: boolean;
  parentId?: string;
  children?: Category[];
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [cmsSection, setCmsSection] = useState<any>(null);
  const [updatingCms, setUpdatingCms] = useState(false);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    parentId: "",
    isActive: true,
    showOnHome: false,
  });
  const [file, setFile] = useState<File | null>(null);

  async function compressImage(file: File, maxWidth = 800, quality = 0.8): Promise<string> {
    const blobURL = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = blobURL;
    });
    const scale = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(blobURL);
    return canvas.toDataURL("image/jpeg", quality);
  }

  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/categories", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load categories");
      const data = await res.json();
      setCategories(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCmsSection = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cms/sections");
      if (res.ok) {
        const sections = await res.json();
        const catSection = (sections.data || sections).find((s: any) => s.type === "categories");
        setCmsSection(catSection);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    loadCategories();
    loadCmsSection();
  }, [loadCategories, loadCmsSection]);

  const handleUpdateCms = async (field: string, value: string) => {
    if (!cmsSection) return;
    setUpdatingCms(true);
    try {
      const res = await fetch(`/api/admin/cms/sections/${cmsSection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (res.ok) setCmsSection({ ...cmsSection, [field]: value });
    } catch (e) {
    } finally {
      setUpdatingCms(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    setFile(null);
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        parentId: category.parentId || "",
        isActive: category.isActive,
        showOnHome: category.showOnHome || false,
      });
    } else {
      setEditingCategory(null);
      setForm({ name: "", slug: "", description: "", image: "", parentId: "", isActive: true, showOnHome: false });
    }
    setShowModal(true);
  };

  const handleToggleHome = async (category: Category) => {
    try {
      const res = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnHome: !category.showOnHome }),
      });
      if (res.ok) await loadCategories();
    } catch (e) {}
  };

  const handleSave = async () => {
    if (!form.name) { alert("Please enter a category name"); return; }
    setSaving(true);
    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
      const payload = { ...form, parentId: form.parentId || null };
      const res = await fetch(url, {
        method: editingCategory ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to save category");
      }
      await loadCategories();
      setShowModal(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? Products in this category might become unassigned.")) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete category");
      await loadCategories();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Category Management
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Organize your products into logical categories
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadCategories} className="btn-secondary flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {error}
        </div>
      )}

      {/* CMS Section Settings */}
      {cmsSection && (
        <div
          className="admin-card p-5"
          style={{ borderColor: "rgba(22,199,132,0.25)", background: "rgba(22,199,132,0.04)" }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
              style={{ background: "rgba(22,199,132,0.15)", color: "#16C784" }}
            >
              <Sparkles className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                Homepage "Shop by Category" Settings
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                Customize how categories appear on the storefront homepage
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Section Title</label>
              <input
                defaultValue={cmsSection.title}
                onBlur={(e) => handleUpdateCms("title", e.target.value)}
                className="admin-input w-full"
                placeholder="e.g. Shop by Category"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Section Subtitle</label>
              <input
                defaultValue={cmsSection.subtitle}
                onBlur={(e) => handleUpdateCms("subtitle", e.target.value)}
                className="admin-input w-full"
                placeholder="e.g. Browse our wide range of tech products"
              />
            </div>
          </div>

          <div
            className="mt-4 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            style={{ background: "rgba(22,199,132,0.06)", border: "1px solid rgba(22,199,132,0.15)" }}
          >
            <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Showing{" "}
              <span className="font-bold" style={{ color: "#16C784" }}>
                {categories.filter(c => c.showOnHome).length}
              </span>{" "}
              categories on the homepage.
            </div>
            <div className="text-xs italic" style={{ color: "var(--text-muted)" }}>
              {updatingCms ? "Saving..." : "Auto-saved on blur"}
            </div>
          </div>
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
              placeholder="Search categories..."
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
                <th>Category</th>
                <th className="hidden sm:table-cell">Slug</th>
                <th className="hidden md:table-cell">Parent</th>
                <th className="text-center">Homepage</th>
                <th className="text-center">Status</th>
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
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-14" style={{ color: "var(--text-muted)" }}>
                    <LayoutGrid className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="font-semibold text-sm">No categories found</p>
                  </td>
                </tr>
              ) : filteredCategories.map((category) => (
                <tr key={category.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                        style={{
                          background: "var(--icon-bg)",
                          color: "var(--text-muted)",
                          border: "1px solid var(--card-border)"
                        }}
                      >
                        {category.image ? (
                          <img src={category.image} alt={category.name} className="h-full w-full object-contain p-1" />
                        ) : (
                          <LayoutGrid className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-semibold text-sm truncate max-w-[110px] sm:max-w-[180px]"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {category.name}
                        </p>
                        {category.description && (
                          <p
                            className="text-xs truncate max-w-[110px] mt-0.5 sm:hidden"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell">
                    <code
                      className="text-xs px-2 py-1 rounded font-mono break-all"
                      style={{ background: "var(--icon-bg)", color: "#12D6C5" }}
                    >
                      {category.slug}
                    </code>
                  </td>
                  <td className="hidden md:table-cell">
                    {category.parentId ? (
                      <div className="flex items-center gap-1 text-sm" style={{ color: "var(--text-secondary)" }}>
                        <ChevronRight className="h-3 w-3 shrink-0" style={{ color: "var(--text-muted)" }} />
                        <span className="truncate max-w-[100px]">
                          {categories.find(c => c.id === category.parentId)?.name || "Parent"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>Root</span>
                    )}
                  </td>
                  <td className="text-center">
                    <button
                      onClick={() => handleToggleHome(category)}
                      className="p-1.5 rounded-xl flex items-center justify-center mx-auto transition-all"
                      title={category.showOnHome ? "Remove from Homepage" : "Show on Homepage"}
                      style={category.showOnHome
                        ? { background: "rgba(22,199,132,0.15)", color: "#16C784" }
                        : { background: "var(--icon-bg)", color: "var(--text-muted)" }
                      }
                    >
                      <Sparkles className={`h-4 w-4 ${category.showOnHome ? "fill-current" : ""}`} />
                    </button>
                  </td>
                  <td className="text-center">
                    {category.isActive ? (
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
                        onClick={() => handleOpenModal(category)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#3B82F6"; e.currentTarget.style.background = "rgba(59,130,246,0.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                        title="Edit category"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                        title="Delete category"
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
              className="px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-10"
              style={{ borderBottom: "1px solid var(--card-border)", background: "var(--card-bg)" }}
            >
              <h3 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                {editingCategory ? "Edit Category" : "Add New Category"}
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
              {/* Image Preview & Upload */}
              <div
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-xl"
                style={{ background: "var(--hover-bg)", border: "1px solid var(--card-border)" }}
              >
                <div
                  className="h-16 w-16 rounded-xl flex items-center justify-center overflow-hidden shrink-0"
                  style={{ background: "var(--card-bg)", border: "1px solid var(--card-border)" }}
                >
                  {form.image ? (
                    <img src={form.image} alt="Preview" className="h-full w-full object-contain p-1" />
                  ) : (
                    <LayoutGrid className="h-8 w-8" style={{ color: "var(--text-muted)" }} />
                  )}
                </div>
                <div className="flex-1 w-full">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider mb-1"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Category Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const compressed = await compressImage(f);
                        setForm({ ...form, image: compressed });
                        setFile(f);
                      }
                    }}
                    className="text-sm w-full file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:cursor-pointer"
                    style={{ color: "var(--text-secondary)" }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Category Name <span style={{ color: "#EF4444" }}>*</span>
                </label>
                <input
                  placeholder="e.g. Phones, Laptops, Accessories"
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
                  placeholder="e.g. phones (auto-generated if empty)"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Parent Category <span className="font-normal text-xs" style={{ color: "var(--text-muted)" }}>(optional)</span>
                </label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="admin-input w-full"
                >
                  <option value="">None (Root Category)</option>
                  {categories
                    .filter(c => c.id !== editingCategory?.id && !c.parentId)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  }
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Description
                </label>
                <textarea
                  placeholder="Brief category overview..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="admin-input w-full h-20 resize-none"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Active</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="showOnHome"
                    checked={form.showOnHome}
                    onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>Show on Homepage</span>
                </label>
              </div>
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
                className="btn-primary min-w-[130px] flex items-center justify-center"
              >
                {saving ? "Saving..." : "Save Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
