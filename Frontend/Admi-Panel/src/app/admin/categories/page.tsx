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
    parentId: "",
    isActive: true,
    showOnHome: false,
  });

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
    } catch (e) {
      console.error("Failed to load CMS section", e);
    }
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
      if (res.ok) {
        setCmsSection({ ...cmsSection, [field]: value });
      }
    } catch (e) {
      console.error("Failed to update CMS section", e);
    } finally {
      setUpdatingCms(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        parentId: category.parentId || "",
        isActive: category.isActive,
        showOnHome: category.showOnHome || false,
      });
    } else {
      setEditingCategory(null);
      setForm({
        name: "",
        slug: "",
        description: "",
        parentId: "",
        isActive: true,
        showOnHome: false,
      });
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
    } catch (e) {
      console.error("Failed to toggle home status", e);
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      alert("Please enter a category name");
      return;
    }

    setSaving(true);
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}` 
        : "/api/admin/categories";
      
      const payload = {
        ...form,
        parentId: form.parentId || null
      };

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Category Management</h1>
          <p className="text-slate-500">Organize your products into logical categories</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadCategories} className="btn-secondary flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </button>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Homepage CMS Section Settings */}
      {cmsSection && (
        <div className="admin-card p-6 bg-green-50/50 border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <Sparkles className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Homepage "Shop by Category" Settings</h2>
              <p className="text-sm text-slate-500">Customize how categories appear on the storefront homepage</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Section Title</label>
              <input
                defaultValue={cmsSection.title}
                onBlur={(e) => handleUpdateCms("title", e.target.value)}
                className="admin-input w-full bg-white"
                placeholder="e.g. Shop by Category"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Section Subtitle</label>
              <input
                defaultValue={cmsSection.subtitle}
                onBlur={(e) => handleUpdateCms("subtitle", e.target.value)}
                className="admin-input w-full bg-white"
                placeholder="e.g. Browse our wide range of tech products"
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white/50 rounded-lg border border-green-100/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Currently showing <span className="font-bold text-green-600">{categories.filter(c => c.showOnHome).length}</span> categories on the homepage.
              </div>
              <div className="text-xs text-slate-400 italic">
                {updatingCms ? "Saving changes..." : "Auto-saved on blur"}
              </div>
            </div>

            {/* Legacy Cleanup Notice */}
            {cmsSection.config?.items && Array.isArray(cmsSection.config.items) && cmsSection.config.items.length > 0 && (
              <div className="p-2.5 bg-amber-50 border border-amber-100 rounded text-xs text-amber-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>You have <b>{cmsSection.config.items.length}</b> legacy categories from the old CMS page still active.</span>
                </div>
                <button 
                  onClick={async () => {
                    if (confirm("Clear legacy homepage categories? This will only show the categories you've marked with a sparkle below.")) {
                      setUpdatingCms(true);
                      try {
                        const res = await fetch(`/api/admin/cms/sections/${cmsSection.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ config: { items: [] } }),
                        });
                        if (res.ok) setCmsSection({ ...cmsSection, config: { items: [] } });
                      } catch (e) { console.error(e); } finally { setUpdatingCms(false); }
                    }
                  }}
                  className="px-2 py-1 bg-white border border-amber-200 rounded hover:bg-amber-100 transition-colors font-medium"
                >
                  Clear Legacy Items
                </button>
              </div>
            )}

            <div className="text-[11px] text-slate-500 bg-slate-100/50 p-2 rounded border border-slate-200/50">
              <span className="font-bold text-slate-700">How to add/remove categories:</span> Scroll down to the category table and click the <b>Sparkle (✨)</b> icon in the <b>Homepage</b> column to toggle visibility on the storefront.
            </div>
          </div>
        </div>
      )}

      <div className="admin-card overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-10 w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b">
                <th className="px-6 py-3">Category Name</th>
                <th className="px-6 py-3">Slug</th>
                <th className="px-6 py-3">Parent</th>
                <th className="px-6 py-3 text-center">Show on Home</th>
                <th className="px-6 py-3 text-center">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading categories...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No categories found.</td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                          <LayoutGrid className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-slate-500 truncate max-w-[200px]">{category.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">{category.slug}</code>
                    </td>
                    <td className="px-6 py-4">
                      {category.parentId ? (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <ChevronRight className="h-3 w-3 text-slate-400" />
                          {categories.find(c => c.id === category.parentId)?.name || "Parent"}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">Root</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleHome(category)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          category.showOnHome 
                            ? "bg-green-100 text-green-600 hover:bg-green-200" 
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                        title={category.showOnHome ? "Remove from Homepage" : "Show on Homepage"}
                      >
                        <Sparkles className={`h-4 w-4 ${category.showOnHome ? "fill-current" : ""}`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {category.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                          <XCircle className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(category)} className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(category.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900">{editingCategory ? "Edit Category" : "Add New Category"}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Category Name</label>
                <input
                  placeholder="e.g. Phones, Laptops, Accessories"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Custom Slug (Optional)</label>
                <input
                  placeholder="e.g. phones (auto-generated if empty)"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Parent Category (Optional)</label>
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
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  placeholder="Brief category overview..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="admin-input w-full h-24"
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showOnHome"
                    checked={form.showOnHome}
                    onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showOnHome" className="text-sm font-medium text-slate-700">Show on Homepage</label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn-primary min-w-[100px]"
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
