"use client";

import { useEffect, useState } from "react";
import {
  FileText, Plus, Search, RefreshCw, Eye, Download,
  CheckCircle, Clock, XCircle, DollarSign, TrendingUp,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import Link from "next/link";

const ACCENT = "#6366F1";
const PAGE_SIZE = 15;

type Invoice = {
  id: string;
  invoiceNumber: string;
  status: "PAID" | "PENDING" | "OVERDUE" | "CANCELLED" | string;
  total: number;
  dueDate: string;
  createdAt: string;
  customer?: { firstName?: string; lastName?: string; email?: string };
  order?: { orderNumber?: string };
};

const STATUS_STYLE: Record<string, { color: string; bg: string; label: string }> = {
  PAID:      { color: "#16A34A", bg: "rgba(22,163,74,0.12)",   label: "Paid"      },
  PENDING:   { color: "#D97706", bg: "rgba(217,119,6,0.12)",   label: "Pending"   },
  OVERDUE:   { color: "#DC2626", bg: "rgba(220,38,38,0.12)",   label: "Overdue"   },
  CANCELLED: { color: "#6B7280", bg: "rgba(107,114,128,0.12)", label: "Cancelled" },
};

function fmtPrice(n: number) {
  return "$" + (n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function fmtDate(s: string) {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function InvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/internal/admin/invoices?limit=200", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || `Server ${res.status}`);
      const items = Array.isArray(body) ? body : body?.items || body?.data || body?.invoices || [];
      setInvoices(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = invoices.filter(inv => {
    const q = search.toLowerCase();
    const matchQ = !q
      || (inv.invoiceNumber || "").toLowerCase().includes(q)
      || (inv.customer?.firstName || "").toLowerCase().includes(q)
      || (inv.customer?.email || "").toLowerCase().includes(q);
    const matchS = statusFilter === "ALL" || inv.status === statusFilter;
    return matchQ && matchS;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalRevenue = invoices.reduce((s, i) => s + (i.status === "PAID" ? (i.total || 0) : 0), 0);
  const pendingAmt   = invoices.reduce((s, i) => s + (i.status === "PENDING" ? (i.total || 0) : 0), 0);
  const overdueAmt   = invoices.reduce((s, i) => s + (i.status === "OVERDUE" ? (i.total || 0) : 0), 0);

  const statCards = [
    { label: "Total Invoices",  value: invoices.length,     icon: FileText,    color: ACCENT,    up: true },
    { label: "Revenue Collected", value: fmtPrice(totalRevenue), icon: TrendingUp, color: "#22C55E", up: true },
    { label: "Pending Amount",  value: fmtPrice(pendingAmt), icon: Clock,       color: "#F59E0B", up: false },
    { label: "Overdue Amount",  value: fmtPrice(overdueAmt), icon: XCircle,     color: "#EF4444", up: false },
    { label: "Paid Invoices",   value: invoices.filter(i => i.status === "PAID").length, icon: CheckCircle, color: "#3B82F6", up: true },
    { label: "Overdue Count",   value: invoices.filter(i => i.status === "OVERDUE").length, icon: DollarSign, color: "#EC4899", up: false },
  ];

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: "20px 24px 40px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Invoicing</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>{invoices.length} total invoices</p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0, flexWrap: "wrap" }}>
          <button onClick={load}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 16px", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            <RefreshCw style={{ width: 14, height: 14 }} /> Refresh
          </button>
          <button
            style={{ display: "flex", alignItems: "center", gap: 6, background: ACCENT, border: "none", borderRadius: 10, padding: "9px 16px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <Plus style={{ width: 15, height: 15 }} /> New Invoice
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3" style={{ marginBottom: 20 }}>
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 16, height: 16, color: s.color }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.up ? "#16C784" : "#EF4444", background: s.up ? "rgba(22,199,132,0.12)" : "rgba(239,68,68,0.12)", padding: "2px 7px", borderRadius: 20 }}>
                  {s.up ? "▲" : "▼"}
                </span>
              </div>
              <div style={{ fontSize: typeof s.value === "string" ? 18 : 24, fontWeight: 800, color: "#111827", lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{s.label}</div>
            </div>
          );
        })}
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#EF4444", marginBottom: 16 }}>
          {error} — <button onClick={load} style={{ textDecoration: "underline", background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 13 }}>Retry</button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 180, maxWidth: 320 }}>
          <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", width: 14, height: 14 }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search invoices..."
            style={{ width: "100%", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 12px 9px 34px", color: "#111827", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", color: "#374151", fontSize: 13, outline: "none", cursor: "pointer" }}>
          <option value="ALL">All Status</option>
          {Object.entries(STATUS_STYLE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                {["#", "Invoice", "Customer", "Order", "Amount", "Status", "Due Date", "Created", "Actions"].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 700, color: "#374151", whiteSpace: "nowrap", fontSize: 12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    {[...Array(9)].map((_, j) => (
                      <td key={j} style={{ padding: "14px 16px" }}>
                        <div style={{ height: 13, borderRadius: 6, background: "#F3F4F6", width: j === 1 ? 100 : 70 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 48, textAlign: "center" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: "#EEF2FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText style={{ width: 22, height: 22, color: ACCENT }} />
                      </div>
                      <div style={{ fontWeight: 700, color: "#374151" }}>No invoices found</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                        {invoices.length === 0 ? "No invoices have been created yet." : "Try adjusting your search or filter."}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((inv, idx) => {
                const ss = STATUS_STYLE[inv.status] || { color: "#6B7280", bg: "rgba(107,114,128,0.12)", label: inv.status };
                const customer = inv.customer ? `${inv.customer.firstName || ""} ${inv.customer.lastName || ""}`.trim() || inv.customer.email : "—";
                return (
                  <tr key={inv.id} style={{ borderBottom: "1px solid #F3F4F6", background: idx % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                    <td style={{ padding: "12px 16px", color: "#9CA3AF", fontSize: 12 }}>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
                      #{inv.invoiceNumber || inv.id?.slice(0, 8)}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6B7280", whiteSpace: "nowrap" }}>{customer}</td>
                    <td style={{ padding: "12px 16px", color: "#6B7280", fontSize: 12 }}>
                      {inv.order?.orderNumber ? `#${inv.order.orderNumber}` : "—"}
                    </td>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#111827", whiteSpace: "nowrap" }}>
                      {fmtPrice(inv.total)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.color }}>
                        {ss.label}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: inv.status === "OVERDUE" ? "#DC2626" : "#6B7280", whiteSpace: "nowrap" }}>
                      {fmtDate(inv.dueDate)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap" }}>
                      {fmtDate(inv.createdAt)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href={`/admin/invoice/${inv.id}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#EEF2FF", border: "1px solid #C7D2FE", borderRadius: 7, padding: "5px 10px", color: "#4338CA", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                          <Eye style={{ width: 12, height: 12 }} /> View
                        </Link>
                        <button
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 7, padding: "5px 10px", color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                          <Download style={{ width: 12, height: 12 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #F3F4F6", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#6B7280" }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", cursor: page === 1 ? "not-allowed" : "pointer", color: "#374151", fontSize: 12, opacity: page === 1 ? 0.4 : 1 }}>
                <ChevronLeft style={{ width: 13, height: 13 }} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                const n = totalPages <= 7 ? i + 1 : i < 3 ? i + 1 : i === 3 ? "..." : totalPages - (6 - i);
                return (
                  <button key={i} disabled={n === "..."} onClick={() => typeof n === "number" && setPage(n)}
                    style={{ padding: "5px 10px", minWidth: 32, borderRadius: 7, border: "1px solid #E5E7EB", background: n === page ? ACCENT : "#fff", color: n === page ? "#fff" : "#374151", fontWeight: n === page ? 700 : 400, fontSize: 12, cursor: n === "..." ? "default" : "pointer" }}>
                    {n}
                  </button>
                );
              })}
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #E5E7EB", background: "#fff", cursor: page === totalPages ? "not-allowed" : "pointer", color: "#374151", fontSize: 12, opacity: page === totalPages ? 0.4 : 1 }}>
                <ChevronRight style={{ width: 13, height: 13 }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
