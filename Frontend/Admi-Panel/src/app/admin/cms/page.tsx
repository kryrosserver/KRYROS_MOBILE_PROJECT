"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { resolveImageUrl } from "@/lib/utils";
import { 
  Image as ImageIcon, 
  Layout, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Settings,
  RefreshCw,
  Filter,
  Megaphone,
  Sparkles,
  MessageSquare,
  PlayCircle,
  Play
} from "lucide-react";

export default function CMSPage() {
  const [activeTab, setActiveTab] = useState("banners");
  const [searchQuery, setSearchQuery] = useState("");
  const [banners, setBanners] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [footerConfig, setFooterConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [form, setForm] = useState<{ 
    title: string; 
    subtitle?: string; 
    mediaType: string;
    image: string; 
    videoUrl: string;
    link?: string; 
    linkText?: string; 
    position?: number; 
    duration?: number;
    displayDays?: number;
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

  const loadFooterConfig = async () => {
    try {
      const res = await fetch("/api/admin/cms/footer/config", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setFooterConfig(data);
      }
    } catch (err) {
      console.error("Failed to load footer config:", err);
    }
  };

  const loadBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/internal/cms/banners/manage", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data?.data || [];
        setBanners(arr);
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
      }
    } catch (err: any) {
      setError(`Error seeding banners: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const loadSections = async () => {
    const res = await fetch("/internal/admin/cms/sections", { cache: "no-store", credentials: "same-origin" });
    if (res.ok) {
      const data = await res.json();
      setSections(Array.isArray(data) ? data : data?.data || []);
    }
  };

  useEffect(() => {
    loadBanners();
    loadFooterConfig();
    loadSections();
  }, []);

  const tabs = [
    { id: "banners", label: "Hero Banners", icon: ImageIcon, count: banners.length },
    { id: "homepage", label: "Home Sections", icon: Layout, count: 0 },
    { id: "shop_filters", label: "Shop Fast Filters", icon: Filter, count: sections.filter((s:any) => s.type === "fast_filters" && s.isActive).length },
    { id: "announcement", label: "Announcement Bar", icon: Megaphone, count: footerConfig?.announcementBarEnabled ? 1 : 0 },
    { id: "newsletter", label: "Newsletter Popup", icon: Sparkles, count: footerConfig?.newsletterPopupEnabled ? 1 : 0 },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare, count: sections.filter((s:any) => s.type === "testimonials" && s.isActive).length },
    { id: "footer", label: "Footer Links", icon: Layout, count: 0 },
  ];

  const filteredBanners = banners.filter((b: any) => {
    return (b.title || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Content Management</h1>
        <p className="text-slate-500 font-medium">Select a section to manage your storefront layout</p>
      </div>

      {/* Modern Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative flex flex-col p-6 rounded-[2rem] border-2 transition-all duration-300 text-left overflow-hidden ${
              activeTab === tab.id
                ? "border-[#1FA89A] bg-white shadow-xl shadow-[#1FA89A]/10"
                : "border-slate-100 bg-white hover:border-[#1FA89A]/30 hover:shadow-lg shadow-sm"
            }`}
          >
            <div className={`mb-4 p-4 rounded-2xl w-fit transition-colors ${
              activeTab === tab.id ? "bg-[#1FA89A] text-white" : "bg-slate-50 text-slate-400 group-hover:bg-[#1FA89A] group-hover:text-white"
            }`}>
              <tab.icon className="h-6 w-6" />
            </div>
            
            <div className="flex justify-between items-start mb-2">
              <h3 className={`font-black uppercase tracking-tight text-lg ${
                activeTab === tab.id ? "text-slate-900" : "text-slate-600 group-hover:text-slate-900"
              }`}>
                {tab.label}
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                activeTab === tab.id ? "bg-[#1FA89A]/10 text-[#1FA89A]" : "bg-slate-100 text-slate-400"
              }`}>
                {tab.count} Items
              </span>
            </div>
            
            <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
              Configure and manage your {tab.label.toLowerCase()} content, visibility, and display order.
            </p>

            {activeTab === tab.id && (
              <div className="absolute top-6 right-6 h-2 w-2 rounded-full bg-[#1FA89A] animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="mt-12 pt-8 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 text-left">
            <div className="p-2 bg-[#1FA89A]/10 rounded-lg">
              {(() => {
                const activeTabInfo = tabs.find(t => t.id === activeTab);
                const TabIcon = activeTabInfo ? activeTabInfo.icon : ImageIcon;
                return <TabIcon className="h-5 w-5 text-[#1FA89A]" />;
              })()}
            </div>
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Managing: {tabs.find(t => t.id === activeTab)?.label}
            </h2>
          </div>

          {activeTab === "banners" && (
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleSeedBanners()}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors font-bold text-xs uppercase tracking-widest border border-slate-100"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Restore Defaults
              </button>
              <button
                onClick={() => {
                  setEditingBanner(null);
                  setForm({ title: "", subtitle: "", mediaType: "image", image: "", videoUrl: "", link: "", linkText: "Shop Now", position: 0, duration: undefined, displayDays: undefined, isActive: true });
                  setShowAdd(true);
                }}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#1FA89A]/20"
              >
                <Plus className="h-3.5 w-3.5" />
                New Banner
              </button>
            </div>
          )}
        </div>

        {showAdd && (
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 mb-8 shadow-xl shadow-slate-200/20 animate-in zoom-in-95 duration-300 text-left">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                {editingBanner ? "Edit Content" : "Create New Content"}
              </h2>
              <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                  placeholder="Banner title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtitle</label>
                <input
                  value={form.subtitle || ""}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                  placeholder="Optional subtitle"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Link Text</label>
                <input
                  value={form.linkText || ""}
                  onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                  className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                  placeholder="Shop Now"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Media Type</label>
                <div className="flex gap-2 p-1 bg-slate-50 rounded-xl border-2 border-slate-100">
                  <button
                    onClick={() => setForm({ ...form, mediaType: "image" })}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                      form.mediaType === "image" ? "bg-white text-[#1FA89A] shadow-sm" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Image
                  </button>
                  <button
                    onClick={() => setForm({ ...form, mediaType: "video" })}
                    className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-lg transition-all ${
                      form.mediaType === "video" ? "bg-white text-[#1FA89A] shadow-sm" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Video
                  </button>
                </div>
              </div>

              {form.mediaType === 'image' ? (
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Image Source</label>
                  <input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value.trim() })}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                    placeholder="https://... (Image URL)"
                  />
                </div>
              ) : (
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Video Source</label>
                  <input
                    value={form.videoUrl}
                    onChange={(e) => setForm({ ...form, videoUrl: e.target.value.trim() })}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-medium text-slate-900"
                    placeholder="https://... (Video URL)"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-50">
              <button
                onClick={async () => {
                  try {
                    setSaving(true);
                    const method = editingBanner ? "PUT" : "POST";
                    const url = editingBanner ? `/internal/cms/banners/${editingBanner.id}` : "/internal/cms/banners";
                    const res = await fetch(url, {
                      method,
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(form),
                    });
                    if (res.ok) {
                      setShowAdd(false);
                      loadBanners();
                    }
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
                className="px-8 py-3 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] transition-all font-black uppercase tracking-widest text-xs shadow-lg shadow-[#1FA89A]/20"
              >
                {saving ? "Saving..." : (editingBanner ? "Update Banner" : "Save Banner")}
              </button>
              <button 
                onClick={() => { setShowAdd(false); setEditingBanner(null); }} 
                className="px-8 py-3 bg-slate-50 text-slate-500 rounded-xl hover:bg-slate-100 transition-all font-black uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tab Content Display */}
        {activeTab === "banners" && (
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl shadow-slate-200/30 overflow-hidden text-left">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Banner</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Details</th>
                  <th className="text-left px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="text-right px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredBanners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <div className="h-16 w-32 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                        {banner.mediaType === 'video' ? (
                          <div className="h-full w-full flex items-center justify-center bg-slate-900"><PlayCircle className="h-6 w-6 text-white" /></div>
                        ) : (
                          <img src={resolveImageUrl(banner.image)} className="h-full w-full object-cover" alt="" />
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-black text-slate-900 uppercase tracking-tight mb-1">{banner.title}</p>
                      <p className="text-xs text-slate-400 font-medium">{banner.link || "No link set"}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        banner.isActive ? "bg-green-50 text-green-600 border border-green-100" : "bg-slate-100 text-slate-400"
                      }`}>
                        {banner.isActive ? "Active" : "Hidden"}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => { setEditingBanner(banner); setForm({ ...banner }); setShowAdd(true); }}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-[#1FA89A] hover:bg-[#1FA89A]/10 rounded-xl transition-all"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={async () => { if (confirm("Delete?")) { await fetch(`/internal/cms/banners/${banner.id}`, { method: "DELETE" }); loadBanners(); } }}
                          className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
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
        )}

        {activeTab === "homepage" && (
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 p-12 text-center shadow-xl shadow-slate-200/20">
            <div className="mx-auto w-24 h-24 bg-[#1FA89A]/10 rounded-3xl flex items-center justify-center mb-6">
              <Layout className="h-12 w-12 text-[#1FA89A]" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">Homepage Structure</h2>
            <p className="text-slate-500 mb-8 max-w-lg mx-auto font-medium">
              Rearrange sections, manage category sliders, and customize featured product grids for your main storefront.
            </p>
            <Link href="/admin/cms/homepage">
              <button className="px-10 py-4 bg-[#1FA89A] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#168a7e] transition-all shadow-lg shadow-[#1FA89A]/20 flex items-center gap-3 mx-auto">
                <Settings className="h-5 w-5" />
                Open Layout Designer
              </button>
            </Link>
          </div>
        )}

        {(activeTab !== "banners" && activeTab !== "homepage") && (
          <div className="bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Content management for this section is coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
