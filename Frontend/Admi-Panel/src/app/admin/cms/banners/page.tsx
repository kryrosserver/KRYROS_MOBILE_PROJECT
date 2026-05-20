"use client";

import { useEffect, useState } from "react";
import { resolveImageUrl } from "@/lib/utils";
import { 
  Image as ImageIcon, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  RefreshCw,
  PlayCircle,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
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

  useEffect(() => {
    loadBanners();
  }, []);

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Hero Banners</h1>
            <p className="text-slate-500 font-medium">Manage your homepage promotional banners</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => handleSeedBanners()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors font-bold text-xs uppercase tracking-widest border border-slate-100"
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
            className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] transition-all font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#1FA89A]/20"
          >
            <Plus className="h-3.5 w-3.5" />
            New Banner
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 mb-8 shadow-xl shadow-slate-200/20 animate-in zoom-in-95 duration-300 text-left">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              {editingBanner ? "Edit Banner" : "Create New Banner"}
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

      {/* Banners List */}
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
            {banners.map((banner) => (
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
    </div>
  );
}