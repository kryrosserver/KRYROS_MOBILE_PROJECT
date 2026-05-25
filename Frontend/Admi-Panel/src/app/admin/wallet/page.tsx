"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Banknote,
  Building,
  Users,
  Link as LinkIcon,
  Copy,
  Check,
  Trash2
} from "lucide-react";

export default function WalletPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(nextScale: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const naturalH = innerRef.current.scrollHeight; const visualH = naturalH * nextScale; const isMobile = window.innerWidth < 1024; const screenAvail = isMobile ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(visualH, screenAvail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? 720 : 1380; const nextScale = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${nextScale})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(nextScale))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);
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
    const link = {
      id: `PAY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      amount: parseFloat(newLink.amount),
      description: newLink.description,
      createdAt: new Date().toISOString(),
      status: "ACTIVE",
    };
    setPaymentLinks([link, ...paymentLinks]);
    setNewLink({ amount: "", description: "" });
    setIsCreatingLink(false);
  };

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin.replace("admin.", "")}/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    load().finally(() => setTimeout(() => setIsRefreshing(false), 300));
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [wRes, tRes] = await Promise.all([
        fetch("/internal/admin/wallets", { cache: "no-store" }),
        fetch("/internal/admin/wallets/transactions", { cache: "no-store" }),
      ]);
      const [w, t] = await Promise.all([wRes.json(), tRes.json()]);
      if (!wRes.ok) throw new Error(w?.error || "Failed to load wallets");
      if (!tRes.ok) throw new Error(t?.error || "Failed to load transactions");
      setWallets(Array.isArray(w) ? w : []);
      setTxns(Array.isArray(t) ? t : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance || 0), 0);
    const today = new Date().toDateString();
    const todayTxns = txns.filter((x) => new Date(x.createdAt).toDateString() === today);
    const todayIncoming = todayTxns.filter((x) => x.type === "CREDIT").reduce((s, x) => s + Number(x.amount), 0);
    const todayOutgoing = todayTxns.filter((x) => x.type === "DEBIT" || x.type === "PAYMENT").reduce((s, x) => s + Number(x.amount), 0);
    return {
      totalBalance,
      todayIncoming,
      todayOutgoing,
      pendingTransactions: txns.filter((t) => t.status === "PENDING").length,
      activeWallets: wallets.length,
    };
  }, [wallets, txns]);

  const tabs = [
    { id: "transactions", label: "Wallet Transactions", icon: ArrowUpRight },
    { id: "links", label: "Payment Links", icon: LinkIcon },
    { id: "checkout_methods", label: "Checkout Methods", icon: CreditCard },
  ];

  const formatAmount = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

  const statDefs = [
    { label: "Total Balance",    value: formatAmount(stats.totalBalance),      iconBg: "rgba(22,199,132,0.12)", iconColor: "#16C784",  icon: Wallet,       trend: <TrendingUp className="h-4 w-4" style={{ color: "#16C784" }} /> },
    { label: "Today's Incoming", value: formatAmount(stats.todayIncoming),     iconBg: "rgba(59,130,246,0.12)", iconColor: "#3B82F6",  icon: ArrowDownLeft, trend: <span className="text-xs" style={{ color: "#16C784" }}>+12%</span> },
    { label: "Today's Outgoing", value: formatAmount(stats.todayOutgoing),     iconBg: "rgba(239,68,68,0.12)", iconColor: "#EF4444",  icon: ArrowUpRight, trend: <span className="text-xs" style={{ color: "#EF4444" }}>-8%</span> },
    { label: "Pending",          value: stats.pendingTransactions,              iconBg: "rgba(245,158,11,0.12)", iconColor: "#F59E0B",  icon: Clock,        trend: null },
    { label: "Active Wallets",   value: stats.activeWallets.toLocaleString(),  iconBg: "rgba(139,92,246,0.12)", iconColor: "#8B5CF6",  icon: Users,        trend: null },
  ];

  const filteredTxns = txns.filter((txn) =>
    (txn.wallet?.user?.firstName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (txn.wallet?.user?.lastName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (txn.wallet?.user?.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (txn.reference || txn.id).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
            Wallet & Payments
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage wallets, transactions, and payment settings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleRefresh} className="btn-secondary !h-[44px] !w-[44px] !px-0 flex items-center justify-center">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>
          <button className="btn-primary flex items-center gap-2 px-4">
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4">
        {statDefs.map((s) => (
          <div key={s.label} className="admin-card !p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: s.iconBg }}>
                <s.icon className="h-5 w-5" style={{ color: s.iconColor }} />
              </div>
              {s.trend}
            </div>
            <p className="text-sm" style={{ color: "var(--text-secondary)", minHeight: "2.5rem" }}>{s.label}</p>
            <p className="text-2xl font-bold mt-1" style={{ color: "var(--text-primary)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: "1px solid var(--card-border)" }}>
        <nav className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap border-b-2"
              style={activeTab === tab.id
                ? { borderColor: "#12D6C5", color: "#12D6C5" }
                : { borderColor: "transparent", color: "var(--text-secondary)" }
              }
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <>
          {/* Search / Filter */}
          <div className="flex flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-input pl-10 w-full"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="admin-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Fee</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <tr key={i}>
                        <td colSpan={8}>
                          <div className="h-5 rounded animate-pulse my-1 mx-2" style={{ background: "var(--icon-bg)" }} />
                        </td>
                      </tr>
                    ))
                  ) : filteredTxns.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12" style={{ color: "var(--text-muted)" }}>
                        No transactions found.
                      </td>
                    </tr>
                  ) : filteredTxns.map((txn) => (
                    <tr key={txn.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: txn.type === "CREDIT" ? "rgba(22,199,132,0.12)" : "rgba(239,68,68,0.12)" }}
                          >
                            {txn.type === "CREDIT" ? (
                              <ArrowDownLeft className="h-4 w-4" style={{ color: "#16C784" }} />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" style={{ color: "#EF4444" }} />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>
                              {txn.reference || txn.id}
                            </p>
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                              {txn.description || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {(txn.wallet?.user && `${txn.wallet.user.firstName || ""} ${txn.wallet.user.lastName || ""}`.trim()) || txn.wallet?.user?.email || "—"}
                      </td>
                      <td>
                        <span
                          className="font-semibold"
                          style={{ color: txn.type === "CREDIT" ? "#16C784" : "#EF4444" }}
                        >
                          {txn.type === "CREDIT" ? "+" : "−"}{formatAmount(Number(txn.amount))}
                        </span>
                      </td>
                      <td className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {txn.metadata?.fee ? formatAmount(Number(txn.metadata.fee)) : "—"}
                      </td>
                      <td className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {txn.metadata?.method || "—"}
                      </td>
                      <td>
                        {txn.status === "COMPLETED" && (
                          <span className="badge badge-success inline-flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" /> Completed
                          </span>
                        )}
                        {txn.status === "PENDING" && (
                          <span className="badge badge-warning inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        )}
                        {txn.status === "FAILED" && (
                          <span className="badge badge-danger inline-flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {new Date(txn.createdAt).toLocaleString()}
                      </td>
                      <td className="text-right">
                        <button className="text-sm font-medium" style={{ color: "#12D6C5" }}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Checkout Methods Tab */}
      {activeTab === "checkout_methods" && <CheckoutMethodsTab />}

      {/* Payment Links Tab */}
      {activeTab === "links" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Payment Links</h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                Generate secure, locked-amount payment links for clients
              </p>
            </div>
            <button onClick={() => setIsCreatingLink(true)} className="btn-primary flex items-center gap-2">
              <Plus className="h-4 w-4" /> Create Link
            </button>
          </div>

          {isCreatingLink && (
            <div className="admin-card">
              <h3 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Generate New Payment Link
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Locked Amount
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <input
                      type="number"
                      placeholder="0.00"
                      value={newLink.amount}
                      onChange={(e) => setNewLink({ ...newLink, amount: e.target.value })}
                      className="admin-input pl-10 w-full"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>
                    Description / Purpose
                  </label>
                  <input
                    placeholder="e.g. Custom Order #552"
                    value={newLink.description}
                    onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
                    className="admin-input w-full"
                  />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button
                  onClick={handleCreateLink}
                  disabled={!newLink.amount}
                  className="btn-primary disabled:opacity-50"
                >
                  Generate Link
                </button>
                <button onClick={() => setIsCreatingLink(false)} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Payment Links Table */}
          <div className="admin-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentLinks.map((link) => (
                    <tr key={link.id}>
                      <td className="font-mono font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {link.id}
                      </td>
                      <td className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {link.description}
                      </td>
                      <td className="font-semibold" style={{ color: "#16C784" }}>
                        {formatAmount(link.amount)}
                      </td>
                      <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {new Date(link.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {link.status === "ACTIVE" ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge" style={{ background: "var(--icon-bg)", color: "var(--text-muted)" }}>
                            {link.status}
                          </span>
                        )}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => copyToClipboard(link.id)}
                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                            style={copiedId === link.id
                              ? { background: "rgba(22,199,132,0.12)", color: "#16C784" }
                              : { background: "var(--icon-bg)", color: "var(--text-secondary)" }
                            }
                          >
                            {copiedId === link.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copiedId === link.id ? "Copied" : "Copy"}
                          </button>
                          <button
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: "var(--text-muted)" }}
                            onMouseEnter={e => { e.currentTarget.style.color = "#EF4444"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
      </div>
    </div>
  );
}

function CheckoutMethodsTab() {
  const [methods, setMethods] = useState([
    { id: "WHATSAPP",      name: "WhatsApp Payment", enabled: true, sortOrder: 1 },
    { id: "MOBILE_MONEY",  name: "Mobile Money",     enabled: true, sortOrder: 2 },
    { id: "BANK_TRANSFER", name: "Bank Transfer",    enabled: true, sortOrder: 3 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/internal/admin/settings")
      .then(res => res.json())
      .then(data => {
        const item = data?.find?.((d: any) => d.key === "CHECKOUT_METHODS");
        if (item?.value) {
          try { setMethods(JSON.parse(item.value)); } catch {}
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/internal/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "CHECKOUT_METHODS", value: JSON.stringify(methods) }),
      });
      if (!res.ok) throw new Error("Failed to save");
      alert("Checkout methods saved!");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = (id: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const updateSortOrder = (id: string, val: string) => {
    setMethods(methods.map(m => m.id === id ? { ...m, sortOrder: parseInt(val) || 0 } : m));
  };

  return (
    <div className="admin-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-base" style={{ color: "var(--text-primary)" }}>Checkout Methods</h3>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            Enable/disable payment methods and set their display order at checkout.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="space-y-3">
        {methods.sort((a, b) => a.sortOrder - b.sortOrder).map(method => (
          <div
            key={method.id}
            className="flex items-center justify-between p-4 rounded-xl transition-colors"
            style={{ border: "1px solid var(--card-border)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#12D6C5"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--card-border)"; }}
          >
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={method.enabled}
                  onChange={() => toggleMethod(method.id)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                  style={{
                    background: method.enabled ? "#12D6C5" : "var(--icon-bg)",
                    border: "1px solid var(--card-border)"
                  }}
                />
              </label>
              <div>
                <h4 className="font-semibold" style={{ color: "var(--text-primary)" }}>{method.name}</h4>
                <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{method.id}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Order:
              </span>
              <input
                type="number"
                value={method.sortOrder}
                onChange={(e) => updateSortOrder(method.id, e.target.value)}
                className="admin-input w-20 text-center font-bold !py-1.5"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
