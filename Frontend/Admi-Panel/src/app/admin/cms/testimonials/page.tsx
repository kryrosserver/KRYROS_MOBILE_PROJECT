"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { MessageSquare, Plus, Edit, Trash2, X, RefreshCw, Star, Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search } from "lucide-react";

export default function TestimonialsPage() {
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

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ marginBottom: 8 }}>
            <Link href="/admin/cms" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", color: "#4B5563", fontSize: 12, textDecoration: "none" }}>
              <ArrowLeft style={{ width: 13, height: 13 }} /> Back to CMS
            </Link>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Testimonials</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>{sections.length} testimonials</p>
        </div>
        <button onClick={() => { setEditingItem(null); setForm({ name: "", avatar: "", rating: 5, comment: "", location: "" }); setShowAdd(true); }}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", borderRadius: 10, padding: "9px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          <Plus style={{ width: 15, height: 15 }} /> Add Testimonial
        </button>
      </div>
      {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 16 }}>{error}</div>}
      {showAdd && (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "20px 24px 40px", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>{editingItem ? "Edit Testimonial" : "New Testimonial"}</h3>
            <button onClick={() => setShowAdd(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6B7280" }}><X style={{ width: 18, height: 18 }} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: 16 }}>
            {[
              { label: "Name", key: "name", placeholder: "Customer name" },
              { label: "Avatar URL", key: "avatar", placeholder: "https://..." },
              { label: "Location", key: "location", placeholder: "City, Country" },
              { label: "Rating (1-5)", key: "rating", type: "number", placeholder: "5" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{f.label}</label>
                <input type={f.type || "text"} value={(form as any)[f.key]} onChange={e => setForm(v => ({ ...v, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
            <div className="md:col-span-2">
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Comment</label>
              <textarea value={form.comment} onChange={e => setForm(v => ({ ...v, comment: e.target.value }))} rows={3} placeholder="Customer feedback..."
                style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#111827", outline: "none", resize: "vertical", boxSizing: "border-box" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setShowAdd(false)} style={{ padding: "9px 20px", borderRadius: 9, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ padding: "9px 24px", borderRadius: 9, border: "none", background: "#6366F1", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>{saving ? "Saving..." : "Save"}</button>
          </div>
        </div>
      )}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40, color: "#9CA3AF" }}>Loading...</div>
      ) : sections.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 40, textAlign: "center", color: "#9CA3AF" }}>No testimonials yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((t: any) => (
            <div key={t.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                {t.avatar ? <img src={t.avatar} alt={t.name} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} /> : (
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#6366F1", fontSize: 15 }}>{t.name?.charAt(0)}</div>
                )}
                <div>
                  <div style={{ fontWeight: 700, color: "#111827", fontSize: 13 }}>{t.name}</div>
                  {t.location && <div style={{ fontSize: 11, color: "#6B7280" }}>{t.location}</div>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: i < (t.rating || 0) ? "#FBBF24" : "#E5E7EB", fontSize: 14 }}>&#9733;</span>
                ))}
              </div>
              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, marginBottom: 12 }}>{t.comment}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setEditingItem(t); setForm(t); setShowAdd(true); }}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 8, padding: "6px 0", color: "#4338CA", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Edit style={{ width: 13, height: 13 }} /> Edit
                </button>
                <button onClick={() => handleDelete(t.id)}
                  style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "6px 0", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  <Trash2 style={{ width: 13, height: 13 }} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
