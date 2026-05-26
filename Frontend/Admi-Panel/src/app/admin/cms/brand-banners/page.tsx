"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit, Save, X, Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;
type BrandBanner = { id?: string; brandSlug: string; brandName: string; tagline?: string; description?: string; bgColor?: string; bgGradient?: string; imageUrl?: string; ctaText?: string; ctaLink?: string; isActive?: boolean };
const EMPTY: BrandBanner = { brandSlug: "", brandName: "", tagline: "", description: "", bgColor: "#050F1A", bgGradient: "", imageUrl: "", ctaText: "Shop Now", ctaLink: "/shop", isActive: true };

export default function BrandBannersPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();
  const BG = "var(--bg-primary)"; const CARD = "var(--card-bg)"; const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)"; const TEXT2 = "var(--text-secondary)"; const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)"; const ICON_BG = "var(--icon-bg)";

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; outerRef.current.style.height = `${innerRef.current.scrollHeight * s}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? MOBILE_BASE : DESKTOP_BASE; if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const s = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [banners, setBanners] = useState<BrandBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<BrandBanner | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/site-config/brand-banners", { cache: "no-store" });
      if (res.ok) { const d = await res.json(); setBanners(Array.isArray(d?.value) ? d.value : []); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = editing.id ? banners.map(b => b.id === editing.id ? editing : b) : [...banners, { ...editing, id: Date.now().toString() }];
      const res = await fetch("/api/admin/cms/site-config/brand-banners", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "brand-banners", value: updated }) });
      if (res.ok) { setBanners(updated); setEditing(null); setMsg("Saved!"); setTimeout(() => setMsg(null), 2000); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id?: string) => {
    if (!id || !confirm("Delete this banner?")) return;
    const updated = banners.filter(b => b.id !== id);
    await fetch("/api/admin/cms/site-config/brand-banners", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "brand-banners", value: updated }) });
    setBanners(updated);
  };

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Brand Banners</h1>
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
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Brand Banners</h2>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Manage featured brand promotional banners — {banners.length} total</p>
            </div>
            <button onClick={() => setEditing({ ...EMPTY })}
              style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
              <Plus style={{ width: 15, height: 15 }} /> Add Banner
            </button>
          </div>

          {msg && <div style={{ background: "rgba(22,199,132,0.1)", border: "1px solid rgba(22,199,132,0.25)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#16C784", fontWeight: 600 }}>{msg}</div>}

          {editing && (
            <div style={{ ...card, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>{editing.id ? "Edit Banner" : "New Banner"}</h3>
                <button onClick={() => setEditing(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2 }}><X style={{ width: 18, height: 18 }} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14 }}>
                {[
                  { label: "Brand Slug", key: "brandSlug", ph: "apple" }, { label: "Brand Name", key: "brandName", ph: "Apple" },
                  { label: "Tagline", key: "tagline", ph: "Think Different" }, { label: "Description", key: "description", ph: "Short description" },
                  { label: "BG Color", key: "bgColor", ph: "#050F1A" }, { label: "Image URL", key: "imageUrl", ph: "https://..." },
                  { label: "CTA Text", key: "ctaText", ph: "Shop Now" }, { label: "CTA Link", key: "ctaLink", ph: "/shop/apple" },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
                    <input value={(editing as any)[f.key] || ""} onChange={e => setEditing({ ...editing, [f.key]: e.target.value })} placeholder={f.ph}
                      style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, paddingTop: 16, marginTop: 16, borderTop: `1px solid ${BORDER}` }}>
                <button onClick={handleSave} disabled={saving} style={{ background: ACCENT, border: "none", padding: "10px 24px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
                  {saving ? "Saving..." : "Save Banner"}
                </button>
                <button onClick={() => setEditing(null)} style={{ background: CARD, border: `1px solid ${BORDER}`, padding: "10px 24px", color: TEXT2, fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ ...card, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}`, background: HOVER }}>
                  {["Brand", "Tagline", "Status", "Actions"].map((h, i) => (
                    <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: i === 3 ? "right" : "left" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(3)].map((_, i) => <tr key={i}><td colSpan={4} style={{ padding: "14px 16px" }}><div style={{ height: 16, borderRadius: 6, background: HOVER }} /></td></tr>) :
                  banners.length === 0 ? <tr><td colSpan={4} style={{ padding: 48, textAlign: "center", fontSize: 13, color: TEXT2 }}>No brand banners yet</td></tr> :
                    banners.map(b => (
                      <tr key={b.id} style={{ borderBottom: `1px solid ${BORDER}` }}
                        onMouseEnter={e => e.currentTarget.style.background = HOVER}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: TEXT }}>{b.brandName}</div>
                          <div style={{ fontSize: 11, color: TEXT2, fontFamily: "monospace" }}>{b.brandSlug}</div>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: TEXT2 }}>{b.tagline || "—"}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: b.isActive ? "#16C784" : TEXT2, background: b.isActive ? "rgba(22,199,132,0.12)" : ICON_BG, padding: "3px 10px", borderRadius: 20 }}>
                            {b.isActive ? "Active" : "Hidden"}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                            <button onClick={() => setEditing(b)} style={{ padding: 8, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD, color: TEXT2, cursor: "pointer" }}><Edit style={{ width: 14, height: 14 }} /></button>
                            <button onClick={() => handleDelete(b.id)} style={{ padding: 8, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD, color: "#EF4444", cursor: "pointer" }}><Trash2 style={{ width: 14, height: 14 }} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
