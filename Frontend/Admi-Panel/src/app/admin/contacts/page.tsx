"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, Mail, MapPin, Edit2, Trash2, Users, MoreVertical, Bell, Calendar, Sun, Moon, Menu, ChevronDown } from "lucide-react";
import { useInvoiceStore, Client } from "@/providers/InvoiceStore";
import { useTheme } from "@/providers/ThemeProvider";

export default function ContactsPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();
  const { clients, addClient } = useInvoiceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newClient, setNewClient] = useState<Omit<Client, "id">>({ name: "", email: "", address: "" });

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; outerRef.current.style.height = `${innerRef.current.scrollHeight * s}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? 750 : 1380; const s = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const handleAdd = () => {
    if (!newClient.name) return;
    addClient(newClient);
    setNewClient({ name: "", email: "", address: "" });
    setShowAdd(false);
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", color: "var(--text-primary)", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--card-border)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", margin: 0 }}>Client / Supplier</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", width: 15, height: 15 }} />
            <input placeholder="Search contacts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: "100%", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "8px 40px 8px 36px", color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "var(--text-secondary)", background: "var(--icon-bg)", padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>{isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}</button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "7px 14px", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} /> May 20 – May 26, 2025 <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#12D6C5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320" }}>K</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>Admin</div><div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 1 }}>Super Admin</div></div>
              <ChevronDown style={{ width: 14, height: 14, color: "var(--text-secondary)" }} />
            </div>
          </div>
        </header>
        <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)", padding: "20px" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Client / Supplier</h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Manage your business contacts and partners</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add Contact</button>
          </div>

          {showAdd && (
            <div className="admin-card space-y-4">
              <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Add New Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input placeholder="Name" className="admin-input" value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} />
                <input placeholder="Email" className="admin-input" value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} />
                <input placeholder="Address" className="admin-input" value={newClient.address} onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
                <button onClick={handleAdd} className="btn-primary">Save Contact</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length > 0 ? filtered.map((c) => (
              <div key={c.id} className="admin-card group transition-all duration-200"
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; }}>
                <div className="flex items-start justify-between">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg uppercase" style={{ background: "var(--icon-bg)", color: "var(--text-secondary)" }}>{c.name.slice(0, 2)}</div>
                  <button className="p-1 rounded-lg" style={{ color: "var(--text-muted)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}><MoreVertical className="h-5 w-5" /></button>
                </div>
                <div className="mt-4">
                  <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{c.name}</h3>
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}><Mail className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />{c.email || "No email"}</div>
                    <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}><MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />{c.address || "No address"}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 pt-4" style={{ borderTop: "1px solid var(--card-border)" }}>
                  <button className="flex-1 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2" style={{ color: "var(--text-secondary)", border: "1px solid var(--card-border)" }} onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}><Edit2 className="h-3 w-3" /> Edit</button>
                  <button className="flex-1 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2" style={{ color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}><Trash2 className="h-3 w-3" /> Delete</button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 rounded-xl flex flex-col items-center justify-center gap-3" style={{ border: "2px dashed var(--card-border)", background: "var(--hover-bg)" }}>
                <Users className="h-12 w-12 opacity-20" style={{ color: "var(--text-muted)" }} />
                <p className="font-semibold text-sm" style={{ color: "var(--text-muted)" }}>No contacts yet</p>
                <button onClick={() => setShowAdd(true)} className="btn-primary mt-2 flex items-center gap-2"><Plus className="h-4 w-4" /> Add Contact</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
