"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { resolveImageUrl } from "@/lib/utils";
import {
  Image as ImageIcon, Plus, Edit, Trash2, X, RefreshCw, PlayCircle,
  Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";

export default function BannersPage() {
  const { isDark, toggleTheme } = useTheme();

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";

  useEffect(() => {}, []);

  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [form, setForm] = useState<any>({ title: "", subtitle: "", mediaType: "image", image: "", videoUrl: "", link: "", linkText: "Shop Now", position: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  const loadBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/internal/cms/banners/manage", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBanners(Array.isArray(data) ? data : data?.data || []);
      }
    } catch (err: any) {
      setError(`Error loading banners: ${err.message}`);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadBanners(); }, []);

  const handleSeedBanners = async () => {
    if (!confirm("This will restore the default promotional banners. Continue?")) return;
    setSaving(true);
    try {
      await fetch("/api/cms/banners/seed", { method: "POST" });
      await loadBanners();
    } catch (err: any) { setError(err.message); } finally { setSaving(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const method = editingBanner ? "PUT" : "POST";
      const url = editingBanner ? `/internal/cms/banners/${editingBanner.id}` : "/internal/cms/banners";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { setShowAdd(false); setEditingBanner(null); await loadBanners(); }
    } catch {} finally { setSaving(false); }
  };

  return (
    <div style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Hero Banners</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search banners..." style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: ICON_BG, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              {isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}
            </button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 14px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} /> May 20 – May 26, 2025 <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320" }}>K</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1 }}>Admin</div>
                <div style={{ fontSize: 10, color: TEXT2, marginTop: 1 }}>Super Admin</div>
              </div>
              <ChevronDown style={{ width: 14, height: 14, color: TEXT2 }} />
            </div>
          </div>
        </header>

        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}><Link href="/admin/cms" style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "5px 12px", color: TEXT2, fontSize: 12, textDecoration: "none" }}><ArrowLeft style={{ width: 13, height: 13 }} /> Back to CMS</Link></div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Hero Banners</h2>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Manage your homepage promotional banners — {banners.length} total</p>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSeedBanners} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 16px", color: TEXT2, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>
                <RefreshCw style={{ width: 14, height: 14 }} /> Restore Defaults
              </button>
              <button onClick={() => { setEditingBanner(null); setForm({ title: "", subtitle: "", mediaType: "image", image: "", videoUrl: "", link: "", linkText: "Shop Now", position: 0, isActive: true }); setShowAdd(true); }}
                style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10, whiteSpace: "nowrap" }}>
                <Plus style={{ width: 15, height: 15 }} /> New Banner
              </button>
            </div>
          </div>

          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444" }}>{error}</div>}

          {showAdd && (
            <div style={{ ...card, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>{editingBanner ? "Edit Banner" : "Create New Banner"}</h3>
                <button onClick={() => setShowAdd(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2 }}><X style={{ width: 18, height: 18 }} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 16 }}>
                {[
                  { label: "Title", key: "title", placeholder: "Banner title" },
                  { label: "Subtitle", key: "subtitle", placeholder: "Optional subtitle" },
                  { label: "Link Text", key: "linkText", placeholder: "Shop Now" },
                  { label: "Link URL", key: "link", placeholder: "https://... or /shop" },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
                    <input value={(form as any)[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                      style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Media Type</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["image", "video"].map(t => (
                      <button key={t} onClick={() => setForm({ ...form, mediaType: t })}
                        style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: `1px solid ${form.mediaType === t ? ACCENT : BORDER}`, background: form.mediaType === t ? `${ACCENT}15` : CARD, color: form.mediaType === t ? ACCENT : TEXT2, fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize" }}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{form.mediaType === "image" ? "Image URL" : "Video URL"}</div>
                  <input value={form.mediaType === "image" ? (form.image || "") : (form.videoUrl || "")}
                    onChange={e => setForm({ ...form, [form.mediaType === "image" ? "image" : "videoUrl"]: e.target.value.trim() })}
                    placeholder="https://..."
                    style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                <button onClick={handleSave} disabled={saving}
                  style={{ background: ACCENT, border: "none", padding: "10px 24px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
                  {saving ? "Saving..." : editingBanner ? "Update Banner" : "Save Banner"}
                </button>
                <button onClick={() => { setShowAdd(false); setEditingBanner(null); }}
                  style={{ background: CARD, border: `1px solid ${BORDER}`, padding: "10px 24px", color: TEXT2, fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, background: HOVER }}>
                    {["Banner", "Details", "Status", "Actions"].map((h, i) => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: i === 3 ? "right" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} style={{ borderBottom: `1px solid ${BORDER}` }}>
                        <td colSpan={4} style={{ padding: "14px 16px" }}><div style={{ height: 16, borderRadius: 6, background: HOVER }} /></td>
                      </tr>
                    ))
                  ) : banners.length === 0 ? (
                    <tr><td colSpan={4} style={{ padding: 48, textAlign: "center", fontSize: 13, color: TEXT2 }}>
                      <ImageIcon style={{ width: 36, height: 36, margin: "0 auto 10px", opacity: 0.3 }} />
                      <div>No banners yet</div>
                    </td></tr>
                  ) : banners.map((banner) => (
                    <tr key={banner.id} style={{ borderBottom: `1px solid ${BORDER}` }}
                      onMouseEnter={e => e.currentTarget.style.background = HOVER}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ width: 96, height: 56, borderRadius: 10, overflow: "hidden", background: ICON_BG, border: `1px solid ${BORDER}` }}>
                          {banner.mediaType === "video"
                            ? <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B1320" }}><PlayCircle style={{ width: 20, height: 20, color: TEXT2 }} /></div>
                            : <img src={resolveImageUrl(banner.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: TEXT }}>{banner.title}</div>
                        <div style={{ fontSize: 11, color: TEXT2, marginTop: 2 }}>{banner.link || "No link"}</div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: banner.isActive ? "#16C784" : TEXT2, background: banner.isActive ? "rgba(22,199,132,0.12)" : ICON_BG, padding: "3px 10px", borderRadius: 20 }}>
                          {banner.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                          <button onClick={() => { setEditingBanner(banner); setForm({ ...banner }); setShowAdd(true); }}
                            style={{ padding: 8, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD, color: TEXT2, cursor: "pointer" }}>
                            <Edit style={{ width: 14, height: 14 }} />
                          </button>
                          <button onClick={async () => { if (confirm("Delete?")) { await fetch(`/internal/cms/banners/${banner.id}`, { method: "DELETE" }); loadBanners(); } }}
                            style={{ padding: 8, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD, color: TEXT2, cursor: "pointer" }}>
                            <Trash2 style={{ width: 14, height: 14 }} />
                          </button>
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
    </div>
  );
}