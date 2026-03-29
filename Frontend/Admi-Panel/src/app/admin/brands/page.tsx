"use client";

import { useEffect, useState, useCallback } from "react";
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
    } catch (e: any) {
      console.error("Categories load error:", e.message);
    }
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
      const res = await fetch("/api/admin/brands/cleanup-corrupted-data", {
        method: "POST"
      });
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
      setForm({
        name: "",
        slug: "",
        description: "",
        website: "",
        isActive: true,
        categoryId: "",
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) {
      alert("Please enter a brand name");
      return;
    }

    setSaving(true);
    try {
      const url = editingBrand 
        ? `/api/admin/brands/${editingBrand.id}` 
        : "/api/admin/brands";
      
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
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Brand Management</h1>
          <p className="text-slate-500 text-sm hidden sm:block">Manage your product brands and manufacturers</p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <button onClick={loadBrands} className="btn-secondary flex items-center gap-2 min-h-[44px] px-4 py-2">
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={() => handleOpenModal()} className="btn-primary flex items-center gap-2 min-h-[44px] px-4 py-2">
            <Plus className="h-4 w-4" />
            Add Brand
          </button>
        </div>
      </div>

      <div className="admin-card overflow-hidden">
        {/* Search Bar */}
        <div className="p-3 md:p-4 border-b bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input pl-10 w-full min-h-[44px]"
            />
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left min-w-[600px]">
            <thead>
              <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50 border-b">
                <th className="px-4 md:px-6 py-3">Brand Name</th>
                <th className="px-4 md:px-6 py-3 hidden sm:table-cell">Category</th>
                <th className="px-4 md:px-6 py-3 hidden md:table-cell">Slug</th>
                <th className="px-4 md:px-6 py-3 hidden lg:table-cell">Website</th>
                <th className="px-4 md:px-6 py-3">Status</th>
                <th className="px-4 md:px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 md:px-6 py-12 text-center text-slate-500">Loading brands...</td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 md:px-6 py-12 text-center text-slate-500">No brands found.</td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                          <Tag className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate max-w-[120px] sm:max-w-[200px]">{brand.name}</p>
                          {brand.description && (
                            <p className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-[200px] sm:hidden">{brand.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden sm:table-cell">
                      {brand.category ? (
                        <span className="text-sm font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded">
                          {brand.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden md:table-cell">
                      <code className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">#{brand.slug}</code>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 hidden lg:table-cell">
                      {brand.website ? (
                        <a href={brand.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-sm">
                          <Globe className="h-3 w-3" />
                          <span className="hidden sm:inline">Visit</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      {brand.isActive ? (
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
                          onClick={() => handleOpenModal(brand)} 
                          className="p-2 md:p-2 text-slate-400 hover:text-blue-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-blue-50"
                          aria-label="Edit brand"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(brand.id)} 
                          className="p-2 md:p-2 text-slate-400 hover:text-red-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-red-50"
                          aria-label="Delete brand"
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

      {/* Modal - Full width on mobile */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="px-4 md:px-6 py-4 border-b flex items-center justify-between bg-slate-50 sticky top-0">
              <h3 className="font-bold text-slate-900">{editingBrand ? "Edit Brand" : "Add New Brand"}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Brand Name</label>
                <input
                  placeholder="e.g. Apple, Samsung, HP"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="admin-input w-full min-h-[44px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Custom Slug (Optional)</label>
                <input
                  placeholder="e.g. apple (auto-generated if empty)"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="admin-input w-full min-h-[44px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Website URL</label>
                <input
                  placeholder="https://www.example.com"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="admin-input w-full min-h-[44px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  placeholder="Brief brand overview..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="admin-input w-full h-20 md:h-24 resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Category (Where it will be listed)</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="admin-input w-full min-h-[44px]"
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500">Brands under this category will show up in the Mega Menu</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-5 h-5"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active and visible in shop</label>
              </div>
            </div>
            <div className="px-4 md:px-6 py-4 border-t bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="btn-secondary min-h-[44px] px-4 py-2">Cancel</button>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="btn-primary min-w-[100px] min-h-[44px] flex items-center justify-center"
              >
                {saving ? "Saving..." : "Save Brand"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
