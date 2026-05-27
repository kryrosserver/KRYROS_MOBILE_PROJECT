"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, Edit, Save, X, Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search } from "lucide-react";

type BrandBanner = { id?: string; brandSlug: string; brandName: string; tagline?: string; description?: string; bgColor?: string; bgGradient?: string; imageUrl?: string; ctaText?: string; ctaLink?: string; isActive?: boolean };
const EMPTY: BrandBanner = { brandSlug: "", brandName: "", tagline: "", description: "", bgColor: "#050F1A", bgGradient: "", imageUrl: "", ctaText: "Shop Now", ctaLink: "/shop", isActive: true };

export default function BrandBannersPage() {
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

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };


  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ marginBottom: 8 }}>
            <Link href="/admin/cms" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", color: "#4B5563", fontSize: 12, textDecoration: "none" }}>
              <ArrowLeft style={{ width: 13, height: 13 }} /> Back to CMS
            </Link>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Brand Banners</h2>
          <p style={{ fontSize: 12, color: "#6B7280", margin: "4px 0 0" }}>{banners.length} banners configured</p>
        </div>
        <button onClick={() => setEditing({ ...{ brandSlug: "", brandName: "", tagline: "", description: "", bgColor: "#050F1A", bgGradient: "", imageUrl: "", ctaText: "Shop Now", ctaLink: "/shop", isActive: true } })}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", padding: "9px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
          <Plus style={{ width: 15, height: 15 }} /> Add Banner
        </button>
      </div>

      {msg && <div style={{ background: "#D1FAE5", border: "1px solid #A7F3D0", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#065F46", marginBottom: 16 }}>{msg}</div>}

      {editing && (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>{editing.id ? "Edit Banner" : "New Banner"}</h3>
            <button onClick={() => setEditing(null)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6B7280" }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: 16 }}>
            {[
              { label: "Brand Name *", key: "brandName", placeholder: "e.g. Nike" },
              { label: "Brand Slug *", key: "brandSlug", placeholder: "e.g. nike" },
              { label: "Tagline", key: "tagline", placeholder: "Optional tagline" },
              { label: "Description", key: "description", placeholder: "Brief description" },
              { label: "Image URL", key: "imageUrl", placeholder: "https://..." },
              { label: "CTA Text", key: "ctaText", placeholder: "Shop Now" },
              { label: "CTA Link", key: "ctaLink", placeholder: "/shop" },
              { label: "Background Color", key: "bgColor", placeholder: "#050F1A" },
            ].map((f) => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{f.label}</label>
                <input value={(editing as any)[f.key] || ""} onChange={e => setEditing((v: any) => ({ ...v, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setEditing(null)}
              style={{ padding: "9px 20px", borderRadius: 9, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: "9px 24px", borderRadius: 9, border: "none", background: "#6366F1", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40, color: "#9CA3AF" }}>Loading...</div>
      ) : banners.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 40, textAlign: "center", color: "#9CA3AF" }}>
          No brand banners yet. Click "Add Banner" to create one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((b) => (
            <div key={b.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
              {b.imageUrl && (
                <div style={{ height: 140, background: b.bgColor || "#F3F4F6", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={b.imageUrl} alt={b.brandName} style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                </div>
              )}
              <div style={{ padding: 14 }}>
                <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{b.brandName}</div>
                {b.tagline && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{b.tagline}</div>}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => setEditing(b)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 8, padding: "7px 0", color: "#4338CA", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    <Edit style={{ width: 13, height: 13 }} /> Edit
                  </button>
                  <button onClick={() => handleDelete(b.id)}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "7px 0", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    <Trash2 style={{ width: 13, height: 13 }} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
