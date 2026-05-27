"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Wallet, TrendingUp, ArrowDownLeft, ArrowUpRight,
  Search, RefreshCw, ChevronLeft, ChevronRight,
  Calendar, Filter, DollarSign, CreditCard,
  Users, ArrowRight, Eye,
} from "lucide-react";

type WalletAccount = {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  status: "ACTIVE" | "FROZEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  user?: { firstName: string; lastName: string; email: string };
};

type Transaction = {
  id: string;
  walletId: string;
  type: "CREDIT" | "DEBIT";
  amount: number;
  description: string;
  createdAt: string;
  wallet?: { user?: { firstName: string; lastName: string } };
};

function StatusBadge({ status }: { status: WalletAccount["status"] }) {
  const map = {
    ACTIVE:  { bg: "rgba(22,199,132,.12)", color: "#16C784" },
    FROZEN:  { bg: "rgba(245,158,11,.12)", color: "#F59E0B" },
    CLOSED:  { bg: "rgba(239,68,68,.1)",  color: "#EF4444" },
  };
  const s = map[status] ?? map.ACTIVE;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
      style={{ background: s.bg, color: s.color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.color }} />
      {status}
    </span>
  );
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(" ").map(w => w[0] || "").slice(0, 2).join("").toUpperCase();
  const colors = ["#6366F1","#F59E0B","#16C784","#3B82F6","#EC4899"];
  const bg = colors[(name.charCodeAt(0) || 0) % colors.length];
  return (
    <div className="flex items-center justify-center rounded-full shrink-0 font-bold text-white"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.34 }}>
      {initials || "?"}
    </div>
  );
}

const ROWS = 12;

