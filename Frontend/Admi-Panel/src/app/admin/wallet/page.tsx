"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, DollarSign, Search,
  RefreshCw, CheckCircle, XCircle, Clock, Download, Plus, TrendingUp,
  Banknote, Users, Link as LinkIcon, Copy, Check, Trash2,
  Bell, Calendar, Sun, Moon, Menu, ChevronDown, ChevronRight, MoreHorizontal,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const ACCENT = "#12D6C5";

function MiniSparkline({ color = ACCENT, up = true }: { color?: string; up?: boolean }) {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sgw${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sgw${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    COMPLETED: ["#16C784", "rgba(22,199,132,0.14)"],
    ACTIVE:    ["#16C784", "rgba(22,199,132,0.14)"],
    PENDING:   ["#F59E0B", "rgba(245,158,11,0.14)"],
    FAILED:    ["#EF4444", "rgba(239,68,68,0.14)"],
  };
  const [color, bg] = map[status] || ["#6B7280", "rgba(107,114,128,0.14)"];
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color, background: bg, padding: "3px 10px", borderRadius: 20 }}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function CheckoutMethodsTab() {
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";

  const [methods, setMethods] = useState([
    { id: "WHATSAPP",      name: "WhatsApp Payment", enabled: true, sortOrder: 1 },
    { id: "MOBILE_MONEY",  name: "Mobile Money",     enabled: true, sortOrder: 2 },
    { id: "BANK_TRANSFER", name: "Bank Transfer",    enabled: true, sortOrder: 3 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/internal/admin/settings").then(r => r.json()).then(data => {
      const item = data?.find?.((d: any) => d.key === "CHECKOUT_METHODS");
      if (item?.value) { try { setMethods(JSON.parse(item.value)); } catch {} }
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/internal/admin/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "CHECKOUT_METHODS", value: JSON.stringify(methods) }),
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("Checkout methods saved!");
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const toggleMethod = (id: string) => setMethods(m => m.map(x => x.id === id ? { ...x, enabled: !x.enabled } : x));
  const updateSortOrder = (id: string, val: string) => setMethods(m => m.map(x => x.id === id ? { ...x, sortOrder: parseInt(val) || 0 } : x));

  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: 0 }}>Checkout Methods</h3>
          <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Enable/disable payment methods and set their display order at checkout.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          style={{ background: ACCENT, border: "none", borderRadius: 10, padding: "9px 18px", color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...methods].sort((a, b) => a.sortOrder - b.sortOrder).map(method => (
          <div key={method.id}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderRadius: 12, border: `1px solid ${BORDER}`, transition: "border-color 0.15s" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = ACCENT; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                onClick={() => toggleMethod(method.id)}
                style={{ width: 42, height: 24, borderRadius: 12, background: method.enabled ? ACCENT : HOVER, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                <div style={{ position: "absolute", top: 2, left: method.enabled ? 20 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT }}>{method.name}</div>
                <div style={{ fontSize: 11, color: TEXT2, marginTop: 2 }}>{method.id}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 11, color: TEXT2 }}>Sort:</label>
              <input type="number" value={method.sortOrder} onChange={e => updateSortOrder(method.id, e.target.value)}
                style={{ width: 50, background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "4px 8px", color: TEXT, fontSize: 12, outline: "none", textAlign: "center" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WalletPage() {
  const { isDark, toggleTheme } = useTheme();

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";

  useEffect(() => {}, []);

  const [activeTab, setActiveTab] = useState("transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [wallets, setWallets] = useState<any[]>([]);
  const [txns, setTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentLinks, setPaymentLinks] = useState([
    { id: "PAY-123", amount: 500, description: "Consultation Fee", createdAt: new Date().toISOString(), status: "ACTIVE" },
  ]);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [newLink, setNewLink] = useState({ amount: "", description: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreateLink = () => {
    setPaymentLinks([{ id: `PAY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, amount: parseFloat(newLink.amount), description: newLink.description, createdAt: new Date().toISOString(), status: "ACTIVE" }, ...paymentLinks]);
    setNewLink({ amount: "", description: "" });
    setIsCreatingLink(false);
  };

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(`${window.location.origin.replace("admin.", "")}/pay/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [wRes, tRes] = await Promise.all([fetch("/internal/admin/wallets", { cache: "no-store" }), fetch("/internal/admin/wallets/transactions", { cache: "no-store" })]);
      const [w, t] = await Promise.all([wRes.json(), tRes.json()]);
      if (wRes.status === 503 || tRes.status === 503) throw new Error(w?.message || t?.message || "The backend server is starting up. Please wait a moment and click Refresh.");
      if (!wRes.ok) throw new Error(w?.error || `Server error ${wRes.status}`);
      if (!tRes.ok) throw new Error(t?.error || `Server error ${tRes.status}`);
      setWallets(Array.isArray(w) ? w : []);
      setTxns(Array.isArray(t) ? t : []);
    } catch (e: any) { setError(e?.message || "Failed to load"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const totalBalance = wallets.reduce((s, w) => s + Number(w.balance || 0), 0);
    const today = new Date().toDateString();
    const todayTxns = txns.filter(x => new Date(x.createdAt).toDateString() === today);
    return {
      totalBalance,
      todayIncoming: todayTxns.filter(x => x.type === "CREDIT").reduce((s, x) => s + Number(x.amount), 0),
      todayOutgoing: todayTxns.filter(x => x.type === "DEBIT" || x.type === "PAYMENT").reduce((s, x) => s + Number(x.amount), 0),
      pendingTransactions: txns.filter(t => t.status === "PENDING").length,
      activeWallets: wallets.length,
    };
  }, [wallets, txns]);

  const filteredTxns = txns.filter(txn =>
    (txn.wallet?.user?.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (txn.wallet?.user?.lastName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (txn.wallet?.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (txn.reference || txn.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fmt = (n: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(n);
  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };

  const tabs = [
    { id: "transactions",     label: "Wallet Transactions", icon: ArrowUpRight },
    { id: "links",            label: "Payment Links",       icon: LinkIcon },
    { id: "checkout_methods", label: "Checkout Methods",    icon: CreditCard },
  ];

  const statDefs = [
    { label: "Total Balance",    value: fmt(stats.totalBalance),    change: "+12.1%", up: true,  color: "#16C784",  icon: Wallet       },
    { label: "Today's Incoming", value: fmt(stats.todayIncoming),   change: "+18.6%", up: true,  color: "#3B82F6",  icon: ArrowDownLeft },
    { label: "Today's Outgoing", value: fmt(stats.todayOutgoing),   change: "-8.0%",  up: false, color: "#EF4444",  icon: ArrowUpRight  },
    { label: "Pending",          value: stats.pendingTransactions.toString(), change: "+3.1%", up: false, color: "#F59E0B", icon: Clock },
    { label: "Active Wallets",   value: stats.activeWallets.toString(), change: "+6.4%", up: true, color: "#8B5CF6", icon: Users },
  ];

  return (
    <div style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── HEADER ── */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Wallet & Payments</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search transactions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
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
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Wallet & Payments</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <span>Home</span><ChevronRight style={{ width: 13, height: 13 }} /><span style={{ color: ACCENT }}>Wallet</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => { setIsRefreshing(true); load().finally(() => setTimeout(() => setIsRefreshing(false), 300)); }}
                style={{ width: 40, height: 40, borderRadius: 10, background: CARD, border: `1px solid ${BORDER}`, color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <RefreshCw style={{ width: 16, height: 16 }} />
              </button>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Download style={{ width: 15, height: 15 }} /> Export
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT2, cursor: "pointer" }}>
                <MoreHorizontal style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "14px 18px", fontSize: 13, color: "#EF4444", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span>⚠️ {error}</span>
              <button onClick={load} style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 7, padding: "5px 14px", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Retry</button>
            </div>
          )}

          {/* Stat Cards — 5 columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {statDefs.map((s, i) => (
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
                <div style={{ fontSize: s.value.length > 8 ? 16 : 22, fontWeight: 800, color: TEXT, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                <div style={{ marginTop: 8 }}><MiniSparkline color={s.color} up={s.up} /></div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ borderBottom: `1px solid ${BORDER}` }}>
            <nav style={{ display: "flex", gap: 4, overflowX: "auto" }}>
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", background: "transparent", border: "none", borderBottom: activeTab === tab.id ? `2px solid ${ACCENT}` : "2px solid transparent", color: activeTab === tab.id ? ACCENT : TEXT2, whiteSpace: "nowrap", transition: "color 0.15s" }}>
                  <tab.icon style={{ width: 15, height: 15 }} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
                  <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: TEXT2 }} />
                  <input placeholder="Search transactions..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px 9px 30px", color: TEXT, fontSize: 13, outline: "none" }} />
                </div>
              </div>

              <div style={{ ...card, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${BORDER}`, background: HOVER }}>
                        {["Transaction", "User", "Amount", "Fee", "Method", "Status", "Date", ""].map(h => (
                          <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: h === "" ? "right" : "left" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        [...Array(5)].map((_, i) => (
                          <tr key={i}><td colSpan={8} style={{ padding: "12px 16px" }}><div style={{ height: 16, borderRadius: 6, background: HOVER }} /></td></tr>
                        ))
                      ) : filteredTxns.length === 0 ? (
                        <tr><td colSpan={8} style={{ padding: 48, textAlign: "center", fontSize: 13, color: TEXT2 }}>No transactions found.</td></tr>
                      ) : filteredTxns.map(txn => (
                        <tr key={txn.id} style={{ borderBottom: `1px solid ${BORDER}` }}
                          onMouseEnter={e => { e.currentTarget.style.background = HOVER; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                          <td style={{ padding: "13px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: txn.type === "CREDIT" ? "rgba(22,199,132,0.12)" : "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {txn.type === "CREDIT"
                                  ? <ArrowDownLeft style={{ width: 14, height: 14, color: "#16C784" }} />
                                  : <ArrowUpRight style={{ width: 14, height: 14, color: "#EF4444" }} />}
                              </div>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: TEXT }}>{txn.reference || txn.id}</div>
                                <div style={{ fontSize: 10, color: TEXT2 }}>{txn.description || "—"}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT2 }}>
                            {(txn.wallet?.user && `${txn.wallet.user.firstName || ""} ${txn.wallet.user.lastName || ""}`.trim()) || txn.wallet?.user?.email || "—"}
                          </td>
                          <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: txn.type === "CREDIT" ? "#16C784" : "#EF4444" }}>
                            {txn.type === "CREDIT" ? "+" : "−"}{fmt(Number(txn.amount))}
                          </td>
                          <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT2 }}>{txn.metadata?.fee ? fmt(Number(txn.metadata.fee)) : "—"}</td>
                          <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT2 }}>{txn.metadata?.method || "—"}</td>
                          <td style={{ padding: "13px 16px" }}><StatusBadge status={txn.status} /></td>
                          <td style={{ padding: "13px 16px", fontSize: 11, color: TEXT2 }}>{new Date(txn.createdAt).toLocaleString()}</td>
                          <td style={{ padding: "13px 16px", textAlign: "right" }}>
                            <button style={{ fontSize: 12, fontWeight: 600, color: ACCENT, background: "transparent", border: "none", cursor: "pointer" }}>View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Payment Links Tab */}
          {activeTab === "links" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: TEXT, margin: 0 }}>Payment Links</h2>
                  <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Generate secure, locked-amount payment links for clients</p>
                </div>
                <button onClick={() => setIsCreatingLink(true)}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: ACCENT, border: "none", borderRadius: 10, padding: "9px 18px", color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <Plus style={{ width: 15, height: 15 }} /> Create Link
                </button>
              </div>

              {isCreatingLink && (
                <div style={{ ...card, padding: "20px" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT, margin: "0 0 16px" }}>Generate New Payment Link</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5" style={{marginBottom: 16}}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: TEXT2, display: "block", marginBottom: 6 }}>Locked Amount</label>
                      <div style={{ position: "relative" }}>
                        <DollarSign style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: TEXT2 }} />
                        <input type="number" placeholder="0.00" value={newLink.amount} onChange={e => setNewLink({ ...newLink, amount: e.target.value })}
                          style={{ width: "100%", background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px 10px 30px", color: TEXT, fontSize: 13, outline: "none" }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: TEXT2, display: "block", marginBottom: 6 }}>Description / Purpose</label>
                      <input placeholder="e.g. Custom Order #552" value={newLink.description} onChange={e => setNewLink({ ...newLink, description: e.target.value })}
                        style={{ width: "100%", background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 12px", color: TEXT, fontSize: 13, outline: "none" }} />
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={handleCreateLink} disabled={!newLink.amount}
                      style={{ background: ACCENT, border: "none", borderRadius: 10, padding: "9px 18px", color: "#0B1320", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                      Generate Link
                    </button>
                    <button onClick={() => setIsCreatingLink(false)}
                      style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div style={{ ...card, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${BORDER}`, background: HOVER }}>
                      {["Reference", "Description", "Amount", "Created", "Status", "Actions"].map((h, i) => (
                        <th key={h} style={{ padding: "12px 16px", fontSize: 11, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: i >= 5 ? "right" : "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paymentLinks.map(link => (
                      <tr key={link.id} style={{ borderBottom: `1px solid ${BORDER}` }}
                        onMouseEnter={e => { e.currentTarget.style.background = HOVER; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                        <td style={{ padding: "13px 16px", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: TEXT }}>{link.id}</td>
                        <td style={{ padding: "13px 16px", fontSize: 12, color: TEXT2 }}>{link.description}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#16C784" }}>{fmt(link.amount)}</td>
                        <td style={{ padding: "13px 16px", fontSize: 11, color: TEXT2 }}>{new Date(link.createdAt).toLocaleDateString()}</td>
                        <td style={{ padding: "13px 16px" }}><StatusBadge status={link.status} /></td>
                        <td style={{ padding: "13px 16px", textAlign: "right" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 8 }}>
                            <button onClick={() => copyToClipboard(link.id)}
                              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: copiedId === link.id ? "rgba(22,199,132,0.12)" : ICON_BG, color: copiedId === link.id ? "#16C784" : TEXT2 }}>
                              {copiedId === link.id ? <Check style={{ width: 13, height: 13 }} /> : <Copy style={{ width: 13, height: 13 }} />}
                              {copiedId === link.id ? "Copied" : "Copy"}
                            </button>
                            <button style={{ width: 32, height: 32, borderRadius: 8, background: "transparent", border: "none", color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                              onMouseLeave={e => { e.currentTarget.style.color = TEXT2; e.currentTarget.style.background = "transparent"; }}>
                              <Trash2 style={{ width: 14, height: 14 }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Checkout Methods Tab */}
          {activeTab === "checkout_methods" && <CheckoutMethodsTab />}

        </div>
      </div>
    </div>
  );
}