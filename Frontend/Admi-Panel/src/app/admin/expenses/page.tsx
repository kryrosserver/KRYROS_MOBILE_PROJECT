"use client";

import { useState, useRef, useEffect } from "react";
import {
  Plus, Search, DollarSign, Trash2, Bell, Calendar, Sun, Moon,
  Menu, ChevronDown, ChevronRight, Download, MoreHorizontal,
  TrendingDown, TrendingUp, CreditCard, RefreshCw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useTheme } from "@/providers/ThemeProvider";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const ACCENT = "#12D6C5";
const MOBILE_BASE = 750;
const DESKTOP_BASE = 1380;

type Expense = {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
};

function MiniSparkline({ color = ACCENT, up = true }: { color?: string; up?: boolean }) {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sge${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sge${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function ExpensesPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { isDark, toggleTheme } = useTheme();
  const [search, setSearch] = useState("");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ date: "", category: "", description: "", amount: "" });

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";

  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; outerRef.current.style.height = `${innerRef.current.scrollHeight * s}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? MOBILE_BASE : DESKTOP_BASE; const s = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, [expenses]);

  const handleAdd = () => {
    if (!form.description || !form.amount) return;
    setExpenses(prev => [...prev, { id: Date.now().toString(), date: form.date || new Date().toISOString().slice(0, 10), category: form.category || "General", description: form.description, amount: parseFloat(form.amount) }]);
    setForm({ date: "", category: "", description: "", amount: "" });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this expense?")) return;
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const filtered = expenses.filter(e =>
    e.description.toLowerCase().includes(search.toLowerCase()) ||
    e.category.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);
  const thisMonth = expenses.filter(e => e.date.startsWith(new Date().toISOString().slice(0, 7)));
  const monthlyTotal = thisMonth.reduce((s, e) => s + e.amount, 0);

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── HEADER ── */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Expenses</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
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

        {/* ── BODY ── */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title + actions */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Expenses</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <span>Home</span>
                <ChevronRight style={{ width: 13, height: 13 }} />
                <span style={{ color: ACCENT }}>Expenses</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", borderRadius: 10, overflow: "hidden" }}>
                <button onClick={() => setShowAdd(true)} style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", padding: "9px 18px", color: "#0B1320", fontWeight: 700, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                  <Plus style={{ width: 15, height: 15 }} /> Add Expense
                </button>
                <button style={{ background: "#10C4B5", border: "none", padding: "9px 10px", color: "#0B1320", cursor: "pointer", borderLeft: "1px solid rgba(0,0,0,0.15)" }}>
                  <ChevronDown style={{ width: 14, height: 14 }} />
                </button>
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Download style={{ width: 15, height: 15 }} /> Export <ChevronDown style={{ width: 13, height: 13 }} />
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT2, cursor: "pointer" }}>
                <MoreHorizontal style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Total Expenses", value: formatPrice(totalAmount), change: "+8.4%", up: false, color: "#EF4444", icon: TrendingDown },
              { label: "This Month", value: formatPrice(monthlyTotal), change: "+4.2%", up: false, color: "#F59E0B", icon: Calendar },
              { label: "Total Records", value: expenses.length, change: "+3.1%", up: true, color: ACCENT, icon: CreditCard },
              { label: "Avg per Expense", value: expenses.length ? formatPrice(totalAmount / expenses.length) : formatPrice(0), change: "0.0%", up: true, color: "#8B5CF6", icon: TrendingUp },
            ].map((s, i) => (
              <div key={i} style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon style={{ width: 20, height: 20, color: s.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.up ? "#22C55E" : "#EF4444" }}>
                    {s.up ? "▲" : "▼"} {s.change}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: typeof s.value === "string" ? 18 : 26, fontWeight: 800, color: TEXT, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                <div style={{ marginTop: 8 }}><MiniSparkline color={s.color} up={s.up} /></div>
              </div>
            ))}
          </div>

          {/* Add Expense Form */}
          {showAdd && (
            <div style={{ ...card, padding: "20px" }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 16px" }}>Add New Expense</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}>
                {[
                  { placeholder: "Date (YYYY-MM-DD)", key: "date", type: "date", value: form.date },
                  { placeholder: "Category", key: "category", type: "text", value: form.category },
                  { placeholder: "Description", key: "description", type: "text", value: form.description },
                  { placeholder: "Amount", key: "amount", type: "number", value: form.amount },
                ].map(f => (
                  <input key={f.key} type={f.type} placeholder={f.placeholder} value={f.value}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", color: TEXT, fontSize: 13, outline: "none" }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button onClick={() => setShowAdd(false)} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={handleAdd} style={{ background: ACCENT, border: "none", borderRadius: 10, padding: "9px 18px", color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Save Expense</button>
              </div>
            </div>
          )}

          {/* Filter bar */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
              <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2 }} />
              <input placeholder="Search expenses..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px 9px 30px", color: TEXT, fontSize: 13, outline: "none" }} />
            </div>
            <button style={{ display: "flex", alignItems: "center", gap: 6, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 14px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
              <RefreshCw style={{ width: 13, height: 13 }} />
            </button>
          </div>

          {/* Table */}
          <div style={{ ...card, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, background: HOVER }}>
                    {["Date", "Category", "Description", "Amount", "Actions"].map((h, i) => (
                      <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: i >= 3 ? "right" : "left" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 48, textAlign: "center", fontSize: 13, color: TEXT2 }}>
                        <DollarSign style={{ width: 36, height: 36, margin: "0 auto 10px", opacity: 0.3 }} />
                        <div style={{ fontWeight: 600 }}>No expenses recorded yet</div>
                        <div style={{ fontSize: 11, marginTop: 4 }}>Track your first business expense to get started.</div>
                      </td>
                    </tr>
                  ) : filtered.map(e => (
                    <tr key={e.id}
                      style={{ borderBottom: `1px solid ${BORDER}` }}
                      onMouseEnter={ev => { ev.currentTarget.style.background = HOVER; }}
                      onMouseLeave={ev => { ev.currentTarget.style.background = "transparent"; }}>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: TEXT2 }}>{e.date}</td>
                      <td style={{ padding: "13px 16px" }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: ACCENT, background: `${ACCENT}15`, padding: "3px 10px", borderRadius: 20 }}>{e.category}</span>
                      </td>
                      <td style={{ padding: "13px 16px", fontSize: 13, color: TEXT }}>{e.description}</td>
                      <td style={{ padding: "13px 16px", textAlign: "right", fontSize: 14, fontWeight: 800, color: "#EF4444" }}>{formatPrice(e.amount)}</td>
                      <td style={{ padding: "13px 16px", textAlign: "right" }}>
                        <button onClick={() => handleDelete(e.id)}
                          style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 8, padding: 8, color: "#EF4444", cursor: "pointer" }}
                          onMouseEnter={ev => { ev.currentTarget.style.background = "#EF4444"; ev.currentTarget.style.color = "#fff"; }}
                          onMouseLeave={ev => { ev.currentTarget.style.background = "rgba(239,68,68,0.1)"; ev.currentTarget.style.color = "#EF4444"; }}>
                          <Trash2 style={{ width: 14, height: 14 }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
