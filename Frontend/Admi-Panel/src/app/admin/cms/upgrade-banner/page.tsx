"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { RefreshCw, Save, Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";
const DEFAULT = { heading: "Upgrade Your Tech Game", subtitle: "Unbeatable performance. Unmatched style.", ctaText: "Shop Now", ctaLink: "/shop", discountText: "30%", discountSubtext: "OFF", bgImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=85" };

export default function UpgradeBannerPage() {
  const { isDark, toggleTheme } = useTheme();
  const BG = "var(--bg-primary)"; const CARD = "var(--card-bg)"; const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)"; const TEXT2 = "var(--text-secondary)"; const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)"; const ICON_BG = "var(--icon-bg)";

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

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };
  const fields = [
    { label: "Heading", key: "heading" }, { label: "Subtitle", key: "subtitle" },
    { label: "CTA Text", key: "ctaText" }, { label: "CTA Link", key: "ctaLink" },
    { label: "Discount Text", key: "discountText" }, { label: "Discount Subtext", key: "discountSubtext" },
    { label: "Background Image URL", key: "bgImage" },
  ];

  return (
    <div style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Upgrade Banner</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search..." style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: ICON_BG, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} /><span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>{isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}</button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 14px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} /> May 20 – May 26, 2025 <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320" }}>K</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1 }}>Admin</div><div style={{ fontSize: 10, color: TEXT2, marginTop: 1 }}>Super Admin</div></div>
              <ChevronDown style={{ width: 14, height: 14, color: TEXT2 }} />
            </div>
          </div>
        </header>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Link href="/admin/cms" style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, textDecoration: "none" }}><ArrowLeft style={{ width: 13, height: 13 }} /> Back to CMS</Link></div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Upgrade Banner</h2>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Configure the promotional upgrade section on your homepage</p>
            </div>
            <button onClick={handleSave} disabled={saving || loading}
              style={{ background: ACCENT, border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {msg && <div style={{ background: "rgba(22,199,132,0.1)", border: "1px solid rgba(22,199,132,0.25)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#16C784", fontWeight: 600 }}>{msg}</div>}

          {loading ? <div style={{ padding: "48px 0", textAlign: "center", color: TEXT2 }}><RefreshCw style={{ width: 28, height: 28, margin: "0 auto 10px", opacity: 0.3 }} /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">>
              <div style={{ ...card, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Banner Content</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {fields.map(f => (
                    <div key={f.key}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
                      <input value={(form as any)[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...card, padding: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 16 }}>Preview</div>
                <div style={{ borderRadius: 12, overflow: "hidden", position: "relative", minHeight: 200, background: "#050F1A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {form.bgImage && <img src={form.bgImage} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.3 }} />}
                  <div style={{ position: "relative", textAlign: "center", padding: 24 }}>
                    <div style={{ fontSize: 32, fontWeight: 900, color: ACCENT }}>{form.discountText} <span style={{ fontSize: 16 }}>{form.discountSubtext}</span></div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginTop: 8 }}>{form.heading}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 6 }}>{form.subtitle}</div>
                    <div style={{ marginTop: 14, display: "inline-block", background: ACCENT, color: "#0B1320", padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 700 }}>{form.ctaText}</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}