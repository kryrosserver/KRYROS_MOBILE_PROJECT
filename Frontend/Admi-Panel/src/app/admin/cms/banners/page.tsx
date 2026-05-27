"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { resolveImageUrl } from "@/lib/utils";
import {
  Image as ImageIcon, Plus, Edit, Trash2, X, RefreshCw, PlayCircle,
  Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search,
} from "lucide-react";

export default function BannersPage() {
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

  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any>(null);
  const [form, setForm] = useState<any>({ title: "", subtitle: "", mediaType: "image", image: "", videoUrl: "", link: "", linkText: "Shop Now", position: 0, isActive: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const card = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 14 };

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
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ marginBottom: 8 }}>
            <Link href="/admin/cms" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", color: "#4B5563", fontSize: 12, textDecoration: "none" }}>
              <ArrowLeft style={{ width: 13, height: 13 }} /> Back to CMS
            </Link>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Hero Banners</h2>
          <p style={{ fontSize: 12, color: "#6B7280", margin: "4px 0 0" }}>{banners.length} banners configured</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleSeedBanners} disabled={saving}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 16px", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <RefreshCw style={{ width: 14, height: 14 }} /> Restore Defaults
          </button>
          <button onClick={() => { setEditingBanner(null); setForm({ title: "", subtitle: "", mediaType: "image", image: "", videoUrl: "", link: "", linkText: "Shop Now", position: 0, isActive: true }); setShowAdd(true); }}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", padding: "9px 18px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer", borderRadius: 10 }}>
            <Plus style={{ width: 15, height: 15 }} /> New Banner
          </button>
        </div>
      </div>

      {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 16 }}>{error}</div>}

      {/* Add/Edit Form */}
      {showAdd && (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>{editingBanner ? "Edit Banner" : "New Banner"}</h3>
            <button onClick={() => setShowAdd(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#6B7280" }}>
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 16 }}>
            {[
              { label: "Title", key: "title", placeholder: "Banner title" },
              { label: "Subtitle", key: "subtitle", placeholder: "Optional subtitle" },
              { label: "Link Text", key: "linkText", placeholder: "Shop Now" },
              { label: "Link URL", key: "link", placeholder: "https://... or /shop" },
              { label: "Image URL", key: "image", placeholder: "https://..." },
              { label: "Video URL", key: "videoUrl", placeholder: "https://..." },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>{f.label}</label>
                <input value={(form as any)[f.key]} onChange={e => setForm((v: any) => ({ ...v, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button onClick={() => setShowAdd(false)}
              style={{ padding: "9px 20px", borderRadius: 9, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ padding: "9px 24px", borderRadius: 9, border: "none", background: "#6366F1", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
              {saving ? "Saving..." : editingBanner ? "Save Changes" : "Add Banner"}
            </button>
          </div>
        </div>
      )}

      {/* Banners Grid */}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40, color: "#9CA3AF" }}>Loading banners...</div>
      ) : banners.length === 0 ? (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 40, textAlign: "center", color: "#9CA3AF" }}>
          No banners yet. Click "New Banner" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((banner: any) => (
            <div key={banner.id} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
              {banner.image && (
                <div style={{ height: 160, overflow: "hidden", background: "#F3F4F6" }}>
                  <img src={banner.image} alt={banner.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              )}
              <div style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "#111827", fontSize: 14 }}>{banner.title}</div>
                    {banner.subtitle && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{banner.subtitle}</div>}
                  </div>
                  <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: banner.isActive ? "#D1FAE5" : "#FEE2E2", color: banner.isActive ? "#065F46" : "#991B1B" }}>
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button onClick={() => { setEditingBanner(banner); setForm(banner); setShowAdd(true); }}
                    style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 8, padding: "7px 0", color: "#4338CA", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    <Edit style={{ width: 13, height: 13 }} /> Edit
                  </button>
                  <button onClick={async () => { await fetch(`/internal/cms/banners/${banner.id}`, { method: "DELETE" }); await loadBanners(); }}
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
