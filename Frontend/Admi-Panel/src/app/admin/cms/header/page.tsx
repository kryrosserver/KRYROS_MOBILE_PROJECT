"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Save, Plus, Trash2, Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search } from "lucide-react";

const DEFAULT = { logoText: "KRYROS", announcementEnabled: true, announcementText: "Free Delivery on all orders over $100", announcementCta: "Track Order", announcementCtaLink: "/track", navLinks: [{ label: "Home", href: "/", isActive: true }, { label: "Shop", href: "/shop", isActive: true }, { label: "Get Now", href: "/get-now", isActive: true }, { label: "Wholesale", href: "/wholesale", isActive: true }] };

export default function HeaderCMSPage() {
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
  const [tab, setTab] = useState<"announcement" | "nav">("announcement");

  useEffect(() => {
    (async () => {
      try { const res = await fetch("/api/admin/cms/site-config/header-config", { cache: "no-store" }); if (res.ok) { const d = await res.json(); if (d?.value) setForm({ ...DEFAULT, ...d.value }); } } finally { setLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/admin/cms/site-config/header-config", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "header-config", value: form }) });
      setMsg("Saved!"); setTimeout(() => setMsg(null), 2000);
    } finally { setSaving(false); }
  };

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };
  const tabs = [{ id: "announcement", label: "Announcement" }, { id: "nav", label: "Navigation" }];

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: "24px" }}>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Link href="/admin/cms" style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, textDecoration: "none" }}><ArrowLeft style={{ width: 13, height: 13 }} /> Back to CMS</Link></div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Header Configuration</h2>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Configure the storefront header navigation and announcement</p>
            </div>
            <button onClick={handleSave} disabled={saving || loading}
              style={{ background: "#6366F1", border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
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

          {tab === "announcement" && (
            <div style={{ ...card, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #E5E7EB" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Announcement Bar</span>
                <button onClick={() => setForm({ ...form, announcementEnabled: !form.announcementEnabled })}
                  style={{ width: 44, height: 24, borderRadius: 12, border: "none", background: form.announcementEnabled ? "#6366F1" : ICON_BG, cursor: "pointer", position: "relative" }}>
                  <span style={{ position: "absolute", top: 3, left: form.announcementEnabled ? 23 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s" }} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {[
                  { label: "Logo Text", key: "logoText" }, { label: "Announcement Text", key: "announcementText" },
                  { label: "CTA Text", key: "announcementCta" }, { label: "CTA Link", key: "announcementCtaLink" },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
                    <input value={(form as any)[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      style={{ width: "100%", background: ICON_BG, border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "nav" && (
            <div style={{ ...card, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>Navigation Links</span>
                <button onClick={() => setForm({ ...form, navLinks: [...form.navLinks, { label: "New Link", href: "/", isActive: true }] })}
                  style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: "1px solid #E5E7EB", borderRadius: 8, padding: "7px 12px", color: TEXT2, fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
                  <Plus style={{ width: 13, height: 13 }} /> Add Link
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {form.navLinks.map((link, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: HOVER, borderRadius: 10, border: "1px solid #E5E7EB" }}>
                    <input value={link.label} onChange={e => { const n = [...form.navLinks]; n[idx] = { ...n[idx], label: e.target.value }; setForm({ ...form, navLinks: n }); }} placeholder="Label"
                      style={{ flex: 1, background: CARD, border: "1px solid #E5E7EB", borderRadius: 8, padding: "7px 10px", color: TEXT, fontSize: 13, outline: "none" }} />
                    <input value={link.href} onChange={e => { const n = [...form.navLinks]; n[idx] = { ...n[idx], href: e.target.value }; setForm({ ...form, navLinks: n }); }} placeholder="/path"
                      style={{ flex: 1, background: CARD, border: "1px solid #E5E7EB", borderRadius: 8, padding: "7px 10px", color: TEXT, fontSize: 13, outline: "none" }} />
                    <button onClick={() => { const n = [...form.navLinks]; n[idx] = { ...n[idx], isActive: !n[idx].isActive }; setForm({ ...form, navLinks: n }); }}
                      style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${link.isActive ? "#6366F1" : BORDER}`, background: link.isActive ? `#6366F115` : CARD, color: link.isActive ? "#6366F1" : TEXT2, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                      {link.isActive ? "Active" : "Hidden"}
                    </button>
                    <button onClick={() => setForm({ ...form, navLinks: form.navLinks.filter((_, i) => i !== idx) })} style={{ padding: 7, borderRadius: 8, border: "1px solid #E5E7EB", background: CARD, color: "#EF4444", cursor: "pointer" }}>
                      <Trash2 style={{ width: 13, height: 13 }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}