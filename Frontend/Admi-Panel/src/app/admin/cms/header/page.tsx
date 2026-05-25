"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, Plus, Trash2, GripVertical } from "lucide-react";

const DEFAULT = {
  logoText: "KRYROS",
  announcementEnabled: true,
  announcementText: "Free Delivery on all orders over $100",
  announcementCta: "Track Order",
  announcementCtaLink: "/track",
  navLinks: [
    { label: "Home", href: "/", isActive: true },
    { label: "Shop", href: "/shop", isActive: true },
    { label: "Get Now", href: "/get-now", isActive: true },
    { label: "Wholesale", href: "/wholesale", isActive: true },
    { label: "Pickup Stations", href: "/pickup-stations", isActive: true },
    { label: "About Us", href: "/about", isActive: true },
    { label: "Contact Us", href: "/contact", isActive: true },
  ],
};

export default function HeaderCMSPage() {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"announcement" | "nav">("announcement");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/site-config/header", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) { const d = await res.json(); if (d?.value) setForm({ ...DEFAULT, ...d.value }); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      const res = await fetch("/api/admin/cms/site-config/header", {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ value: form }),
      });
      if (res.ok) { setMsg("Header settings saved!"); setTimeout(() => setMsg(null), 3000); }
      else { const d = await res.json(); setErr(d.error || "Save failed"); }
    } finally { setSaving(false); }
  };

  const setNav = (i: number, k: string, v: string | boolean) => setForm((p) => ({ ...p, navLinks: p.navLinks.map((l, idx) => idx === i ? { ...l, [k]: v } : l) }));
  const addNav = () => setForm((p) => ({ ...p, navLinks: [...p.navLinks, { label: "New Link", href: "/", isActive: true }] }));
  const removeNav = (i: number) => setForm((p) => ({ ...p, navLinks: p.navLinks.filter((_, idx) => idx !== i) }));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Header & Navigation</h1>
            <p className="text-slate-500 font-medium">Edit the site header, announcement bar and nav links</p>
          </div>
        </div>
        <button onClick={save} disabled={saving || loading} className="flex items-center gap-2 px-6 py-2 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#1FA89A]/20">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">{msg}</div>}
      {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{err}</div>}

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["announcement", "nav"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${tab === t ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-700"}`}>
            {t === "announcement" ? "Announcement Bar" : "Navigation Links"}
          </button>
        ))}
      </div>

      {!loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {tab === "announcement" && (
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Announcement Bar</h2>
              <div className="flex items-center gap-3">
                <button onClick={() => setForm((p) => ({ ...p, announcementEnabled: !p.announcementEnabled }))} className={`relative w-10 h-6 rounded-full transition-colors ${form.announcementEnabled ? "bg-[#1FA89A]" : "bg-slate-200"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.announcementEnabled ? "left-5" : "left-1"}`} />
                </button>
                <span className="text-sm font-semibold text-slate-600">Announcement Bar Enabled</span>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Logo Text</label>
                <input value={form.logoText} onChange={(e) => setForm((p) => ({ ...p, logoText: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Announcement Text</label>
                <input value={form.announcementText} onChange={(e) => setForm((p) => ({ ...p, announcementText: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">CTA Text</label>
                  <input value={form.announcementCta} onChange={(e) => setForm((p) => ({ ...p, announcementCta: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">CTA Link</label>
                  <input value={form.announcementCtaLink} onChange={(e) => setForm((p) => ({ ...p, announcementCtaLink: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
                </div>
              </div>
              {form.announcementEnabled && (
                <div className="mt-2 p-3 bg-slate-900 rounded-xl flex items-center justify-between">
                  <span className="text-white text-xs"><span className="text-[#1FA89A] font-semibold">Free Delivery</span> {form.announcementText}</span>
                  <span className="text-white text-xs font-medium">{form.announcementCta} ›</span>
                </div>
              )}
            </div>
          )}

          {tab === "nav" && (
            <div className="space-y-3">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2">Navigation Links</h2>
              {form.navLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl bg-slate-50">
                  <GripVertical className="h-4 w-4 text-slate-300 flex-shrink-0" />
                  <input value={link.label} onChange={(e) => setNav(i, "label", e.target.value)} placeholder="Label" className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#1FA89A]/30" />
                  <input value={link.href} onChange={(e) => setNav(i, "href", e.target.value)} placeholder="/path" className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#1FA89A]/30" />
                  <button onClick={() => setNav(i, "isActive", !link.isActive)} className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${link.isActive ? "bg-[#1FA89A]" : "bg-slate-200"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${link.isActive ? "left-4" : "left-0.5"}`} />
                  </button>
                  <button onClick={() => removeNav(i)} className="p-1 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              ))}
              <button onClick={addNav} className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 hover:border-[#1FA89A] hover:text-[#1FA89A] transition-colors text-sm font-semibold">
                <Plus className="h-4 w-4" /> Add Link
              </button>
            </div>
          )}
        </div>
      )}
      {loading && <div className="flex items-center justify-center h-48 text-slate-400">Loading…</div>}
    </div>
  );
}
