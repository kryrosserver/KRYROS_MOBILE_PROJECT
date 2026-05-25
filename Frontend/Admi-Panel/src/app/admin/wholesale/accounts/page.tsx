"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Users, CheckCircle, XCircle, Clock, Building2, Mail,
  FileText, RefreshCw, Search, ChevronLeft, Shield,
  AlertTriangle, CheckSquare, Square, ChevronRight
} from "lucide-react";
import Link from "next/link";

type WholesaleAccount = {
  id: string;
  userId: string;
  companyName: string;
  taxId: string;
  address: string;
  contactPerson: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
  discountTier: number;
  notes: string;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string };
};

const ACCENT = "#12D6C5";

function StatusBadge({ status }: { status: WholesaleAccount["status"] }) {
  const map = {
    APPROVED:  { bg: "rgba(22,199,132,0.12)",  color: "#16C784", icon: CheckCircle },
    PENDING:   { bg: "rgba(245,158,11,0.12)",  color: "#F59E0B", icon: Clock },
    SUSPENDED: { bg: "rgba(239,68,68,0.1)",    color: "#EF4444", icon: AlertTriangle },
    REJECTED:  { bg: "rgba(239,68,68,0.1)",    color: "#EF4444", icon: XCircle },
  };
  const { bg, color, icon: Icon } = map[status] ?? map.PENDING;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold" style={{ background: bg, color }}>
      <Icon className="h-3 w-3" /> {status}
    </span>
  );
}

