"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Plus, Trash2, Edit, RefreshCw, X } from "lucide-react";

type BrandBanner = {
  id?: string;
  brandSlug: string;
  brandName: string;
  tagline?: string;
  description?: string;
  bgColor?: string;
  bgGradient?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive?: boolean;
};

const EMPTY: BrandBanner = { brandSlug: "", brandName: "", tagline: "", description: "", bgColor: "#050F1A", bgGradient: "", imageUrl: "", ctaText: "Shop Now", ctaLink: "/shop", isActive: true };

export default function BrandBannersPage() {
  const [banners, setBanners] = useState<BrandBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState<BrandBanner | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/brand-banners", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) setBanners(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const seed = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/cms/brand-banners?action=seed", { method: "POST", credentials: "same-origin" });
      await load(); setMsg("Defaults seeded"); setTimeout(() => setMsg(null), 3000);
    } finally { setSaving(false); }
  };

  const saveBanner = async () => {
    if (!editing) return;
    setSaving(true); setErr(null);
    try {
      const res = editing.id
        ? await fetch(`/api/admin/cms/brand-banners/${editing.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(editing) })
        : await fetch("/api/admin/cms/brand-banners", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin", body: JSON.stringify(editing) });
      if (res.ok) { setMsg("Banner saved!"); setTimeout(() => setMsg(null), 3000); setEditing(null); await load(); }
      else { const d = await res.json(); setErr(d.error || "Save failed"); }
    } finally { setSaving(false); }
  };

  const deleteBanner = async (id: string) => {
    if (!confirm("Delete this brand banner?")) return;
    const res = await fetch(`/api/admin/cms/brand-banners/${id}`, { method: "DELETE", credentials: "same-origin" });
    if (res.ok) { await load(); setMsg("Deleted"); setTimeout(() => setMsg(null), 2000); }
  };

  const set = (k: string, v: string | boolean) => setEditing((p) => p ? { ...p, [k]: v } : p);

  const fields: { key: keyof BrandBanner; label: string; type?: string }[] = [
    { key: "brandSlug", label: "Brand Slug (e.g. apple)" },
    { key: "brandName", label: "Brand Name" },
    { key: "tagline", label: "Tagline" },
    { key: "description", label: "Description" },
    { key: "bgColor", label: "Background Color (hex)" },
    { key: "bgGradient", label: "Background Gradient (CSS)" },
    { key: "imageUrl", label: "Image URL" },
    { key: "ctaText", label: "CTA Button Text" },
    { key: "ctaLink", label: "CTA Link" },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Brand Banners</h1>
            <p className="text-slate-500 font-medium">Manage per-brand hero banners for the shop page</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={seed} disabled={saving} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs uppercase tracking-widest">
            <RefreshCw className="h-4 w-4" /> Seed Defaults
          </button>
          <button onClick={() => setEditing({ ...EMPTY })} className="flex items-center gap-2 px-5 py-2 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#1FA89A]/20">
            <Plus className="h-4 w-4" /> Add Banner
          </button>
        </div>
      </div>

      {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">{msg}</div>}
      {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{err}</div>}

      {editing && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="font-black text-slate-900 uppercase text-sm tracking-widest">{editing.id ? "Edit" : "Add"} Brand Banner</h2>
              <button onClick={() => setEditing(null)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {fields.map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">{label}</label>
                  <input value={(editing[key] as string) || ""} onChange={(e) => set(key, e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
                </div>
              ))}
              <div className="flex items-center gap-3 pt-1">
                <button onClick={() => set("isActive", !editing.isActive)} className={`relative w-10 h-6 rounded-full transition-colors ${editing.isActive ? "bg-[#1FA89A]" : "bg-slate-200"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${editing.isActive ? "left-5" : "left-1"}`} />
                </button>
                <span className="text-sm font-semibold text-slate-600">Active</span>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-slate-100">
              <button onClick={() => setEditing(null)} className="flex-1 py-2 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={saveBanner} disabled={saving} className="flex-1 py-2 bg-[#1FA89A] text-white rounded-xl text-sm font-bold hover:bg-[#168a7e]">{saving ? "Saving…" : "Save Banner"}</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Loading…</div>
      ) : banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-3">
          <p className="text-sm">No brand banners yet. Add one or seed defaults.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-black text-slate-900">{b.brandName}</p>
                  <p className="text-xs text-slate-400 font-mono">{b.brandSlug}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(b)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Edit className="h-4 w-4 text-slate-500" /></button>
                  <button onClick={() => b.id && deleteBanner(b.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-400" /></button>
                </div>
              </div>
              <div className="rounded-xl p-3 text-white text-xs" style={{ background: b.bgGradient || b.bgColor || "#050F1A" }}>
                <p className="font-black">{b.tagline || b.brandName}</p>
                <p className="text-white/50 mt-0.5">{b.description}</p>
              </div>
              <div className={`mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${b.isActive ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                {b.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
