"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, ToggleLeft } from "lucide-react";
import { ScaledPage } from "@/components/ScaledPage";

const DEFAULT = {
  deliveryThreshold: 100,
  freeDeliveryText: "Free delivery on orders over $100",
  pickupAvailable: true,
  pickupText: "Available at 3 pickup stations",
  creditPlansVisible: true,
  defaultCreditDurations: [3, 6, 12],
  paymentMethods: [
    { name: "MTN Money", icon: "mobile", isActive: true },
    { name: "Airtel Money", icon: "mobile", isActive: true },
    { name: "Zamtel Kwacha", icon: "mobile", isActive: true },
    { name: "Visa Card", icon: "card", isActive: true },
    { name: "Mastercard", icon: "card", isActive: true },
    { name: "Bank Transfer", icon: "bank", isActive: true },
  ],
};

export default function ProductSettingsPage() {
  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/site-config/product-settings", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) { const d = await res.json(); if (d?.value) setForm({ ...DEFAULT, ...d.value }); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      const res = await fetch("/api/admin/cms/site-config/product-settings", {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ value: form }),
      });
      if (res.ok) { setMsg("Product settings saved!"); setTimeout(() => setMsg(null), 3000); }
      else { const d = await res.json(); setErr(d.error || "Save failed"); }
    } finally { setSaving(false); }
  };

  const toggleMethod = (i: number) => setForm((p) => ({ ...p, paymentMethods: p.paymentMethods.map((m, idx) => idx === i ? { ...m, isActive: !m.isActive } : m) }));

  return (
    <ScaledPage>
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Product Settings</h1>
            <p className="text-slate-500 font-medium">Configure delivery, payments and credit plan visibility</p>
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
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-5">Delivery Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Free Delivery Threshold ($)</label>
                <input type="number" value={form.deliveryThreshold} onChange={(e) => setForm((p) => ({ ...p, deliveryThreshold: Number(e.target.value) }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Free Delivery Label</label>
                <input value={form.freeDeliveryText} onChange={(e) => setForm((p) => ({ ...p, freeDeliveryText: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Pickup Text</label>
                <input value={form.pickupText} onChange={(e) => setForm((p) => ({ ...p, pickupText: e.target.value }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <button onClick={() => setForm((p) => ({ ...p, pickupAvailable: !p.pickupAvailable }))} className={`relative w-10 h-6 rounded-full transition-colors ${form.pickupAvailable ? "bg-[#1FA89A]" : "bg-slate-200"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.pickupAvailable ? "left-5" : "left-1"}`} />
                </button>
                <span className="text-sm font-semibold text-slate-600">Pickup Available</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-5">Payment Methods</h2>
            <div className="space-y-3">
              {form.paymentMethods.map((m, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{m.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{m.icon}</p>
                  </div>
                  <button onClick={() => toggleMethod(i)} className={`relative w-10 h-6 rounded-full transition-colors ${m.isActive ? "bg-[#1FA89A]" : "bg-slate-200"}`}>
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${m.isActive ? "left-5" : "left-1"}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-5">Credit Plans</h2>
            <div className="flex items-center gap-3">
              <button onClick={() => setForm((p) => ({ ...p, creditPlansVisible: !p.creditPlansVisible }))} className={`relative w-10 h-6 rounded-full transition-colors ${form.creditPlansVisible ? "bg-[#1FA89A]" : "bg-slate-200"}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.creditPlansVisible ? "left-5" : "left-1"}`} />
              </button>
              <span className="text-sm font-semibold text-slate-600">Show Credit Plans on Product Pages</span>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Default Durations (months, comma-separated)</label>
              <input value={form.defaultCreditDurations.join(",")} onChange={(e) => setForm((p) => ({ ...p, defaultCreditDurations: e.target.value.split(",").map((v) => Number(v.trim())).filter(Boolean) }))} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
            </div>
          </div>
        </div>
      )}
    </div>
    </ScaledPage>
  );
}
