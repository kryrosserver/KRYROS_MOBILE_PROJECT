"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search, Users, CheckCircle, XCircle, TrendingUp, Bell, Calendar, Sun, Moon, Menu, ChevronDown } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export default function AgentsPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = `${innerRef.current.scrollHeight * s}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? 750 : 1380; const s = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const { isDark, toggleTheme } = useTheme();

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", color: "var(--text-primary)", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--card-border)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", margin: 0 }}>Agents</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", width: 15, height: 15 }} />
            <input placeholder="Search agents..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: "100%", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "8px 40px 8px 36px", color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
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

          {/* Stats Strip */}
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: "Total Agents",    value: "0",       icon: Users,       iconBg: "rgba(18,214,197,0.12)",  iconColor: "#12D6C5" },
              { label: "Active Agents",   value: "0",       icon: CheckCircle, iconBg: "rgba(22,199,132,0.12)",  iconColor: "#16C784" },
              { label: "Inactive Agents", value: "0",       icon: XCircle,     iconBg: "rgba(239,68,68,0.12)",   iconColor: "#EF4444" },
              { label: "This Month",      value: "0 sales", icon: TrendingUp,  iconBg: "rgba(245,158,11,0.12)",  iconColor: "#F59E0B" },
            ].map((s) => (
              <div key={s.label} className="admin-card !p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.iconBg }}>
                  <s.icon className="h-5 w-5" style={{ color: s.iconColor }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
                  <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="admin-card !p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="admin-input pl-10 w-full"
              />
            </div>
          </div>

          {/* Table */}
          <div className="admin-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Agent Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Performance</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={6} className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: "var(--icon-bg)" }}>
                          <Users className="h-8 w-8" style={{ color: "var(--text-muted)" }} />
                        </div>
                        <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>No agents found</p>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Add your first agent to get started</p>
                        <button className="btn-primary flex items-center gap-2 mt-1">
                          <Plus className="h-4 w-4" /> Add Agent
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