export default function WholesaleAccountsPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const h = innerRef.current.scrollHeight * s; const avail = window.innerWidth < 1024 ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(h, avail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const base = vw < 960 ? 750 : 1380; if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const s = Math.min(1, vw / base); innerRef.current.style.width = `${base}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [accounts, setAccounts] = useState<WholesaleAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/admin/wholesale/accounts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      setAccounts(Array.isArray(data) ? data : data.items ?? []);
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRefresh = () => { setIsRefreshing(true); load().finally(() => setTimeout(() => setIsRefreshing(false), 300)); };

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/wholesale/accounts/${id}/status`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await load();
    } catch (e: unknown) { alert(e instanceof Error ? e.message : "Error"); }
    finally { setUpdatingId(null); }
  };

  const filtered = accounts.filter(a => {
    const matchSearch = !search ||
      a.companyName.toLowerCase().includes(search.toLowerCase()) ||
      a.user.email.toLowerCase().includes(search.toLowerCase()) ||
      a.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const stats = [
    { label: "Total Accounts", value: accounts.length, color: ACCENT, icon: Users, bg: "rgba(18,214,197,0.12)" },
    { label: "Pending Review", value: accounts.filter(a => a.status === "PENDING").length, color: "#F59E0B", icon: Clock, bg: "rgba(245,158,11,0.12)" },
    { label: "Approved", value: accounts.filter(a => a.status === "APPROVED").length, color: "#16C784", icon: CheckCircle, bg: "rgba(22,199,132,0.12)" },
    { label: "Suspended / Rejected", value: accounts.filter(a => a.status === "SUSPENDED" || a.status === "REJECTED").length, color: "#EF4444", icon: Shield, bg: "rgba(239,68,68,0.1)" },
  ];

  const handleSelectAll = () => {
    if (selected.size === paginated.length && paginated.length > 0) setSelected(new Set());
    else setSelected(new Set(paginated.map(a => a.id)));
  };

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>

          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/wholesale" className="h-9 w-9 rounded-xl flex items-center justify-center btn-secondary !px-0">
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                  <Link href="/admin/wholesale" style={{ color: "var(--text-muted)" }}>Wholesale</Link>
                  <span>/</span><span>Accounts</span>
                </div>
                <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Wholesale Accounts</h1>
              </div>
            </div>
            <button onClick={handleRefresh} className="btn-secondary !h-10 !w-10 !px-0 flex items-center justify-center">
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            {stats.map(s => (
              <div key={s.label} className="admin-card !p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                    <s.icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)", minHeight: "2.5rem" }}>{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {error && (
            <div className="rounded-xl p-4 text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>{error}</div>
          )}

          {/* Filter Bar */}
          <div className="admin-card !p-4 flex items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
              <input
                placeholder="Search company, email, contact..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="admin-input pl-10 w-full"
              />
            </div>
            <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="admin-input h-9 text-sm !w-auto min-w-[150px]">
              <option value="all">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Table */}
          <div className="admin-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th className="!px-4 !py-3 w-10">
                      <button onClick={handleSelectAll}>
                        {selected.size === paginated.length && paginated.length > 0
                          ? <CheckSquare className="h-4 w-4" style={{ color: ACCENT }} />
                          : <Square className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
                      </button>
                    </th>
                    <th>Company</th>
                    <th>Contact Person</th>
                    <th>Tax ID / Address</th>
                    <th>Discount Tier</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(rowsPerPage)].map((_, i) => (
                      <tr key={i}><td colSpan={8}><div className="h-5 rounded animate-pulse my-1 mx-2" style={{ background: "var(--icon-bg)" }} /></td></tr>
                    ))
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-14">
                        <Building2 className="h-10 w-10 mx-auto mb-3 opacity-30" style={{ color: "var(--text-muted)" }} />
                        <p className="font-semibold text-sm" style={{ color: "var(--text-muted)" }}>No wholesale accounts found</p>
                      </td>
                    </tr>
                  ) : paginated.map(acc => (
                    <tr key={acc.id}>
                      <td className="!px-4">
                        <button onClick={() => { const n = new Set(selected); n.has(acc.id) ? n.delete(acc.id) : n.add(acc.id); setSelected(n); }}>
                          {selected.has(acc.id)
                            ? <CheckSquare className="h-4 w-4" style={{ color: ACCENT }} />
                            : <Square className="h-4 w-4" style={{ color: "var(--text-muted)" }} />}
                        </button>
                      </td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--icon-bg)" }}>
                            <Building2 className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate max-w-[180px]" style={{ color: "var(--text-primary)" }}>{acc.companyName}</p>
                            <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--text-muted)" }}>
                              <Mail className="h-3 w-3" /> {acc.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{acc.contactPerson}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{acc.user.firstName} {acc.user.lastName}</p>
                      </td>
                      <td>
                        <p className="text-xs font-mono flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                          <FileText className="h-3 w-3 shrink-0" /> {acc.taxId || "N/A"}
                        </p>
                        <p className="text-xs mt-1 truncate max-w-[180px] italic" style={{ color: "var(--text-muted)" }}>
                          {acc.address || "No address"}
                        </p>
                      </td>
                      <td>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(18,214,197,0.1)", color: ACCENT }}>
                          Tier {acc.discountTier || 0}
                        </span>
                      </td>
                      <td><StatusBadge status={acc.status} /></td>
                      <td className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {acc.createdAt ? new Date(acc.createdAt).toLocaleDateString() : "—"}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {acc.status === "PENDING" && (<>
                            <button
                              onClick={() => updateStatus(acc.id, "APPROVED")}
                              disabled={updatingId === acc.id}
                              className="px-3 h-8 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                              style={{ background: "rgba(22,199,132,0.12)", color: "#16C784" }}
                            >Approve</button>
                            <button
                              onClick={() => updateStatus(acc.id, "REJECTED")}
                              disabled={updatingId === acc.id}
                              className="px-3 h-8 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                              style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444" }}
                            >Reject</button>
                          </>)}
                          {acc.status === "APPROVED" && (
                            <button
                              onClick={() => updateStatus(acc.id, "SUSPENDED")}
                              disabled={updatingId === acc.id}
                              className="px-3 h-8 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                              style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B" }}
                            >Suspend</button>
                          )}
                          {acc.status === "SUSPENDED" && (
                            <button
                              onClick={() => updateStatus(acc.id, "APPROVED")}
                              disabled={updatingId === acc.id}
                              className="px-3 h-8 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                              style={{ background: "rgba(18,214,197,0.12)", color: ACCENT }}
                            >Re-activate</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: "1px solid var(--card-border)" }}>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {filtered.length === 0 ? "0" : `${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, filtered.length)}`} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0 disabled:opacity-40">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const n = totalPages <= 5 ? i + 1 : page <= 3 ? i + 1 : page >= totalPages - 2 ? totalPages - 4 + i : page - 2 + i;
                  return (
                    <button key={n} onClick={() => setPage(n)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-xs font-semibold"
                      style={n === page ? { background: ACCENT, color: "#fff" } : { color: "var(--text-muted)" }}
                    >{n}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 w-8 rounded-lg flex items-center justify-center btn-secondary !px-0 disabled:opacity-40">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
