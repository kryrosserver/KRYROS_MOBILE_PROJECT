"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Save, Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search } from "lucide-react";

const DEFAULT = { title: "KRYROS Members", subtitle: "Join and get exclusive discounts on every order", discount: "5%", ctaText: "Join Now", ctaLink: "/signup", bgColor: "#050F1A" };

export default function MembersBannerPage() {
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

  const [form, setForm] = useState(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { const res = await fetch("/api/admin/cms/site-config/members-banner", { cache: "no-store" }); if (res.ok) { const d = await res.json(); if (d?.value) setForm({ ...DEFAULT, ...d.value }); } } finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/cms/site-config/members-banner", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "members-banner", value: form }) });
      setMsg("Saved!"); setTimeout(() => setMsg(null), 2000);
    } finally { setSaving(false); }
  };

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };
  const fields = [
    { label: "Title", key: "title" }, { label: "Subtitle", key: "subtitle" },
    { label: "Discount Badge", key: "discount" }, { label: "CTA Text", key: "ctaText" },
    { label: "CTA Link", key: "ctaLink" }, { label: "Background Color", key: "bgColor" },
  ];

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: "24px" }}>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Link href="/admin/cms" style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, textDecoration: "none" }}><ArrowLeft style={{ width: 13, height: 13 }} /> Back to CMS</Link></div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Members Banner</h2>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Configure the membership promotional section</p>
            </div>
            <button onClick={handleSave} disabled={saving || loading}
              style={{ background: "#6366F1", border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {msg && <div style={{ background: "rgba(22,199,132,0.1)", border: "1px solid rgba(22,199,132,0.25)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#16C784", fontWeight: 600 }}>{msg}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div style={{ ...card, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Banner Settings</div>
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
              <div style={{ borderRadius: 12, overflow: "hidden", background: form.bgColor || "#050F1A", padding: 32, textAlign: "center" }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: "#6366F1" }}>{form.discount}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 8 }}>{form.title}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>{form.subtitle}</div>
                <div style={{ marginTop: 14, display: "inline-block", background: "#6366F1", color: "#0B1320", padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{form.ctaText}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}