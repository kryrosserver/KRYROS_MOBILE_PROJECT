"use client";

import { useState, useEffect, useRef } from "react";
import { Mail, Users, Download, Search, Trash2, CheckCircle2, XCircle, Loader2, Bell, Calendar, Sun, Moon, Menu, ChevronDown } from "lucide-react";

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);


  useEffect(() => { fetchSubscribers(); }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/newsletter?type=list");
      const body = await res.json().catch(() => ({}));
      if (res.status === 503) throw new Error(body?.message || "Backend is starting up. Please wait and refresh.");
      if (res.ok) setSubscribers(Array.isArray(body) ? body : body?.data || []);
    } catch {}
    finally { setLoading(false); }
  };

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) && (!activeOnly || s.isActive)
  );

  const exportCSV = () => {
    const csv = "Email,Status,Joined Date\n" + filtered.map(s => `${s.email},${s.isActive ? "Active" : "Unsubscribed"},${new Date(s.createdAt).toLocaleDateString()}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "subscribers.csv" });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const stats = [
    { label: "Total Subscribers", value: subscribers.length,                          icon: Users,        color: "#111827",  bg: "#F9FAFB" },
    { label: "Active",            value: subscribers.filter(s =>  s.isActive).length, icon: CheckCircle2, color: "#16C784",               bg: "rgba(22,199,132,0.10)" },
    { label: "Unsubscribed",      value: subscribers.filter(s => !s.isActive).length, icon: XCircle,      color: "#EF4444",               bg: "rgba(239,68,68,0.10)" },
  ];

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Newsletter Subscribers</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>{subscribers.length} subscribers</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => setActiveOnly(v => !v)}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 16px", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {activeOnly ? "Show All" : "Active Only"}
          </button>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 320 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", width: 15, height: 15 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subscribers..."
            style={{ width: "100%", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px 9px 36px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["Email", "Status", "Subscribed At"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, color: "#374151" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {[...Array(3)].map((_, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}><div style={{ height: 14, borderRadius: 6, background: "#F3F4F6", width: j === 0 ? 200 : 100 }} /></td>
                    ))}
                  </tr>
                ))
              ) : subscribers.filter(s => (!search || s.email?.toLowerCase().includes(search.toLowerCase())) && (!activeOnly || s.isActive)).length === 0 ? (
                <tr><td colSpan={3} style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>No subscribers found.</td></tr>
              ) : subscribers.filter(s => (!search || s.email?.toLowerCase().includes(search.toLowerCase())) && (!activeOnly || s.isActive)).map((s, idx) => (
                <tr key={s.id || idx} style={{ borderBottom: "1px solid #F3F4F6", background: idx % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "12px 16px", color: "#111827" }}>{s.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.isActive ? "#D1FAE5" : "#FEE2E2", color: s.isActive ? "#065F46" : "#991B1B" }}>{s.isActive ? "Active" : "Inactive"}</span>
                  </td>
                  <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: 12 }}>{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
