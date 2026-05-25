"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, RefreshCw, Save, ImageIcon } from "lucide-react";

const DEFAULT = {
  heading: "Upgrade Your Tech Game",
  subtitle: "Unbeatable performance. Unmatched style.",
  ctaText: "Shop Now",
  ctaLink: "/shop",
  discountText: "30%",
  discountSubtext: "OFF",
  bgImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85",
};

export default function UpgradeBannerPage() {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/site-config/upgrade-banner", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) { const d = await res.json(); if (d?.value) setForm({ ...DEFAULT, ...d.value }); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      const res = await fetch("/api/admin/cms/site-config/upgrade-banner", {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ value: form }),
      });
      if (res.ok) { setMsg("Upgrade banner saved!"); setTimeout(() => setMsg(null), 3000); }
      else { const d = await res.json(); setErr(d.error || "Save failed"); }
    } finally { setSaving(false); }
  };

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const fields: { key: keyof typeof DEFAULT; label: string; placeholder?: string }[] = [
    { key: "heading", label: "Heading" },
    { key: "subtitle", label: "Subtitle" },
    { key: "ctaText", label: "CTA Button Text" },
    { key: "ctaLink", label: "CTA Link", placeholder: "/shop" },
    { key: "discountText", label: "Discount Text (e.g. 30%)" },
    { key: "discountSubtext", label: "Discount Subtext (e.g. OFF)" },
    { key: "bgImage", label: "Background Image URL" },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Upgrade Banner</h1>
            <p className="text-slate-500 font-medium">Edit the promotional upgrade banner on the homepage</p>
          </div>
        </div>
        <button onClick={save} disabled={saving || loading} className="flex items-center gap-2 px-6 py-2 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#1FA89A]/20">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">{msg}</div>}
      {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{err}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-5">Banner Content</h2>
            <div className="grid grid-cols-2 gap-4">
              {fields.map(({ key, label, placeholder }) => (
                <div key={key} className={key === "bgImage" ? "col-span-2" : ""}>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
                  <input value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder || ""} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
                </div>
              ))}
            </div>
          </div>

          {form.bgImage && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Preview</h2>
              <div className="relative rounded-xl overflow-hidden" style={{ height: 140 }}>
                <img src={form.bgImage} alt="preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <div className="absolute inset-0" style={{ background: "linear-gradient(100deg, rgba(5,15,30,0.92) 0%, rgba(5,20,40,0.70) 55%, rgba(5,40,40,0.28) 100%)" }} />
                <div className="absolute inset-0 flex items-center justify-between px-5">
                  <div>
                    <p className="text-white font-black text-base">{form.heading}</p>
                    <p className="text-white/60 text-xs">{form.subtitle}</p>
                    <div className="mt-2 inline-block px-3 py-1.5 bg-teal-500 text-white rounded-lg text-xs font-bold">{form.ctaText}</div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-white/50 uppercase tracking-widest">Up to</p>
                    <p className="text-4xl font-black text-teal-400">{form.discountText}</p>
                    <p className="text-xl font-black text-teal-400 -mt-1">{form.discountSubtext}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