export default function WalletPage() {
  const [wallets, setWallets] = useState<WalletAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tab, setTab] = useState<"wallets" | "transactions">("wallets");
  const [page, setPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadWallets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/wallets");
      const data = await res.json();
      if (res.ok) setWallets(Array.isArray(data) ? data : data.wallets ?? data.items ?? []);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const loadTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res = await fetch("/api/admin/wallets/transactions");
      const data = await res.json();
      if (res.ok) setTransactions(Array.isArray(data) ? data : data.transactions ?? data.items ?? []);
    } catch { /* silent */ }
    finally { setTxLoading(false); }
  }, []);

  useEffect(() => { loadWallets(); loadTransactions(); }, [loadWallets, loadTransactions]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    Promise.all([loadWallets(), loadTransactions()]).finally(() => setTimeout(() => setIsRefreshing(false), 400));
  };

  const totalBalance = wallets.reduce((s, w) => s + (w.balance || 0), 0);
  const totalCredit = transactions.filter(t => t.type === "CREDIT").reduce((s, t) => s + (t.amount || 0), 0);
  const totalDebit = transactions.filter(t => t.type === "DEBIT").reduce((s, t) => s + (t.amount || 0), 0);

  const filteredWallets = wallets.filter(w => {
    const q = search.toLowerCase();
    const name = `${w.user?.firstName || ""} ${w.user?.lastName || ""}`.toLowerCase();
    const matchSearch = !q || name.includes(q) || (w.user?.email || "").toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || w.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const filteredTx = transactions.filter(t => {
    const q = search.toLowerCase();
    return !q || (t.description || "").toLowerCase().includes(q) ||
      `${t.wallet?.user?.firstName || ""} ${t.wallet?.user?.lastName || ""}`.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil((tab === "wallets" ? filteredWallets : filteredTx).length / ROWS));
  const walletRows = filteredWallets.slice((page - 1) * ROWS, page * ROWS);
  const txRows = filteredTx.slice((page - 1) * ROWS, page * ROWS);

  const stats = [
    { label: "Total Wallets",   value: wallets.length,                              color: "#6366F1", bg: "rgba(99,102,241,.1)",  icon: Wallet },
    { label: "Total Balance",   value: `$${totalBalance.toFixed(2)}`,               color: "#16C784", bg: "rgba(22,199,132,.1)",  icon: DollarSign },
    { label: "Total Credits",   value: `$${totalCredit.toFixed(2)}`,                color: "#3B82F6", bg: "rgba(59,130,246,.1)",  icon: ArrowDownLeft },
    { label: "Total Debits",    value: `$${totalDebit.toFixed(2)}`,                 color: "#EF4444", bg: "rgba(239,68,68,.1)",   icon: ArrowUpRight },
  ];

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: "20px 16px 40px" }}>
      <div className="max-w-full mx-auto space-y-5">

        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold" style={{ color: "#111827" }}>Wallet &amp; Payouts</h1>
            <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>Manage digital wallets and transaction history</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={handleRefresh}
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} style={{ color: "#6B7280" }} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(s => (
            <div key={s.label} className="rounded-2xl p-4"
              style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
              <div className="h-9 w-9 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
                <s.icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <p className="text-xs font-medium" style={{ color: "#6B7280" }}>{s.label}</p>
              <p className="text-xl font-bold mt-0.5 truncate" style={{ color: s.color }}>
                {loading ? "—" : s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Tabs + Filters */}
        <div className="rounded-2xl p-4 flex flex-col gap-3"
          style={{ background: "#fff", border: "1px solid #E5E7EB" }}>
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl w-full sm:w-auto self-start"
            style={{ background: "#F3F4F6" }}>
            {(["wallets","transactions"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setPage(1); }}
                className="px-4 h-8 rounded-lg text-sm font-semibold transition-all capitalize"
                style={tab === t
                  ? { background: "#fff", color: "#111827", boxShadow: "0 1px 3px rgba(0,0,0,.1)" }
                  : { color: "#6B7280" }}>
                {t}
              </button>
            ))}
          </div>
          {/* Filters */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "#9CA3AF" }} />
              <input placeholder={tab === "wallets" ? "Search by name or email…" : "Search transactions…"}
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="w-full h-9 pl-9 pr-3 rounded-xl text-sm outline-none"
                style={{ border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827" }} />
            </div>
            {tab === "wallets" && (
              <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                className="h-9 px-3 rounded-xl text-sm outline-none shrink-0"
                style={{ border: "1px solid #E5E7EB", background: "#F9FAFB", color: "#111827", minWidth: 120 }}>
                <option value="all">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="FROZEN">Frozen</option>
                <option value="CLOSED">Closed</option>
              </select>
            )}
          </div>
        </div>

        {/* Wallets Table */}
        {tab === "wallets" && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                    {["Account Holder","Balance","Currency","Status","Last Updated",""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: "#6B7280" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td colSpan={6} className="px-4 py-3">
                          <div className="h-5 rounded-lg animate-pulse" style={{ background: "#F3F4F6", width: `${50 + (i % 4) * 12}%` }} />
                        </td>
                      </tr>
                    ))
                  ) : walletRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <Wallet className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: "#9CA3AF" }} />
                        <p className="text-sm font-medium" style={{ color: "#9CA3AF" }}>No wallets found</p>
                      </td>
                    </tr>
                  ) : walletRows.map(w => (
                    <tr key={w.id} style={{ borderBottom: "1px solid #F3F4F6" }} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${w.user?.firstName || "?"} ${w.user?.lastName || ""}`} />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate" style={{ color: "#111827" }}>
                              {w.user?.firstName} {w.user?.lastName}
                            </p>
                            <p className="text-xs mt-0.5 truncate" style={{ color: "#9CA3AF" }}>{w.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-bold text-sm" style={{ color: "#111827" }}>
                          ${(w.balance || 0).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded"
                          style={{ background: "#F3F4F6", color: "#6B7280" }}>{w.currency || "USD"}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={w.status || "ACTIVE"} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs flex items-center gap-1.5" style={{ color: "#6B7280" }}>
                          <Calendar className="h-3 w-3 shrink-0" />
                          {w.updatedAt ? new Date(w.updatedAt).toLocaleDateString() : "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button className="h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-semibold"
                            style={{ background: "rgba(99,102,241,.1)", color: "#6366F1" }}>
                            <Eye className="h-3 w-3" /> View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid #F3F4F6" }}>
              <span className="text-xs" style={{ color: "#9CA3AF" }}>
                {filteredWallets.length === 0 ? "0 results" : `${(page-1)*ROWS+1}–${Math.min(page*ROWS, filteredWallets.length)} of ${filteredWallets.length}`}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                  className="h-8 w-8 rounded-lg flex items-center justify-center disabled:opacity-40"
                  style={{ border: "1px solid #E5E7EB", background: "#fff" }}>
                  <ChevronLeft className="h-4 w-4" style={{ color: "#6B7280" }} />
                </button>
                <span className="text-xs px-2" style={{ color: "#6B7280" }}>{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                  className="h-8 w-8 rounded-lg flex items-center justify-center disabled:opacity-40"
                  style={{ border: "1px solid #E5E7EB", background: "#fff" }}>
                  <ChevronRight className="h-4 w-4" style={{ color: "#6B7280" }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        {tab === "transactions" && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "#fff", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,.05)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                    {["Type","Account","Amount","Description","Date"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                        style={{ color: "#6B7280" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {txLoading ? (
                    [...Array(6)].map((_, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                        <td colSpan={5} className="px-4 py-3">
                          <div className="h-5 rounded-lg animate-pulse" style={{ background: "#F3F4F6", width: `${50 + (i % 3) * 15}%` }} />
                        </td>
                      </tr>
                    ))
                  ) : txRows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: "#9CA3AF" }} />
                        <p className="text-sm font-medium" style={{ color: "#9CA3AF" }}>No transactions found</p>
                      </td>
                    </tr>
                  ) : txRows.map(t => (
                    <tr key={t.id} style={{ borderBottom: "1px solid #F3F4F6" }} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                          style={t.type === "CREDIT"
                            ? { background: "rgba(22,199,132,.12)", color: "#16C784" }
                            : { background: "rgba(239,68,68,.1)", color: "#EF4444" }}>
                          {t.type === "CREDIT"
                            ? <ArrowDownLeft className="h-3 w-3" />
                            : <ArrowUpRight className="h-3 w-3" />}
                          {t.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold" style={{ color: "#111827" }}>
                          {t.wallet?.user?.firstName} {t.wallet?.user?.lastName}
                        </p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="font-bold text-sm"
                          style={{ color: t.type === "CREDIT" ? "#16C784" : "#EF4444" }}>
                          {t.type === "CREDIT" ? "+" : "-"}${(t.amount || 0).toFixed(2)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm truncate max-w-xs" style={{ color: "#4B5563" }}>{t.description || "—"}</p>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-xs flex items-center gap-1.5" style={{ color: "#6B7280" }}>
                          <Calendar className="h-3 w-3 shrink-0" />
                          {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : "—"}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: "1px solid #F3F4F6" }}>
              <span className="text-xs" style={{ color: "#9CA3AF" }}>
                {filteredTx.length === 0 ? "0 results" : `${(page-1)*ROWS+1}–${Math.min(page*ROWS, filteredTx.length)} of ${filteredTx.length}`}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                  className="h-8 w-8 rounded-lg flex items-center justify-center disabled:opacity-40"
                  style={{ border: "1px solid #E5E7EB", background: "#fff" }}>
                  <ChevronLeft className="h-4 w-4" style={{ color: "#6B7280" }} />
                </button>
                <span className="text-xs px-2" style={{ color: "#6B7280" }}>{page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                  className="h-8 w-8 rounded-lg flex items-center justify-center disabled:opacity-40"
                  style={{ border: "1px solid #E5E7EB", background: "#fff" }}>
                  <ChevronRight className="h-4 w-4" style={{ color: "#6B7280" }} />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
