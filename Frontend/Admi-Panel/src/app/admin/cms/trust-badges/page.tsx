"use client";

import Link from "next/link";

import { ArrowLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { RefreshCw, Plus, Trash2, Save, Shield, Bell, Calendar, Sun, Moon, Menu, ChevronDown, Search } from "lucide-react";

const ICON_OPTIONS = ["Truck", "ShieldCheck", "RefreshCcw", "Headphones", "Star", "Zap", "Gift", "Heart"];
const DEFAULT_ITEMS = [
  { icon: "Truck", title: "Free Shipping", subtitle: "On orders over $100" },
  { icon: "ShieldCheck", title: "Secure Payments", subtitle: "100% Secure" },
  { icon: "RefreshCcw", title: "Easy Returns", subtitle: "7-Day Returns" },
  { icon: "Headphones", title: "24/7 Support", subtitle: "We are here" },
];

export default function TrustBadgesPage() {
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

  const [items, setItems] = useState(DEFAULT_ITEMS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/site-config/trust-badges", { cache: "no-store" });
      if (res.ok) { const d = await res.json(); if (d?.value?.items) setItems(d.value.items); }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/site-config/trust-badges", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: "trust-badges", value: { items } }) });
      if (res.ok) { setMsg("Saved!"); setTimeout(() => setMsg(null), 2000); }
    } finally { setSaving(false); }
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
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Trust Badges</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>{items.length} badges</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", borderRadius: 10, padding: "10px 22px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}>
          <Save style={{ width: 15, height: 15 }} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      {msg && <div style={{ background: "#D1FAE5", border: "1px solid #A7F3D0", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#065F46", marginBottom: 16 }}>{msg}</div>}
      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 40, color: "#9CA3AF" }}>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item: any, idx: number) => (
            <div key={idx} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Icon URL</label>
                <input value={item.icon || ""} onChange={e => { const updated = [...items]; updated[idx] = { ...item, icon: e.target.value }; setItems(updated); }}
                  placeholder="https://..."
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Title</label>
                <input value={item.title || ""} onChange={e => { const updated = [...items]; updated[idx] = { ...item, title: e.target.value }; setItems(updated); }}
                  placeholder="e.g. Free Shipping"
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Description</label>
                <input value={item.description || ""} onChange={e => { const updated = [...items]; updated[idx] = { ...item, description: e.target.value }; setItems(updated); }}
                  placeholder="Brief description"
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
