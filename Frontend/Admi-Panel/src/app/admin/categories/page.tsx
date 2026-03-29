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
      setForm({
        name: "",
        slug: "",
        description: "",
        image: "",
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
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Category Management</h1>
          <p className="text-slate-500 text-sm hidden sm:block">Organize your products into logical categories</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={loadCategories} className="btn-secondary flex items-center gap-2 min-h-[44px] px-4 py-2">
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 min-h-[44px] px-4 py-2">
            <Plus className="h-4 w-4" />
            Add Category
          </button>
        </div>
      </div>

      {/* Homepage CMS Section Settings */}
      {cmsSection && (
        <div className="admin-card p-4 md:p-6 bg-green-50/50 border-green-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
              <Sparkles className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-slate-900">Homepage "Shop by Category" Settings</h2>
              <p className="text-sm text-slate-500 hidden sm:block">Customize how categories appear on the storefront homepage</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Section Title</label>
              <input
                defaultValue={cmsSection.title}
                onBlur={(e) => handleUpdateCms("title", e.target.value)}
                className="admin-input w-full bg-white min-h-[44px]"
                placeholder="e.g. Shop by Category"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Section Subtitle</label>
              <input
                defaultValue={cmsSection.subtitle}
                onBlur={(e) => handleUpdateCms("subtitle", e.target.value)}
                className="admin-input w-full bg-white min-h-[44px]"
                placeholder="e.g. Browse our wide range of tech products"
              />
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-white/50 rounded-lg border border-green-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-sm text-slate-600">
              Showing <span className="font-bold text-green-600">{categories.filter(c => c.showOnHome).length}</span> categories on the homepage.
            </div>
            <div className="text-xs text-slate-400 italic">
              {updatingCms ? "Saving..." : "Auto-saved on blur"}
            </div>
          </div>
        </div>
      )}

      {/* Categories Table Card */}
      <div className="admin-card overflow-hidden">
        {/* Search Bar */}
        <div className="p-3 md:p-4 border-b bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-10 w-full min-h-[44px]"
            />
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b">
                <th className="px-4 md:px-6 py-3">Category</th>
                <th className="px-4 md:px-6 py-3 hidden sm:table-cell">Slug</th>
                <th className="px-4 md:px-6 py-3 hidden md:table-cell">Parent</th>
                <th className="px-4 md:px-6 py-3 text-center">Home</th>
                <th className="px-4 md:px-6 py-3 text-center">Status</th>
                <th className="px-4 md:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 md:px-6 py-12 text-center text-slate-500">Loading categories...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 md:px-6 py-12 text-center text-slate-500">No categories found.</td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 md:h-10 w-9 md:w-10 rounded bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border border-slate-200 shrink-0">
                          {category.image ? (
                            <img src={category.image} alt={category.name} className="h-full w-full object-contain p-1" />
                          ) : (
                            <LayoutGrid className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate max-w-[100px] sm:max-w-[180px]">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-slate-500 truncate max-w-[100px] sm:max-w-[180px] sm:hidden">{category.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 break-all">{category.slug}</code>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      {category.parentId ? (
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[100px]">{categories.find(c => c.id === category.parentId)?.name || "Parent"}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm">Root</span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                      <button
                        onClick={() => handleToggleHome(category)}
                        className={`p-1.5 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                          category.showOnHome 
                            ? "bg-green-100 text-green-600 hover:bg-green-200" 
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                        title={category.showOnHome ? "Remove from Homepage" : "Show on Homepage"}
                        aria-label={category.showOnHome ? "Remove from Homepage" : "Show on Homepage"}
                      >
                        <Sparkles className={`h-4 w-4 ${category.showOnHome ? "fill-current" : ""}`} />
                      </button>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-center">
                      {category.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                          <CheckCircle2 className="h-3 w-3" />
                          <span className="hidden xs:inline">Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                          <XCircle className="h-3 w-3" />
                          <span className="hidden xs:inline">Inactive</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                      <div className="flex items-center justify-end gap-1 md:gap-2">
                        <button 
                          onClick={() => handleOpenModal(category)} 
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-blue-50"
                          aria-label="Edit category"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)} 
                          className="p-2 text-slate-400 hover:text-red-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-red-50"
                          aria-label="Delete category"
                        >
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-4 md:px-6 py-4 border-b flex items-center justify-between bg-slate-50 sticky top-0 z-10">
              <h3 className="font-bold text-slate-900">{editingCategory ? "Edit Category" : "Add New Category"}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {/* Image Preview & Upload */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="h-16 w-16 rounded bg-white border flex items-center justify-center overflow-hidden shrink-0">
                  {form.image ? (
                    <img src={form.image} alt="Preview" className="h-full w-full object-contain p-1" />
                  ) : (
                    <LayoutGrid className="h-8 w-8 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Category Image</label>
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
                    className="text-sm text-slate-600 w-full file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 min-h-[44px]"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Category Name</label>
                <input
                  placeholder="e.g. Phones, Laptops, Accessories"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="admin-input w-full min-h-[44px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Custom Slug (Optional)</label>
                <input
                  placeholder="e.g. phones (auto-generated if empty)"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="admin-input w-full min-h-[44px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Parent Category (Optional)</label>
                <select
                  value={form.parentId}
                  onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                  className="admin-input w-full min-h-[44px]"
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
                  className="admin-input w-full h-20 resize-none"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showOnHome"
                    checked={form.showOnHome}
                    onChange={(e) => setForm({ ...form, showOnHome: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                  />
                  <label htmlFor="showOnHome" className="text-sm font-medium text-slate-700">Show on Homepage</label>
                </div>
              </div>
            </div>
            <div className="px-4 md:px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary min-h-[44px] px-4 py-2">Cancel</button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn-primary min-w-[120px] min-h-[44px] flex items-center justify-center"
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
