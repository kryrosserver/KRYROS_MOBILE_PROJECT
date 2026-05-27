"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Save, Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search } from "lucide-react";

const DEFAULT = {
  hero: { heading: "Buy More, Save More!", subheading: "Exclusive wholesale prices on thousands of products.", ctaText: "Explore Products", ctaLink: "/shop" },
  steps: [{ title: "Browse Products", desc: "Explore products available for wholesale" }, { title: "Add to Quote", desc: "Add products to your quote list" }, { title: "Submit Quote", desc: "Our team will review your request" }, { title: "Confirm & Order", desc: "Confirm the quote and place your order" }],
  features: [{ title: "Bulk Discounts", desc: "Better prices on larger quantities" }, { title: "Priority Shipping", desc: "Faster delivery for wholesale orders" }, { title: "Secure Payments", desc: "Safe & encrypted transactions" }, { title: "Dedicated Support", desc: "24/7 priority customer support" }],
  quoteCta: { title: "Need a Custom Quote?", subtitle: "Contact our wholesale team for personalised pricing", ctaText: "Request Quote", ctaLink: "/contact" },
};

export default function WholesaleCMSPage() {
  const BG = "#F8F9FA";
  const CARD = "#FFFFFF";
  const BORDER = "#E5E7EB";
  const TEXT = "#111827";
  const TEXT2 = "#4B5563";
  const TEXT3 = "#9CA3AF";
  const HOVER = "#F9FAFB";
  const HEADER_BG = "#FFFFFF";
  const ICON_BG = "#F9FAFB";
  const ACCENT = "#6366F1";
  useEffect(() => {}, []);

  const [data, setData] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [tab, setTab] = useState<"hero" | "steps" | "features" | "quote">("hero");

  useEffect(() => {
    (async () => {
      try { const res = await fetch("/api/admin/cms/site-config/wholesale-page", { cache: "no-store" }); if (res.ok) { const d = await res.json(); if (d?.value) setData({ ...DEFAULT, ...d.value }); } } finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/cms/site-config/wholesale-page", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "wholesale-page", value: data }) });
      setMsg("Saved!"); setTimeout(() => setMsg(null), 2000);
    } finally { setSaving(false); }
  };

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };
  const tabs = [{ id: "hero", label: "Hero Section" }, { id: "steps", label: "Steps" }, { id: "features", label: "Features" }, { id: "quote", label: "Quote CTA" }];

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: "24px" }}>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Link href="/admin/cms" style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, textDecoration: "none" }}><ArrowLeft style={{ width: 13, height: 13 }} /> Back to CMS</Link></div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Wholesale Page CMS</h2><p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Configure the wholesale landing page content</p></div>
            <button onClick={handleSave} disabled={saving || loading} style={{ background: "#6366F1", border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>{saving ? "Saving..." : "Save Changes"}</button>
          </div>

          {msg && <div style={{ background: "rgba(22,199,132,0.1)", border: "1px solid rgba(22,199,132,0.25)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#16C784", fontWeight: 600 }}>{msg}</div>}

          <div style={{ display: "flex", gap: 8 }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                style={{ padding: "8px 16px", borderRadius: 10, border: `1px solid ${tab === t.id ? "#6366F1" : BORDER}`, background: tab === t.id ? `#6366F115` : CARD, color: tab === t.id ? "#6366F1" : TEXT2, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "hero" && (
            <div style={{ ...card, padding: 24 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[{ label: "Heading", key: "heading" }, { label: "Subheading", key: "subheading" }, { label: "CTA Text", key: "ctaText" }, { label: "CTA Link", key: "ctaLink" }].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
                    <input value={(data.hero as any)[f.key] || ""} onChange={e => setData({ ...data, hero: { ...data.hero, [f.key]: e.target.value } })}
                      style={{ width: "100%", background: ICON_BG, border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {(tab === "steps" || tab === "features") && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(tab === "steps" ? data.steps : data.features).map((item, idx) => (
                <div key={idx} style={{ ...card, padding: 18, display: "flex", gap: 14 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: `#6366F118`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#6366F1", flexShrink: 0 }}>{idx + 1}</div>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-3" style={{flex: 1}}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Title</div>
                      <input value={item.title} onChange={e => { const arr = [...(tab === "steps" ? data.steps : data.features)]; arr[idx] = { ...arr[idx], title: e.target.value }; setData(tab === "steps" ? { ...data, steps: arr } : { ...data, features: arr }); }}
                        style={{ width: "100%", background: ICON_BG, border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.06em" }}>Description</div>
                      <input value={item.desc} onChange={e => { const arr = [...(tab === "steps" ? data.steps : data.features)]; arr[idx] = { ...arr[idx], desc: e.target.value }; setData(tab === "steps" ? { ...data, steps: arr } : { ...data, features: arr }); }}
                        style={{ width: "100%", background: ICON_BG, border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "quote" && (
            <div style={{ ...card, padding: 24 }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[{ label: "Title", key: "title" }, { label: "Subtitle", key: "subtitle" }, { label: "CTA Text", key: "ctaText" }, { label: "CTA Link", key: "ctaLink" }].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
                    <input value={(data.quoteCta as any)[f.key] || ""} onChange={e => setData({ ...data, quoteCta: { ...data.quoteCta, [f.key]: e.target.value } })}
                      style={{ width: "100%", background: ICON_BG, border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}