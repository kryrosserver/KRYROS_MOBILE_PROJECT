"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, RefreshCw, Plus, Trash2, Save } from "lucide-react";

const ICON_OPTIONS = ["Truck", "ShieldCheck", "RefreshCcw", "Headphones", "Star", "Zap", "Gift", "Heart"];
const DEFAULT_ITEMS = [
  { icon: "Truck", title: "Free Shipping", subtitle: "On orders over $100" },
  { icon: "ShieldCheck", title: "Secure Payments", subtitle: "100% Secure" },
  { icon: "RefreshCcw", title: "Easy Returns", subtitle: "7-Day Returns" },
  { icon: "Headphones", title: "24/7 Support", subtitle: "We are here" },
];

export default function TrustBadgesPage() {
  const [items, setItems] = useState<{ icon: string; title: string; subtitle: string }[]>(DEFAULT_ITEMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/site-config/trust-badges", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        if (data?.value?.items) setItems(data.value.items);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const seed = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/cms/site-config?action=seed", { method: "POST", credentials: "same-origin" });
      await load();
      setMsg("Defaults seeded");
    } finally { setSaving(false); setTimeout(() => setMsg(null), 3000); }
  };

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/cms/site-config/trust-badges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ value: { items } }),
      });
      if (res.ok) { setMsg("Trust badges saved!"); setTimeout(() => setMsg(null), 3000); }
      else { const d = await res.json(); setErr(d.error || "Save failed"); }
    } finally { setSaving(false); }
  };

  const update = (i: number, field: string, val: string) => {
    setItems((prev) => prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item));
  };

  const addItem = () => setItems((p) => [...p, { icon: "Star", title: "New Badge", subtitle: "Description" }]);
  const removeItem = (i: number) => setItems((p) => p.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Trust Badges</h1>
            <p className="text-slate-500 font-medium">Edit the trust badges shown on the homepage</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={seed} disabled={saving} className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-bold text-xs uppercase tracking-widest">
            <RefreshCw className="h-4 w-4" /> Seed Defaults
          </button>
          <button onClick={save} disabled={saving || loading} className="flex items-center gap-2 px-6 py-2 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#1FA89A]/20">
            <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">{msg}</div>}
      {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{err}</div>}

      {loading ? (
        <div className="flex items-center justify-center h-48 text-slate-400">Loading…</div>
      ) : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Badge {i + 1}</span>
                <button onClick={() => removeItem(i)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="h-4 w-4 text-red-400" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Icon</label>
                  <select value={item.icon} onChange={(e) => update(i, "icon", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30 bg-white">
                    {ICON_OPTIONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Title</label>
                  <input value={item.title} onChange={(e) => update(i, "title", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Subtitle</label>
                  <input value={item.subtitle} onChange={(e) => update(i, "subtitle", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
                </div>
              </div>
            </div>
          ))}
          <button onClick={addItem} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-[#1FA89A] hover:text-[#1FA89A] transition-colors text-sm font-semibold">
            <Plus className="h-4 w-4" /> Add Badge
          </button>
        </div>
      )}
    </div>
  );
}
