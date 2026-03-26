"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { resolveImageUrl } from "@/lib/utils";
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
  X,
  Settings,
  RefreshCw,
  CreditCard
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
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [imageSource, setImageSource] = useState<"url" | "upload">("url");
  const [videoSource, setVideoSource] = useState<"url" | "upload">("url");
  const [form, setForm] = useState<{ 
    title: string; 
    subtitle?: string; 
    mediaType: string;
    image: string; 
    videoUrl: string;
    link?: string; 
    linkText?: string; 
    position?: number; 
    isActive?: boolean 
  }>({
    title: "",
    subtitle: "",
    mediaType: "image",
    image: "",
    videoUrl: "",
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
    setError(null);
    try {
      const res = await fetch("/internal/cms/banners/manage", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data?.data || [];
        setBanners(arr);
      } else {
        const txt = await res.text();
        setError(`Failed to load banners: ${txt || res.statusText}`);
      }
    } catch (err: any) {
      setError(`Error loading banners: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedBanners = async () => {
    if (!confirm("This will restore the default promotional banners. Continue?")) return;
    setSaving(true);
    try {
      const res = await fetch("/api/cms/banners/seed", {
        method: "POST",
        credentials: "same-origin",
      });
      if (res.ok) {
        setMessage("Default banners restored successfully");
        await loadBanners();
      } else {
        const txt = await res.text();
        setError(`Failed to restore banners: ${txt}`);
      }
    } catch (err: any) {
      setError(`Error seeding banners: ${err.message}`);
    } finally {
      setSaving(false);
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
    { id: "testimonials", label: "Testimonials", icon: MessageSquare, count: sections.filter((s:any) => s.type === "testimonials" && s.isActive).length },
    { id: "wholesale", label: "Wholesale Deals", icon: Star, count: sections.filter((s:any) => s.type === "wholesale_deals" && s.isActive).length },
    { id: "credit", label: "Credit Offers", icon: CreditCard, count: sections.filter((s:any) => s.type === "credit_offers" && s.isActive).length },
    { id: "footer", label: "Footer", icon: Layout, count: 0 },
  ];

  const filteredBanners = banners.filter((b: any) => {
    return (b.title || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">CMS Management</h1>
          <p className="mt-1 text-slate-600">Manage storefront content and layout</p>
        </div>
        {activeTab === "banners" && (
          <div className="flex gap-3">
            <button
              onClick={() => handleSeedBanners()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200"
            >
              <RefreshCw className="h-4 w-4" />
              Restore Defaults
            </button>
            <button
              onClick={() => {
                setEditingBanner(null);
                setForm({ title: "", subtitle: "", mediaType: "image", image: "", videoUrl: "", link: "", linkText: "Shop Now", position: 0, isActive: true });
                setShowAdd(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add New Banner
            </button>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">{editingBanner ? "Edit Banner" : "Add New Banner"}</h2>
            <button onClick={() => setShowAdd(false)} className="text-slate-400 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
          </div>
          
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
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Media Type</label>
              <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setForm({ ...form, mediaType: "image" })}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    form.mediaType === "image" ? "bg-white text-green-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Image
                </button>
                <button
                  onClick={() => setForm({ ...form, mediaType: "video" })}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    form.mediaType === "video" ? "bg-white text-green-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Video
                </button>
              </div>
            </div>

            {form.mediaType === 'image' ? (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Image Source</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                      <button
                        onClick={() => setImageSource("url")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                          imageSource === "url" ? "bg-white text-green-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        URL Link
                      </button>
                      <button
                        onClick={() => setImageSource("upload")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                          imageSource === "upload" ? "bg-white text-green-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Upload File
                      </button>
                    </div>
                    {imageSource === "url" ? (
                      <input
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                        className="admin-input"
                        placeholder="https://... (e.g., from Cloudinary, S3, etc.)"
                      />
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSaving(true);
                              try {
                                // Create immediate local preview
                                const localUrl = URL.createObjectURL(file);
                                setForm(prev => ({ ...prev, image: localUrl }));
                                
                                // Compress and get Base64 for permanent storage
                                const base64 = await compressImage(file, 1200, 0.85);
                                setForm(prev => ({ ...prev, image: base64 }));
                                
                                // We don't revoke localUrl immediately because React might still be using it for the preview
                                // It will be cleaned up when the component unmounts or the file changes
                              } catch (err: any) {
                                setError(`Image processing failed: ${err.message}`);
                              } finally {
                                setSaving(false);
                              }
                            }
                          }}
                          className="admin-input file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                      </div>
                    )}
                  </div>
                  {form.image && (
                    <div className="h-20 w-32 relative flex-shrink-0 bg-slate-100 rounded border border-slate-200 overflow-hidden group">
                      <img src={resolveImageUrl(form.image)} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: '' })}
                        className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Video Source</label>
                <div className="flex gap-4 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
                        <button
                          onClick={() => {
                            setVideoSource("url");
                            setForm({ ...form, videoUrl: "" });
                          }}
                          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                            videoSource === "url" ? "bg-white text-green-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          URL Link
                        </button>
                        <button
                          onClick={() => {
                            setVideoSource("upload");
                            setForm({ ...form, videoUrl: "" });
                          }}
                          className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                            videoSource === "upload" ? "bg-white text-green-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          Upload File
                        </button>
                      </div>
                      {videoSource === "url" ? (
                        <input
                          value={form.videoUrl || ''}
                          onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                          className="admin-input"
                          placeholder="e.g., https://www.youtube.com/embed/..."
                        />
                      ) : (
                        <input
                          type="file"
                          accept="video/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setSaving(true);
                              try {
                                // Create immediate local preview
                                const localUrl = URL.createObjectURL(file);
                                setForm({ ...form, videoUrl: localUrl });

                                const formData = new FormData();
                                formData.append('file', file);
                                const res = await fetch('/api/upload', {
                                  method: 'POST',
                                  body: formData,
                                });
                                const data = await res.json();
                                if (data.url) {
                                  setForm({ ...form, videoUrl: data.url });
                                } else {
                                  throw new Error(data.error || "Upload failed");
                                }
                                URL.revokeObjectURL(localUrl);
                              } catch (err: any) {
                                setError(`Video upload failed: ${err.message}`);
                              } finally {
                                setSaving(false);
                              }
                            }
                          }}
                          className="admin-input file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                      )}
                  </div>
                  {form.videoUrl && (
                    <div className="h-20 w-32 relative flex-shrink-0 bg-slate-100 rounded border border-slate-200 overflow-hidden flex items-center justify-center">
                      <video src={resolveImageUrl(form.videoUrl)} className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Megaphone className="h-6 w-6 text-white" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, videoUrl: '' })}
                        className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Target URL</label>
              <input
                value={form.link || ""}
                onChange={(e) => setForm({ ...form, link: e.target.value })}
                className="admin-input"
                placeholder="/shop or full URL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Display Order</label>
              <input
                type="number"
                value={form.position || 0}
                onChange={(e) => setForm({ ...form, position: Number(e.target.value) })}
                className="admin-input"
                placeholder="0"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="inline-flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-slate-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Visible on Site</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button
              onClick={async () => {
                try {
                  setSaving(true);
                  setError(null);
                  setMessage(null);
                  const method = editingBanner ? "PUT" : "POST";
                  const url = editingBanner 
                    ? `/internal/cms/banners/${editingBanner.id}` 
                    : "/internal/cms/banners";
                    
                  const res = await fetch(url, {
                    method,
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(form),
                  });
                  const body = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(body?.error || `Failed to ${editingBanner ? 'update' : 'create'} banner`);
                  setShowAdd(false);
                  setEditingBanner(null);
                  setForm({ title: "", subtitle: "", mediaType: "image", image: "", videoUrl: "", link: "", linkText: "Shop Now", position: 0, isActive: true });
                  setMessage(`Banner ${editingBanner ? 'updated' : 'created'} successfully`);
                  await loadBanners();
                } catch (e: any) {
                  setError(e?.message || "Operation failed");
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold disabled:opacity-50 shadow-sm"
            >
              {saving ? (editingBanner ? "Updating..." : "Creating...") : (editingBanner ? "Update Banner" : "Create Banner")}
            </button>
            <button 
              onClick={() => {
                setShowAdd(false);
                setEditingBanner(null);
              }} 
              className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-semibold"
            >
              Cancel
            </button>
          </div>
          {error && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">{error}</div>}
          {message && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-lg border border-green-100">{message}</div>}
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
                        {banner.mediaType === 'video' ? (
                          banner.videoUrl ? (
                            <video src={resolveImageUrl(banner.videoUrl)} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs text-slate-400">Video</span>
                          )
                        ) : banner.image ? (
                          <img 
                            src={resolveImageUrl(banner.image)} 
                            alt={banner.title} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Broken+Link';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <ImageIcon className="h-6 w-6 text-slate-300" />
                            <span className="text-[8px] text-slate-400 uppercase font-bold mt-1">No Image</span>
                          </div>
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
                            setEditingBanner(banner);
                            setForm({
                              title: banner.title,
                              subtitle: banner.subtitle || "",
                              mediaType: banner.mediaType || "image",
                              image: banner.image || "",
                              videoUrl: banner.videoUrl || "",
                              link: banner.link || "",
                              linkText: banner.linkText || "Shop Now",
                              position: banner.position,
                              isActive: banner.isActive
                            });
                            // If it's a relative path (e.g. /uploads/...) or data:..., it's likely an upload
                            if (banner.image && (banner.image.startsWith("/") || banner.image.startsWith("data:"))) {
                              setImageSource("upload");
                            } else {
                              setImageSource("url");
                            }
                            if (banner.videoUrl && (banner.videoUrl.startsWith("/") || banner.videoUrl.startsWith("data:"))) {
                              setVideoSource("upload");
                            } else {
                              setVideoSource("url");
                            }
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
            {loading && <div className="p-4 text-sm text-slate-500">Loading banners...</div>}
            {!loading && banners.length === 0 && (
              <div className="p-8 text-center">
                <ImageIcon className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No banners found</p>
                <p className="text-sm text-slate-400 mt-1">Try clicking "Restore Defaults" to get started</p>
              </div>
            )}
            {!loading && banners.length > 0 && filteredBanners.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-500">
                No banners match your search "{searchQuery}"
              </div>
            )}
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

      {/* Credit Offers */}
      {activeTab === "credit" && (
        <div className="admin-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Credit Offers</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  const sample = [
                    { title: "iPhone 15 Pro", subtitle: "24 Months Plan", downPayment: 2500, monthlyAmount: 450 },
                    { title: "Samsung Galaxy S24", subtitle: "12 Months Plan", downPayment: 1800, monthlyAmount: 320 },
                  ];
                  const res = await fetch("/internal/admin/cms/sections", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type: "credit_offers", title: "Latest Credit Offers", isActive: true, order: 6, config: { items: sample } }),
                  });
                  if (res.ok) {
                    await loadSections();
                    alert("Credit offers section created/updated");
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
            {sections.filter((s:any) => s.type === "credit_offers").map((s:any) => (
              <div key={s.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{s.title || "Credit Offers"}</p>
                    <p className="text-sm text-slate-500">Offers: {Array.isArray(s.config?.items) ? s.config.items.length : 0}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input placeholder="Product Title" className="admin-input" id={`c-title-${s.id}`} />
                    <input placeholder="Plan Subtitle (e.g., 24 Months)" className="admin-input" id={`c-subtitle-${s.id}`} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input type="number" placeholder="Down Payment" className="admin-input" id={`c-down-${s.id}`} />
                    <input type="number" placeholder="Monthly Amount" className="admin-input" id={`c-monthly-${s.id}`} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input placeholder="Product slug (optional)" className="admin-input" id={`c-slug-${s.id}`} />
                    <input type="file" accept="image/*" id={`c-image-${s.id}`} />
                  </div>
                  <button
                    onClick={async () => {
                      const title = (document.getElementById(`c-title-${s.id}`) as HTMLInputElement).value.trim();
                      const subtitle = (document.getElementById(`c-subtitle-${s.id}`) as HTMLInputElement).value.trim();
                      const downPayment = Number((document.getElementById(`c-down-${s.id}`) as HTMLInputElement).value);
                      const monthlyAmount = Number((document.getElementById(`c-monthly-${s.id}`) as HTMLInputElement).value);
                      const slug = (document.getElementById(`c-slug-${s.id}`) as HTMLInputElement).value.trim();
                      const fileInput = document.getElementById(`c-image-${s.id}`) as HTMLInputElement;

                      if (!title || !downPayment || !monthlyAmount) {
                        alert("Please provide title, down payment and monthly amount");
                        return;
                      }

                      let image = "";
                      const file = (fileInput.files || [])[0];
                      if (file) {
                        image = await compressImage(file, 800, 0.9);
                      }

                      const items = Array.isArray(s.config?.items) ? [...s.config.items] : [];
                      items.push({ title, subtitle, downPayment, monthlyAmount, slug, image });
                      const res = await fetch(`/internal/admin/cms/sections/${s.id}`, {
                        method: "PUT",
                        credentials: "same-origin",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ config: { items } }),
                      });
                      if (res.ok) {
                        (document.getElementById(`c-title-${s.id}`) as HTMLInputElement).value = "";
                        (document.getElementById(`c-subtitle-${s.id}`) as HTMLInputElement).value = "";
                        (document.getElementById(`c-down-${s.id}`) as HTMLInputElement).value = "";
                        (document.getElementById(`c-monthly-${s.id}`) as HTMLInputElement).value = "";
                        (document.getElementById(`c-slug-${s.id}`) as HTMLInputElement).value = "";
                        if (fileInput) fileInput.value = "";
                        await loadSections();
                      }
                    }}
                    className="btn-primary"
                  >
                    Add Credit Offer
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-slate-600">
                        <th className="p-2">Image</th>
                        <th className="p-2">Title</th>
                        <th className="p-2">Down Payment</th>
                        <th className="p-2">Monthly</th>
                        <th className="p-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(Array.isArray(s.config?.items) ? s.config.items : []).map((it:any, idx:number) => (
                        <tr key={idx} className="border-t">
                          <td className="p-2">
                            <div className="h-12 w-20 rounded bg-slate-200 overflow-hidden">
                              {it.image ? <img src={resolveImageUrl(it.image)} alt={it.title} className="h-12 w-20 object-cover" /> : null}
                            </div>
                          </td>
                          <td className="p-2">{it.title}</td>
                          <td className="p-2 font-bold text-green-600">{it.downPayment}</td>
                          <td className="p-2 font-bold text-blue-600">{it.monthlyAmount}</td>
                          <td className="p-2 text-right">
                            <button
                              onClick={async () => {
                                if (!confirm("Remove this offer?")) return;
                                const items = s.config.items.filter((_:any, i:number) => i !== idx);
                                const res = await fetch(`/internal/admin/cms/sections/${s.id}`, {
                                  method: "PUT",
                                  credentials: "same-origin",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ config: { items } }),
                                });
                                if (res.ok) await loadSections();
                              }}
                              className="p-1 hover:bg-red-50 text-red-600 rounded"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {sections.filter((s:any) => s.type === "credit_offers").length === 0 && (
              <div className="text-sm text-slate-500">No credit offers yet.</div>
            )}
          </div>
        </div>
      )}

      {/* Footer Management */}
      {activeTab === "footer" && (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <Layout className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Footer Management</h2>
          <p className="text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
            Take full control of your store's footer. Manage navigation sections, individual links, 
            contact details, social media profiles, and accepted payment methods.
          </p>
          <Link href="/admin/cms/footer">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 mx-auto">
              <Settings className="h-5 w-5" />
              Open Footer Manager
            </button>
          </Link>
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
