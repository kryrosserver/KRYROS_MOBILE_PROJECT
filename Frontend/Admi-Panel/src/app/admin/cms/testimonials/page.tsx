"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { MessageSquare, Plus, Edit, Trash2, X, RefreshCw, Star, Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;

export default function TestimonialsPage() {
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

  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [form, setForm] = useState({ name: "", avatar: "", rating: 5, comment: "", location: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTestimonials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/internal/admin/cms/sections", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data?.data || [];
        setSections(arr.filter((s: any) => s.type === "testimonials"));
      }
    } catch (err: any) { setError(err.message); } finally { setLoading(false); }
  };

  useEffect(() => { loadTestimonials(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { type: "testimonials", title: form.name, isActive: true, config: form };
      const method = editingItem ? "PUT" : "POST";
      const url = editingItem ? `/internal/admin/cms/sections/${editingItem.id}` : "/internal/admin/cms/sections";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) { setShowAdd(false); setEditingItem(null); await loadTestimonials(); }
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/internal/admin/cms/sections/${id}`, { method: "DELETE" });
    loadTestimonials();
  };

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Testimonials</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search testimonials..." style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: ICON_BG, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
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
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Testimonials</h2>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Manage customer reviews shown on homepage — {sections.length} total</p>
            </div>
            <button onClick={() => { setEditingItem(null); setForm({ name: "", avatar: "", rating: 5, comment: "", location: "" }); setShowAdd(true); }}
              style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
              <Plus style={{ width: 15, height: 15 }} /> Add Testimonial
            </button>
          </div>

          {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444" }}>{error}</div>}

          {showAdd && (
            <div style={{ ...card, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>{editingItem ? "Edit Testimonial" : "Add Testimonial"}</h3>
                <button onClick={() => setShowAdd(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2 }}><X style={{ width: 18, height: 18 }} /></button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginBottom: 16 }}>
                {[
                  { label: "Name", key: "name", placeholder: "John Mwansa" },
                  { label: "Location", key: "location", placeholder: "Lusaka" },
                  { label: "Avatar URL", key: "avatar", placeholder: "https://..." },
                ].map(f => (
                  <div key={f.key}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{f.label}</div>
                    <input value={(form as any)[f.key] || ""} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.placeholder}
                      style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Rating (1-5)</div>
                  <select value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })}
                    style={{ width: "100%", background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", appearance: "none" }}>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Stars</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT2, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Comment</div>
                  <textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Customer review..."
                    style={{ width: "100%", height: 80, background: ICON_BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT, fontSize: 13, outline: "none", resize: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, paddingTop: 16, borderTop: `1px solid ${BORDER}` }}>
                <button onClick={handleSave} disabled={saving} style={{ background: ACCENT, border: "none", padding: "10px 24px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
                  {saving ? "Saving..." : editingItem ? "Update" : "Save"}
                </button>
                <button onClick={() => setShowAdd(false)} style={{ background: CARD, border: `1px solid ${BORDER}`, padding: "10px 24px", color: TEXT2, fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {loading ? [...Array(3)].map((_, i) => <div key={i} style={{ ...card, padding: 20, height: 160 }}><div style={{ height: "100%", borderRadius: 10, background: HOVER }} /></div>) :
              sections.length === 0 ? (
                <div style={{ gridColumn: "span 3", padding: 48, textAlign: "center", color: TEXT2, fontSize: 13 }}>
                  <MessageSquare style={{ width: 36, height: 36, margin: "0 auto 10px", opacity: 0.3 }} />
                  <div>No testimonials yet</div>
                </div>
              ) : sections.map(s => {
                const c = s.config || {};
                return (
                  <div key={s.id} style={{ ...card, padding: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {c.avatar ? <img src={c.avatar} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} /> : <div style={{ width: 36, height: 36, borderRadius: "50%", background: ICON_BG, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: ACCENT }}>{(c.name || "?")[0]}</div>}
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: TEXT2 }}>{c.location}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => { setEditingItem(s); setForm(c); setShowAdd(true); }} style={{ padding: 6, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD, color: TEXT2, cursor: "pointer" }}><Edit style={{ width: 13, height: 13 }} /></button>
                        <button onClick={() => handleDelete(s.id)} style={{ padding: 6, borderRadius: 8, border: `1px solid ${BORDER}`, background: CARD, color: TEXT2, cursor: "pointer" }}><Trash2 style={{ width: 13, height: 13 }} /></button>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                      {[1,2,3,4,5].map(n => <Star key={n} style={{ width: 12, height: 12, color: n <= (c.rating || 5) ? "#F59E0B" : BORDER, fill: n <= (c.rating || 5) ? "#F59E0B" : "transparent" }} />)}
                    </div>
                    <p style={{ fontSize: 12, color: TEXT2, lineHeight: 1.5, margin: 0 }}>{c.comment}</p>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
