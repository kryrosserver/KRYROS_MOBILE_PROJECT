"use client";

import { useEffect, useState } from "react";
import { 
  Image, 
  Layout, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  GripVertical,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Megaphone,
  Sparkles,
  Star,
  MessageSquare
} from "lucide-react";

const cmsData = {
  sections: [
    { id: 1, name: "Flash Sales", slug: "flash-sales", enabled: true, order: 1, products: 12 },
    { id: 2, name: "Featured Products", slug: "featured-products", enabled: true, order: 2, products: 24 },
    { id: 3, name: "Categories Grid", slug: "categories-grid", enabled: true, order: 3, products: 0 },
    { id: 4, name: "Promo Banners", slug: "promo-banners", enabled: true, order: 4, products: 0 },
    { id: 5, name: "Wholesale Deals", slug: "wholesale-deals", enabled: true, order: 5, products: 18 },
    { id: 6, name: "Credit Offers", slug: "credit-offers", enabled: true, order: 6, products: 8 },
    { id: 7, name: "Services Section", slug: "services-section", enabled: true, order: 7, products: 0 },
    { id: 8, name: "Software Products", slug: "software-products", enabled: false, order: 8, products: 15 },
    { id: 9, name: "Testimonials", slug: "testimonials", enabled: true, order: 9, products: 0 },
    { id: 10, name: "Blog Section", slug: "blog-section", enabled: true, order: 10, products: 0 },
  ],
  pages: [
    { id: 1, title: "Home", slug: "/", status: "published", template: "default" },
    { id: 2, title: "Shop", slug: "/shop", status: "published", template: "default" },
    { id: 3, title: "About Us", slug: "/about", status: "published", template: "default" },
    { id: 4, title: "Contact", slug: "/contact", status: "published", template: "default" },
    { id: 5, title: "Services", slug: "/services", status: "published", template: "default" },
    { id: 6, title: "Credit", slug: "/credit", status: "published", template: "default" },
    { id: 7, title: "Wholesale", slug: "/wholesale", status: "published", template: "default" },
    { id: 8, title: "Software", slug: "/software", status: "draft", template: "default" },
  ]
};

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState("banners");
  const [searchQuery, setSearchQuery] = useState("");
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<{ title: string; subtitle?: string; image: string; link?: string; linkText?: string; position?: number; isActive?: boolean }>({
    title: "",
    image: "",
    link: "",
    linkText: "Shop Now",
    position: 0,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/banners/manage", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBanners(Array.isArray(data) ? data : data?.data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const tabs = [
    { id: "banners", label: "Banners", icon: Image, count: banners.length },
  ];

  const filteredBanners = banners.filter((b) =>
    String(b.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CMS Management</h1>
          <p className="mt-1 text-slate-600">Manage banners for the storefront</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add New
        </button>
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="admin-input"
                placeholder="Banner title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subtitle</label>
              <input
                value={form.subtitle || ""}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="admin-input"
                placeholder="Optional subtitle"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link Text</label>
              <input
                value={form.linkText || ""}
                onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                className="admin-input"
                placeholder="Shop Now"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Image URL</label>
              <input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="admin-input"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Link</label>
              <input
                value={form.link || ""}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="admin-input"
                placeholder="/shop"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Position</label>
              <input
                type="number"
                value={form.position || 0}
                onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                className="admin-input"
                placeholder="0"
              />
            </div>
            <div className="flex items-end">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Active
              </label>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={async () => {
                try {
                  setSaving(true);
                  setError(null);
                  setMessage(null);
                  const res = await fetch("/api/cms/banners", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                  });
                  const body = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(body?.error || "Failed to create banner");
                  setShowAdd(false);
                  setForm({ title: "", image: "", link: "", linkText: "Shop Now", position: 0, isActive: true });
                  setMessage("Banner created");
                  await loadBanners();
                } catch (e: any) {
                  setError(e?.message || "Failed to create banner");
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create"}
            </button>
            <button onClick={() => setShowAdd(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={async () => {
                try {
                  setSaving(true);
                  setError(null);
                  const res = await fetch("/api/cms/banners/seed", { method: "POST" });
                  const body = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(body?.error || "Failed to seed banners");
                  setMessage("Default banners added");
                  await loadBanners();
                } catch (e: any) {
                  setError(e?.message || "Failed to add default banners");
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="btn-secondary"
            >
              Quick Add Default Banners
            </button>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          {message && <div className="text-sm text-green-600">{message}</div>}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Banners Tab */}
      {activeTab === "banners" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">
                  <GripVertical className="h-4 w-4 inline mr-2" />
                  Order
                </th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Banner</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Title</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Link</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Status</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredBanners.map((banner) => (
                <tr key={banner.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 text-sm text-slate-600">
                      <GripVertical className="h-4 w-4 cursor-move" />
                      {banner.position}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-12 w-24 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
                      <Image className="h-6 w-6 text-slate-400" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{banner.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <a href={banner.link || "/shop"} className="text-sm text-green-600 hover:underline flex items-center gap-1">
                      {banner.link || "/shop"} <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 text-sm">
                      {banner.isActive ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <ToggleRight className="h-5 w-5" /> Active
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1">
                          <ToggleLeft className="h-5 w-5" /> Inactive
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Eye className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit className="h-4 w-4 text-slate-600" />
                      </button>
                      <button
                        onClick={async () => {
                          const ok = confirm("Delete this banner?");
                          if (!ok) return;
                          const res = await fetch(`/api/cms/banners/${banner.id}`, {
                            method: "DELETE",
                          });
                          if (res.ok) {
                            await loadBanners();
                          }
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-4 text-sm text-slate-500">Loading...</div>}
          {!loading && filteredBanners.length === 0 && (
            <div className="p-4 text-sm text-slate-500">No banners found</div>
          )}
        </div>
      )}

      {/* Sections and Pages removed until real data is available */}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Megaphone className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Active Banners</p>
            <p className="text-xl font-bold text-slate-900">{banners.filter(b => b.isActive).length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Layout className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Active Sections</p>
            <p className="text-xl font-bold text-slate-900">{cmsData.sections.filter(s => s.enabled).length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Published Pages</p>
            <p className="text-xl font-bold text-slate-900">{cmsData.pages.filter(p => p.status === "published").length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <Eye className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Banner Views</p>
            <p className="text-xl font-bold text-slate-900">—</p>
          </div>
        </div>
      </div>
    </div>
  );
}
