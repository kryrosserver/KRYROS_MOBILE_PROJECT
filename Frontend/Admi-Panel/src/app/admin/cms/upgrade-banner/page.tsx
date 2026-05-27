"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { RefreshCw, Save, Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search } from "lucide-react";

const DEFAULT = { heading: "Upgrade Your Tech Game", subtitle: "Unbeatable performance. Unmatched style.", ctaText: "Shop Now", ctaLink: "/shop", discountText: "30%", discountSubtext: "OFF", bgImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85" };

export default function UpgradeBannerPage() {
  const BG = "#F5F6FA";
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

  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { const res = await fetch("/api/admin/cms/site-config/upgrade-banner", { cache: "no-store" }); if (res.ok) { const d = await res.json(); if (d?.value) setForm({ ...DEFAULT, ...d.value }); } } finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/cms/site-config/upgrade-banner", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "upgrade-banner", value: form }) });
      setMsg("Saved!"); setTimeout(() => setMsg(null), 2000);
    } finally { setSaving(false); }
  };

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };
  const fields = [
    { label: "Heading", key: "heading" }, { label: "Subtitle", key: "subtitle" },
    { label: "CTA Text", key: "ctaText" }, { label: "CTA Link", key: "ctaLink" },
    { label: "Discount Text", key: "discountText" }, { label: "Discount Subtext", key: "discountSubtext" },
    { label: "Background Image URL", key: "bgImage" },
  ];

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: "24px" }}>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Link href="/admin/cms" style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, textDecoration: "none" }}><ArrowLeft style={{ width: 13, height: 13 }} /> Back to CMS</Link></div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Upgrade Banner</h2>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Configure the promotional upgrade section on your homepage</p>
            </div>
            <button onClick={handleSave} disabled={saving || loading}
              style={{ background: "#6366F1", border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {msg && <div style={{ background: "rgba(22,199,132,0.1)", border: "1px solid rgba(22,199,132,0.25)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#16C784", fontWeight: 600 }}>{msg}</div>}

          {loading ? <div style={{ padding: "48px 0", textAlign: "center", color: TEXT2 }}><RefreshCw style={{ width: 28, height: 28, margin: "0 auto 10px", opacity: 0.3 }} /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div style={{ ...card, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Banner Content</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {fields.map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
                      <input value={(form as any)[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        style={{ width: "100%", background: ICON_BG, border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...card, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Preview</div>
                <div style={{ borderRadius: 12, overflow: "hidden", position: "relative", minHeight: 200, background: "#050F1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {form.bgImage && <img src={form.bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }} />}
                  <div style={{ position: "relative", textAlign: "center", padding: 24 }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: "#6366F1" }}>{form.discountText} <span style={{ fontSize: 16 }}>{form.discountSubtext}</span></div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 8 }}>{form.heading}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>{form.subtitle}</div>
                    <div style={{ marginTop: 14, display: "inline-block", background: "#6366F1", color: "#0B1320", padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{form.ctaText}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}