"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save } from "lucide-react";

const DEFAULT = {
  title: "KRYROS Members",
  subtitle: "Join and get exclusive discounts on every order",
  discount: "5%",
  ctaText: "Join Now",
  ctaLink: "/signup",
  bgColor: "#050F1A",
};

export default function MembersBannerPage() {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/site-config/members-banner", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) { const d = await res.json(); if (d?.value) setForm({ ...DEFAULT, ...d.value }); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      const res = await fetch("/api/admin/cms/site-config/members-banner", {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ value: form }),
      });
      if (res.ok) { setMsg("Members banner saved!"); setTimeout(() => setMsg(null), 3000); }
      else { const d = await res.json(); setErr(d.error || "Save failed"); }
    } finally { setSaving(false); }
  };

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const fields: { key: keyof typeof DEFAULT; label: string }[] = [
    { key: "title", label: "Banner Title" },
    { key: "subtitle", label: "Subtitle" },
    { key: "discount", label: "Discount Text (e.g. 5%)" },
    { key: "ctaText", label: "Button Text" },
    { key: "ctaLink", label: "Button Link" },
    { key: "bgColor", label: "Background Color (hex)" },
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Members Banner</h1>
            <p className="text-slate-500 font-medium">Edit the members section in the shop page</p>
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
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-5">Members Banner Settings</h2>
          <div className="grid grid-cols-2 gap-4">
            {fields.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{label}</label>
                <input value={form[key]} onChange={(e) => set(key, e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: form.bgColor || "#050F1A" }}>
            <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Preview</p>
            <p className="text-white font-black text-lg">{form.title}</p>
            <p className="text-white/60 text-xs mb-2">{form.subtitle}</p>
            <p className="text-[#1FA89A] font-black text-2xl">{form.discount} OFF</p>
          </div>
        </div>
      )}
    </div>
  );
}
