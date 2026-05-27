"use client";

import { useEffect, useState, useRef } from "react";
import {
  Bell, Sun, Moon, Menu, ChevronDown, Save, ArrowLeft,
  Type, Image as ImageIcon, Clock, Layout, RefreshCw, CheckCircle, X,
} from "lucide-react";
import Link from "next/link";

export default function NewsletterPage() {
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

  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);


  const loadConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/footer/config", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) setConfig(await res.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { loadConfig(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/cms/footer/config", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config), credentials: "same-origin",
      });
      if (res.ok) { setToast("Newsletter popup updated successfully"); setTimeout(() => setToast(null), 3000); }
    } finally { setSaving(false); }
  };

  const inp: React.CSSProperties = { width: "100%", background: HOVER, border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", color: TEXT, fontSize: 13, outline: "none" };
  const lbl: React.CSSProperties = { display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 };
  const card: React.CSSProperties = { background: CARD, border: "1px solid #E5E7EB", borderRadius: 16, padding: "24px" };

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <div style={{ marginBottom: 8 }}>
            <Link href="/admin/cms" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "5px 12px", color: "#4B5563", fontSize: 12, textDecoration: "none" }}>
              <ArrowLeft style={{ width: 13, height: 13 }} /> Back to CMS
            </Link>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Newsletter Popup</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Manage the lead capture popup on your store</p>
        </div>
        <button onClick={handleSave} disabled={saving || !config}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "#6366F1", border: "none", borderRadius: 10, padding: "10px 22px", color: "#fff", fontWeight: 700, fontSize: 13, cursor: saving || !config ? "not-allowed" : "pointer", opacity: saving || !config ? 0.7 : 1 }}>
          <Save style={{ width: 15, height: 15 }} /> {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      {toast && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 10, background: "#D1FAE5", border: "1px solid #A7F3D0", fontSize: 13, fontWeight: 600, color: "#065F46", marginBottom: 16 }}>
          <CheckCircle style={{ width: 18, height: 18 }} /> {toast}
          <button onClick={() => setToast(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", cursor: "pointer", color: "#065F46" }}><X style={{ width: 16, height: 16 }} /></button>
        </div>
      )}
      {loading && (
        <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px" }}>
          <RefreshCw style={{ width: 32, height: 32, color: "#9CA3AF", opacity: 0.5 }} />
          <p style={{ color: "#6B7280", fontWeight: 600, fontSize: 13, marginTop: 12 }}>Loading Configuration...</p>
        </div>
      )}
      {config && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ alignItems: "start" }}>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid #E5E7EB", marginBottom: 18 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Visibility Settings</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#6B7280" }}>{config.newsletterPopupEnabled ? "Enabled" : "Disabled"}</span>
                <input type="checkbox" checked={!!config.newsletterPopupEnabled} onChange={e => setConfig({ ...config, newsletterPopupEnabled: e.target.checked })} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Popup Title</label>
                <input value={config.newsletterPopupTitle || ""} onChange={e => setConfig({ ...config, newsletterPopupTitle: e.target.value })} placeholder="Unlock Premium Deals"
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
              <div><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Popup Subtitle</label>
                <textarea value={config.newsletterPopupSubtitle || ""} onChange={e => setConfig({ ...config, newsletterPopupSubtitle: e.target.value })} rows={3} placeholder="What's the value proposition?"
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", color: "#111827", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} /></div>
              <div><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Popup Image URL</label>
                <input value={config.newsletterPopupImage || ""} onChange={e => setConfig({ ...config, newsletterPopupImage: e.target.value })} placeholder="https://..."
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
              <div><label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 5 }}>Display Delay (ms)</label>
                <input type="number" value={config.newsletterPopupDelay || 3000} onChange={e => setConfig({ ...config, newsletterPopupDelay: parseInt(e.target.value) })}
                  style={{ width: "100%", background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "9px 12px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} /></div>
            </div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 24 }}>
            <div style={{ paddingBottom: 14, borderBottom: "1px solid #E5E7EB", marginBottom: 18 }}><span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>Live Preview</span></div>
            <div style={{ background: "#F9FAFB", borderRadius: 12, padding: 24, border: "2px dashed #E5E7EB", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: 380 }}>
              {!config.newsletterPopupEnabled ? (
                <p style={{ color: "#6B7280", fontWeight: 600, fontSize: 13 }}>Newsletter Popup is Hidden</p>
              ) : (
                <div style={{ width: "100%", maxWidth: 320, background: "#fff", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden", border: "1px solid #E5E7EB" }}>
                  <div style={{ height: 120, background: "#F9FAFB", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {config.newsletterPopupImage ? <img src={config.newsletterPopupImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Popup" /> : <ImageIcon style={{ width: 36, height: 36, color: "#9CA3AF" }} />}
                  </div>
                  <div style={{ padding: 24, textAlign: "center", display: "flex", flexDirection: "column", gap: 12 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}>{config.newsletterPopupTitle || "Popup Title"}</h3>
                    <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{config.newsletterPopupSubtitle || "Popup subtitle text goes here."}</p>
                    <input type="email" disabled placeholder="Enter your email" style={{ width: "100%", height: 36, borderRadius: 8, border: "1px solid #E5E7EB", background: "#F9FAFB", fontSize: 12, paddingLeft: 12, color: "#6B7280", boxSizing: "border-box" }} />
                    <button style={{ width: "100%", height: 38, background: "#6366F1", border: "none", borderRadius: 8, color: "#fff", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Subscribe Now</button>
                  </div>
                </div>
              )}
              <p style={{ marginTop: 16, color: "#6B7280", fontSize: 11, textAlign: "center" }}>Appears after {config.newsletterPopupDelay || 3000}ms for new visitors.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
