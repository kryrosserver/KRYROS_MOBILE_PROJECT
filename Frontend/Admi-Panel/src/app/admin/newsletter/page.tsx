"use client";

import { useState, useEffect } from "react";
import {
  Mail, Users, Download, Search, Trash2,
  CheckCircle2, XCircle, Loader2
} from "lucide-react";

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
      if (res.ok) setSubscribers(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase()) && (!activeOnly || s.isActive)
  );

  const exportCSV = () => {
    const csv =
      "Email,Status,Joined Date\n" +
      filtered.map(s =>
        `${s.email},${s.isActive ? "Active" : "Unsubscribed"},${new Date(s.createdAt).toLocaleDateString()}`
      ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "subscribers.csv" });
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const stats = [
    { label: "Total Subscribers", value: subscribers.length,                          icon: Users,         color: "var(--text-primary)",  bg: "var(--icon-bg)" },
    { label: "Active",            value: subscribers.filter(s =>  s.isActive).length, icon: CheckCircle2,  color: "#16C784",               bg: "rgba(22,199,132,0.10)" },
    { label: "Unsubscribed",      value: subscribers.filter(s => !s.isActive).length, icon: XCircle,       color: "#EF4444",               bg: "rgba(239,68,68,0.10)" },
  ];

  return (
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ background: "rgba(59,130,246,0.12)" }}>
            <Mail className="h-5 w-5" style={{ color: "#3B82F6" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Newsletter Hub</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              Manage subscribers and marketing campaigns
            </p>
          </div>
        </div>
        <button
          onClick={exportCSV}
          className="btn-secondary flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="admin-card flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                {label}
              </p>
              <p className="text-3xl font-black mt-1" style={{ color }}>{value}</p>
            </div>
            <div className="p-3 rounded-xl" style={{ background: bg }}>
              <Icon className="h-6 w-6 opacity-60" style={{ color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card !p-0 overflow-hidden">
        <div
          className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
          style={{ borderBottom: "1px solid var(--card-border)" }}
        >
          <div className="relative w-full sm:w-80">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="text"
              placeholder="Search emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-10 w-full"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className="w-10 h-6 rounded-full relative transition-colors"
              style={{ background: activeOnly ? "#12D6C5" : "var(--card-border)" }}
              onClick={() => setActiveOnly(!activeOnly)}
            >
              <div
                className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform`}
                style={{
                  background: "white",
                  transform: activeOnly ? "translateX(16px)" : "none",
                }}
              />
            </div>
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--text-muted)" }}
            >
              Active Only
            </span>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subscriber Email</th>
                <th>Status</th>
                <th>Joined Date</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto opacity-30" style={{ color: "var(--text-muted)" }} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-2" style={{ color: "var(--text-muted)" }}>
                      <Mail className="h-10 w-10 opacity-20" />
                      <p className="font-semibold text-sm">No subscribers found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((subscriber) => (
                  <tr key={subscriber.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: "var(--icon-bg)", color: "var(--text-secondary)" }}
                        >
                          {subscriber.email[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                          {subscriber.email}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-bold"
                        style={subscriber.isActive
                          ? { background: "rgba(22,199,132,0.12)", color: "#16C784" }
                          : { background: "var(--icon-bg)", color: "var(--text-muted)" }
                        }
                      >
                        {subscriber.isActive ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {new Date(subscriber.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric"
                      })}
                    </td>
                    <td className="text-right">
                      <button
                        className="p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        style={{ color: "#EF4444" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
