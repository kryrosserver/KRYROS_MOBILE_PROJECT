"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Search, Users, CheckCircle, XCircle, TrendingUp } from "lucide-react";

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

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
        <div className="space-y-6 pb-20">

          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Agents</h1>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Manage sales agents and their performance</p>
            </div>
            <button className="btn-primary flex items-center gap-2 px-4">
              <Plus className="h-4 w-4" /> Add Agent
            </button>
          </div>

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
