"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Save, RefreshCw } from "lucide-react";

const DEFAULT = {
  hero: { heading: "Buy More, Save More!", subheading: "Exclusive wholesale prices on thousands of products.", ctaText: "Explore Products", ctaLink: "/shop" },
  steps: [
    { title: "Browse Products", desc: "Explore products available for wholesale" },
    { title: "Add to Quote", desc: "Add products to your quote list" },
    { title: "Submit Quote", desc: "Our team will review your request" },
    { title: "Confirm & Order", desc: "Confirm the quote and place your order" },
  ],
  features: [
    { title: "Bulk Discounts", desc: "Better prices on larger quantities" },
    { title: "Priority Shipping", desc: "Faster delivery for wholesale orders" },
    { title: "Secure Payments", desc: "Safe & encrypted transactions" },
    { title: "Dedicated Support", desc: "24/7 priority customer support" },
  ],
  quoteCta: { title: "Need a Custom Quote?", subtitle: "Contact our wholesale team for personalised pricing", ctaText: "Request Quote", ctaLink: "/contact" },
};

export default function WholesaleCMSPage() {
  const [data, setData] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"hero" | "steps" | "features" | "quote">("hero");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/site-config/wholesale", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) { const d = await res.json(); if (d?.value) setData({ ...DEFAULT, ...d.value }); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      const res = await fetch("/api/admin/cms/site-config/wholesale", {
        method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
        body: JSON.stringify({ value: data }),
      });
      if (res.ok) { setMsg("Wholesale page saved!"); setTimeout(() => setMsg(null), 3000); }
      else { const d = await res.json(); setErr(d.error || "Save failed"); }
    } finally { setSaving(false); }
  };

  const setHero = (k: string, v: string) => setData((p) => ({ ...p, hero: { ...p.hero, [k]: v } }));
  const setQuote = (k: string, v: string) => setData((p) => ({ ...p, quoteCta: { ...p.quoteCta, [k]: v } }));
  const setStep = (i: number, k: string, v: string) => setData((p) => ({ ...p, steps: p.steps.map((s, idx) => idx === i ? { ...s, [k]: v } : s) }));
  const setFeature = (i: number, k: string, v: string) => setData((p) => ({ ...p, features: p.features.map((f, idx) => idx === i ? { ...f, [k]: v } : f) }));

  const TABS = [{ id: "hero", label: "Hero" }, { id: "steps", label: "Steps" }, { id: "features", label: "Features" }, { id: "quote", label: "Quote CTA" }] as const;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/cms" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Wholesale Page</h1>
            <p className="text-slate-500 font-medium">Edit all content on the wholesale page</p>
          </div>
        </div>
        <button onClick={save} disabled={saving || loading} className="flex items-center gap-2 px-6 py-2 bg-[#1FA89A] text-white rounded-xl hover:bg-[#168a7e] font-bold text-xs uppercase tracking-widest shadow-lg shadow-[#1FA89A]/20">
          <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {msg && <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">{msg}</div>}
      {err && <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{err}</div>}

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${tab === t.id ? "bg-white text-slate-900 shadow" : "text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {!loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {tab === "hero" && (
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Hero Section</h2>
              {(["heading", "subheading", "ctaText", "ctaLink"] as const).map((k) => (
                <div key={k}>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{k}</label>
                  <input value={data.hero[k]} onChange={(e) => setHero(k, e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
                </div>
              ))}
            </div>
          )}
          {tab === "steps" && (
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">How It Works Steps</h2>
              {data.steps.map((step, i) => (
                <div key={i} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                  <p className="text-xs font-black text-slate-400 uppercase mb-3">Step {i + 1}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                      <input value={step.title} onChange={(e) => setStep(i, "title", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                      <input value={step.desc} onChange={(e) => setStep(i, "desc", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30 bg-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "features" && (
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Feature Cards</h2>
              {data.features.map((feat, i) => (
                <div key={i} className="p-4 border border-slate-100 rounded-xl bg-slate-50">
                  <p className="text-xs font-black text-slate-400 uppercase mb-3">Feature {i + 1}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Title</label>
                      <input value={feat.title} onChange={(e) => setFeature(i, "title", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30 bg-white" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                      <input value={feat.desc} onChange={(e) => setFeature(i, "desc", e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30 bg-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "quote" && (
            <div className="space-y-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Quote CTA Section</h2>
              {(["title", "subtitle", "ctaText", "ctaLink"] as const).map((k) => (
                <div key={k}>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">{k}</label>
                  <input value={data.quoteCta[k]} onChange={(e) => setQuote(k, e.target.value)} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1FA89A]/30" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {loading && <div className="flex items-center justify-center h-48 text-slate-400">Loading…</div>}
    </div>
  );
}
