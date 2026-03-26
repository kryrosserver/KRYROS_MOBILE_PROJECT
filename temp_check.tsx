"use client";

import { useEffect, useState } from "react";
import { 
  Image as ImageIcon, 
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
  MessageSquare,
  X
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
  const [sections, setSections] = useState<any[]>([]);
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
      const res = await fetch("/internal/cms/banners/manage", { cache: "no-store", credentials: "same-origin" });
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

  const loadSections = async () => {
    const res = await fetch("/internal/admin/cms/sections", { cache: "no-store", credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setSections(Array.isArray(data) ? data : data?.data || []);
    }
  };

  useEffect(() => { loadSections(); }, []);

  async function compressImage(file: File, maxWidth = 800, quality = 0.85): Promise<string> {
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

  const tabs = [
    { id: "banners", label: "Banners", icon: ImageIcon, count: banners.length },
    { id: "categories", label: "Categories Grid", icon: Layout, count: sections.find((s:any) => s.type === "categories")?.config?.items?.length || 0 },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare, count: sections.filter((s:any) => s.type === "testimonials" && s.isActive).length },
    { id: "wholesale", label: "Wholesale Deals", icon: Star, count: sections.filter((s:any) => s.type === "wholesale_deals" && s.isActive).length },
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
          <p className="mt-1 text-slate-600">Manage storefront content and layout</p>
        </div>
        {activeTab === "banners" && (
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Banner
          </button>
        )}
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
                  const res = await fetch("/internal/cms/banners", {
                    method: "POST",
                    credentials: "same-origin",
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

      {/* Banners Tab */}
      {activeTab === "banners" && (
        <div className="space-y-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search banners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
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
                        {banner.image ? (
                          <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-slate-400" />
                        )}
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
                      <button 
                        onClick={async () => {
                          const res = await fetch(`/internal/cms/banners/${banner.id}`, {
                            method: "PUT",
                            credentials: "same-origin",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ isActive: !banner.isActive }),
                          });
                          if (res.ok) await loadBanners();
                        }}
                        className="flex items-center gap-1 text-sm"
                      >
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
                        <button 
                          onClick={() => {
                            setForm({
                              title: banner.title,
                              subtitle: banner.subtitle || "",
                              image: banner.image,
                              link: banner.link || "",
                              linkText: banner.linkText || "Shop Now",
                              position: banner.position,
                              isActive: banner.isActive
                            });
                            setShowAdd(true);
                          }}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4 text-slate-600" />
                        </button>
                        <button
                          onClick={async () => {
                            const ok = confirm("Delete this banner?");
                            if (!ok) return;
                            const res = await fetch(`/internal/cms/banners/${banner.id}`, {
                              method: "DELETE",
                              credentials: "same-origin",
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
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="admin-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Homepage Categories</h2>
              <p className="text-sm text-slate-500">Select which categories appear in the "Shop by Category" section on the homepage.</p>
            </div>
            <button
              onClick={async () => {
                const res = await fetch("/internal/admin/cms/sections", {
                  method: "POST",
                  credentials: "same-origin",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ 
                    type: "categories", 
                    title: "Shop by Category", 
                    subtitle: "Browse our wide range of tech products",
                    isActive: true, 
                    order: 3, 
                    config: { items: [] } 
                  }),
                });
                if (res.ok) {
                  await loadSections();
                  alert("Categories section initialized");
                }
              }}
              className="btn-secondary"
            >
              Initialize Section
            </button>
          </div>

          <div className="space-y-6">
            {sections.filter((s:any) => s.type === "categories").map((s:any) => (
              <div key={s.id} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Title</label>
                    <input 
                      defaultValue={s.title} 
                      className="admin-input"
                      onBlur={async (e) => {
                        await fetch(`/internal/admin/cms/sections/${s.id}`, {
                          method: "PUT",
                          credentials: "same-origin",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ title: e.target.value }),
                        });
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Section Subtitle</label>
                    <input 
                      defaultValue={s.subtitle} 
                      className="admin-input"
                      onBlur={async (e) => {
                        await fetch(`/internal/admin/cms/sections/${s.id}`, {
                          method: "PUT",
                          credentials: "same-origin",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ subtitle: e.target.value }),
                        });
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 py-2 border-b">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Selected Categories</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(Array.isArray(s.config?.items) ? s.config.items : []).map((it:any, idx:number) => (
                    <div key={idx} className="relative group bg-slate-50 border border-slate-200 rounded-xl p-4 text-center">
                      <button 
                        onClick={async () => {
                          const items = [...s.config.items];
                          items.splice(idx, 1);
                          await fetch(`/internal/admin/cms/sections/${s.id}`, {
                            method: "PUT",
                            credentials: "same-origin",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ config: { items } }),
                          });
                          await loadSections();
                        }}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <div className="font-medium text-slate-900">{it.name}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-tighter">Slug: {it.slug}</div>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const name = prompt("Enter Category Name:");
                      const slug = prompt("Enter Category Slug (e.g. phones):");
                      if (name && slug) {
                        const items = Array.isArray(s.config?.items) ? [...s.config.items] : [];
                        items.push({ name, slug });
                        fetch(`/internal/admin/cms/sections/${s.id}`, {
                          method: "PUT",
                          credentials: "same-origin",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ config: { items } }),
                        }).then(() => loadSections());
                      }
                    }}
                    className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-green-500 hover:text-green-500 transition-all"
                  >
                    <Plus className="h-5 w-5 mb-1" />
                    <span className="text-xs font-bold">Add Category</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {activeTab === "testimonials" && (
        <div className="admin-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Homepage Testimonials</h2>
            <button
              onClick={async () => {
                const sample = [
                  { name: "Chanda Mwansa", comment: "Great service and prices!", rating: 5, location: "Lusaka", avatar: "" },
                  { name: "Mary Phiri", comment: "Quick delivery and friendly staff.", rating: 4, location: "Kitwe", avatar: "" },
                ];
                const res = await fetch("/internal/admin/cms/sections", {
                  method: "POST",
                  credentials: "same-origin",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ type: "testimonials", title: "What Our Customers Say", isActive: true, order: 9, config: { items: sample } }),
                });
                if (res.ok) {
                  await loadSections();
                  alert("Testimonials section created/updated");
                } else {
                  const t = await res.text();
                  alert(t || "Failed to save");
                }
              }}
              className="btn-secondary"
            >
              Quick Add Sample
            </button>
          </div>

          <div className="space-y-3">
            {sections.filter((s:any) => s.type === "testimonials").map((s:any) => (
              <div key={s.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.title || "Testimonials"}</p>
                    <p className="text-sm text-slate-500">Items: {Array.isArray(s.config?.items) ? s.config.items.length : 0}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={s.isActive}
                        onChange={async (e) => {
                          await fetch(`/internal/admin/cms/sections/${s.id}`, {
                            method: "PUT",
                            credentials: "same-origin",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ isActive: e.target.checked }),
                          });
                          await loadSections();
                        }}
                      />
                      Active
                    </label>
                    <button
                      onClick={async () => {
                        const ok = confirm("Delete this section?");
                        if (!ok) return;
                        const res = await fetch(`/internal/admin/cms/sections/${s.id}`, { method: "DELETE", credentials: "same-origin" });
                        if (res.ok) await loadSections();
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input placeholder="Customer name" className="admin-input" id={`t-name-${s.id}`} />
                    <input placeholder="Location (optional)" className="admin-input" id={`t-location-${s.id}`} />
                    <input type="number" min="1" max="5" placeholder="Rating 1-5" className="admin-input" id={`t-rating-${s.id}`} />
                  </div>
                  <textarea placeholder="Comment" className="admin-input w-full h-24 mb-3" id={`t-comment-${s.id}`} />
                  <div className="flex items-center gap-3">
                    <input type="file" accept="image/*" id={`t-avatar-${s.id}`} />
                    <button
                      onClick={async () => {
                        const name = (document.getElementById(`t-name-${s.id}`) as HTMLInputElement).value.trim();
                        const location = (document.getElementById(`t-location-${s.id}`) as HTMLInputElement).value.trim();
                        const ratingStr = (document.getElementById(`t-rating-${s.id}`) as HTMLInputElement).value.trim();
                        const comment = (document.getElementById(`t-comment-${s.id}`) as HTMLTextAreaElement).value.trim();
                        const fileInput = document.getElementById(`t-avatar-${s.id}`) as HTMLInputElement;
                        if (!name || !comment) {
                          alert("Please provide name and comment");
                          return;
                        }
                        const rating = Math.min(5, Math.max(1, Number(ratingStr || "5")));
                        let avatar = "";
                        const file = (fileInput.files || [])[0];
                        if (file) {
                          avatar = await compressImage(file, 600, 0.9);
                        }
                        const items = Array.isArray(s.config?.items) ? [...s.config.items] : [];
                        items.push({ name, comment, rating, location, avatar });
                        const res = await fetch(`/internal/admin/cms/sections/${s.id}`, {
                          method: "PUT",
                          credentials: "same-origin",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ config: { items } }),
                        });
                        if (res.ok) {
                          (document.getElementById(`t-name-${s.id}`) as HTMLInputElement).value = "";
                          (document.getElementById(`t-location-${s.id}`) as HTMLInputElement).value = "";
                          (document.getElementById(`t-rating-${s.id}`) as HTMLInputElement).value = "";
                          (document.getElementById(`t-comment-${s.id}`) as HTMLTextAreaElement).value = "";
                          if (fileInput) fileInput.value = "";
                          await loadSections();
                        } else {
                          const t = await res.text();
                          alert(t || "Failed to add testimonial");
                        }
                      }}
                      className="btn-primary"
                    >
                      Add Testimonial
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-slate-600">
                        <th className="p-2">Avatar</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Location</th>
                        <th className="p-2">Rating</th>
                        <th className="p-2">Comment</th>
                        <th className="p-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(s.config?.items) ? s.config.items : []).map((it:any, idx:number) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">
                            <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden">
                              {it.avatar ? <img src={it.avatar} alt={it.name} className="h-10 w-10 object-cover" /> : null}
                            </div>
                          </td>
                          <td className="p-2">
                            <input defaultValue={it.name} className="admin-input" id={`it-name-${s.id}-${idx}`} />
                          </td>
                          <td className="p-2">
                            <input defaultValue={it.location || ""} className="admin-input" id={`it-location-${s.id}-${idx}`} />
                          </td>
                          <td className="p-2 w-24">
                            <input type="number" min="1" max="5" defaultValue={it.rating || 5} className="admin-input" id={`it-rating-${s.id}-${idx}`} />
                          </td>
                          <td className="p-2">
                            <textarea defaultValue={it.comment} className="admin-input w-full h-16" id={`it-comment-${s.id}-${idx}`} />
                          </td>
                          <td className="p-2 text-right">
                            <button
                              onClick={async () => {
                                const items = Array.isArray(s.config?.items) ? [...s.config.items] : [];
                                items.splice(idx, 1);
                                const res = await fetch(`/internal/admin/cms/sections/${s.id}`, {
                                  method: "PUT",
                                  credentials: "same-origin",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ config: { items } }),
                                });
                                if (res.ok) await loadSections();
                              }}
                              className="btn-danger"
                            >
                              Delete
                            </button>
                            <button
                              onClick={async () => {
                                const items = Array.isArray(s.config?.items) ? [...s.config.items] : [];
                                const updated = {
                                  ...items[idx],
                                  name: (document.getElementById(`it-name-${s.id}-${idx}`) as HTMLInputElement).value,
                                  location: (document.getElementById(`it-location-${s.id}-${idx}`) as HTMLInputElement).value,
                                  rating: Number((document.getElementById(`it-rating-${s.id}-${idx}`) as HTMLInputElement).value),
                                  comment: (document.getElementById(`it-comment-${s.id}-${idx}`) as HTMLTextAreaElement).value,
                                };
                                items[idx] = updated;
                                const res = await fetch(`/internal/admin/cms/sections/${s.id}`, {
                                  method: "PUT",
                                  credentials: "same-origin",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ config: { items } }),
                                });
                                if (res.ok) await loadSections();
                              }}
                              className="btn-secondary ml-2"
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {sections.filter((s:any) => s.type === "testimonials").length === 0 && (
              <div className="text-sm text-slate-500">No testimonials section yet. Use “Quick Add Sample”.</div>
            )}
          </div>
        </div>
      )}

      {/* Wholesale Deals */}
      {activeTab === "wholesale" && (
        <div className="admin-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Wholesale Deals</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const sample = [
                    { title: "iPhone 13 (Bulk)", subtitle: "Min 10 units", price: 9999, minQty: 10 },
                    { title: "MacBook Air M2 (Bulk)", subtitle: "Min 5 units", price: 54999, minQty: 5 },
                    { title: "Samsung S24 (Bulk)", subtitle: "Min 8 units", price: 39999, minQty: 8 },
                  ];
                  const res = await fetch("/internal/admin/cms/sections", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "wholesale_deals", title: "Featured Wholesale Deals", isActive: true, order: 5, config: { items: sample } }),
                  });
                  if (res.ok) {
                    await loadSections();
                    alert("Wholesale deals section created/updated");
                  } else {
                    const t = await res.text();
                    alert(t || "Failed to save");
                  }
                }}
                className="btn-secondary"
              >
                Quick Add Sample
              </button>
              
            </div>
          </div>
          <div className="space-y-3">
            {sections.filter((s:any) => s.type === "wholesale_deals").map((s:any) => (
              <div key={s.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.title || "Wholesale Deals"}</p>
                    <p className="text-sm text-slate-500">Items: {Array.isArray(s.config?.items) ? s.config.items.length : 0}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm flex items-center gap-2">
                      <input
                        type="checkbox"
                        defaultChecked={s.isActive}
                        onChange={async (e) => {
                          await fetch(`/internal/admin/cms/sections/${s.id}`, {
                            method: "PUT",
                            credentials: "same-origin",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ isActive: e.target.checked }),
                          });
                          await loadSections();
                        }}
                      />
                      Active
                    </label>
                    <button
                      onClick={async () => {
                        const ok = confirm("Delete this section?");
                        if (!ok) return;
                        const res = await fetch(`/internal/admin/cms/sections/${s.id}`, { method: "DELETE", credentials: "same-origin" });
                        if (res.ok) await loadSections();
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input placeholder="Title" className="admin-input" id={`w-title-${s.id}`} />
                    <input placeholder="Subtitle" className="admin-input" id={`w-subtitle-${s.id}`} />
                    <input placeholder="Product slug (optional)" className="admin-input" id={`w-slug-${s.id}`} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <input type="number" min="1" step="1" placeholder="Min quantity" className="admin-input" id={`w-minqty-${s.id}`} />
                    <input type="number" min="0" step="0.01" placeholder="Wholesale price" className="admin-input" id={`w-price-${s.id}`} />
                    <input type="file" accept="image/*" id={`w-image-${s.id}`} />
                  </div>
                  <button
                    onClick={async () => {
                      const title = (document.getElementById(`w-title-${s.id}`) as HTMLInputElement).value.trim();
                      const subtitle = (document.getElementById(`w-subtitle-${s.id}`) as HTMLInputElement).value.trim();
                      const slug = (document.getElementById(`w-slug-${s.id}`) as HTMLInputElement).value.trim();
                      const minQtyStr = (document.getElementById(`w-minqty-${s.id}`) as HTMLInputElement).value.trim();
                      const priceStr = (document.getElementById(`w-price-${s.id}`) as HTMLInputElement).value.trim();
                      const fileInput = document.getElementById(`w-image-${s.id}`) as HTMLInputElement;
                      if (!title || !minQtyStr || !priceStr) {
                        alert("Please provide title, min quantity and price");
                        return;
                      }
                      const minQty = Math.max(1, Number(minQtyStr));
                      const price = Number(priceStr);
                      let image = "";
                      const file = (fileInput.files || [])[0];
                      if (file) {
                        image = await compressImage(file, 800, 0.9);
                      }
                      const items = Array.isArray(s.config?.items) ? [...s.config.items] : [];
                      items.push({ title, subtitle, minQty, price, slug, image });
                      const res = await fetch(`/internal/admin/cms/sections/${s.id}`, {
                        method: "PUT",
                        credentials: "same-origin",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ config: { items } }),
                      });
                      if (res.ok) {
                        (document.getElementById(`w-title-${s.id}`) as HTMLInputElement).value = "";
                        (document.getElementById(`w-subtitle-${s.id}`) as HTMLInputElement).value = "";
                        (document.getElementById(`w-slug-${s.id}`) as HTMLInputElement).value = "";
                        (document.getElementById(`w-minqty-${s.id}`) as HTMLInputElement).value = "";
                        (document.getElementById(`w-price-${s.id}`) as HTMLInputElement).value = "";
                        if (fileInput) fileInput.value = "";
                        await loadSections();
                      } else {
                        const t = await res.text();
                        alert(t || "Failed to add wholesale deal");
                      }
                    }}
                    className="btn-primary"
                  >
                    Add Wholesale Deal
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-slate-600">
                        <th className="p-2">Image</th>
                        <th className="p-2">Title</th>
                        <th className="p-2">Subtitle</th>
                        <th className="p-2">Slug</th>
                        <th className="p-2">Min Qty</th>
                        <th className="p-2">Price</th>
                        <th className="p-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(s.config?.items) ? s.config.items : []).map((it:any, idx:number) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">
                            <div className="h-12 w-20 rounded bg-slate-200 overflow-hidden">
                              {it.image ? <img src={it.image} alt={it.title} className="h-12 w-20 object-cover" /> : null}
                            </div>
                          </td>
                          <td className="p-2">
                            <input defaultValue={it.title} className="admin-input" id={`wd-title-${s.id}-${idx}`} />
                          </td>
                          <td className="p-2">
                            <input defaultValue={it.subtitle || ""} className="admin-input" id={`wd-subtitle-${s.id}-${idx}`} />
                          </td>
                          <td className="p-2">
                            <input defaultValue={it.slug || ""} className="admin-input" id={`wd-slug-${s.id}-${idx}`} />
                          </td>
                          <td className="p-2 w-24">
                            <input type="number" min="1" defaultValue={it.minQty || 1} className="admin-input" id={`wd-min-${s.id}-${idx}`} />
                          </td>
                          <td className="p-2 w-32">
                            <input type="number" min="0" step="0.01" defaultValue={it.price || 0} className="admin-input" id={`wd-price-${s.id}-${idx}`} />
                          </td>
                          <td className="p-2 text-right">
                            <button
                              onClick={async () => {
                                const items = Array.isArray(s.config?.items) ? [...s.config.items] : [];
                                items.splice(idx, 1);
                                const res = await fetch(`/internal/admin/cms/sections/${s.id}`, {
                                  method: "PUT",
                                  credentials: "same-origin",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ config: { items } }),
                                });
                                if (res.ok) await loadSections();
                              }}
                              className="btn-danger"
                            >
                              Delete
                            </button>
                            <button
                              onClick={async () => {
                                const items = Array.isArray(s.config?.items) ? [...s.config.items] : [];
                                const updated = {
                                  ...items[idx],
                                  title: (document.getElementById(`wd-title-${s.id}-${idx}`) as HTMLInputElement).value,
                                  subtitle: (document.getElementById(`wd-subtitle-${s.id}-${idx}`) as HTMLInputElement).value,
                                  slug: (document.getElementById(`wd-slug-${s.id}-${idx}`) as HTMLInputElement).value,
                                  minQty: Number((document.getElementById(`wd-min-${s.id}-${idx}`) as HTMLInputElement).value),
                                  price: Number((document.getElementById(`wd-price-${s.id}-${idx}`) as HTMLInputElement).value),
                                };
                                items[idx] = updated;
                                const res = await fetch(`/internal/admin/cms/sections/${s.id}`, {
                                  method: "PUT",
                                  credentials: "same-origin",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ config: { items } }),
                                });
                                if (res.ok) await loadSections();
                              }}
                              className="btn-secondary ml-2"
                            >
                              Save
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {sections.filter((s:any) => s.type === "wholesale_deals").length === 0 && (
              <div className="text-sm text-slate-500">No wholesale deals section yet. Use “Quick Add Sample”.</div>
            )}
          </div>
        </div>
      )}

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
