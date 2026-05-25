"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, FileText, Eye, Download, Trash2, Printer } from "lucide-react";
import Link from "next/link";
import { useInvoiceStore } from "@/providers/InvoiceStore";
import { formatPrice } from "@/lib/utils";

export default function InvoicePage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(nextScale: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const naturalH = innerRef.current.scrollHeight; const visualH = naturalH * nextScale; const isMobile = window.innerWidth < 1024; const screenAvail = isMobile ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(visualH, screenAvail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? 960 : 1380; const nextScale = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${nextScale})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(nextScale))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);
  const { invoices } = useInvoiceStore();

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Invoices</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage and track your customer invoices
          </p>
        </div>
        <Link href="/admin/invoice/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Invoice
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Invoiced", value: invoices.reduce((s, i) => s + i.total, 0), color: "var(--text-primary)" },
          { label: "Paid",           value: 0,                                          color: "#16C784" },
          { label: "Unpaid",         value: invoices.reduce((s, i) => s + i.total, 0), color: "#F59E0B" },
          { label: "Overdue",        value: 0,                                          color: "#EF4444" },
        ].map((stat, i) => (
          <div key={i} className="admin-card !p-5">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{stat.label}</p>
            <p className="text-xl font-bold mt-1" style={{ color: stat.color }}>
              {formatPrice(stat.value)}
            </p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="admin-card !p-4 flex items-center gap-3">
        <div className="relative flex-1 min-w-[280px]">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            placeholder="Search by invoice number or client name..."
            className="admin-input pl-10 w-full"
          />
        </div>
        <select className="admin-input !w-auto">
          <option>All Status</option>
          <option>Paid</option>
          <option>Unpaid</option>
          <option>Overdue</option>
          <option>Draft</option>
        </select>
        <input type="date" className="admin-input !w-auto" />
      </div>

      {/* Invoice Table */}
      <div className="admin-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Due Date</th>
                <th className="text-right">Amount</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="group">
                    <td className="font-mono font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      #{inv.number}
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {inv.clientId || "Walk-in Customer"}
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}
                    </td>
                    <td className="text-right font-semibold" style={{ color: "var(--text-primary)" }}>
                      {formatPrice(inv.total)}
                    </td>
                    <td>
                      <span className="badge badge-warning">Unpaid</span>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {[
                          { icon: Eye,      title: "View",     danger: false },
                          { icon: Printer,  title: "Print",    danger: false },
                          { icon: Download, title: "Download", danger: false },
                          { icon: Trash2,   title: "Delete",   danger: true  },
                        ].map(({ icon: Icon, title, danger }) => (
                          <button
                            key={title}
                            title={title}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: danger ? "#EF4444" : "var(--text-muted)" }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = danger ? "rgba(239,68,68,0.1)" : "var(--hover-bg)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-14 text-center" style={{ color: "var(--text-muted)" }}>
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-10 w-10 opacity-20" />
                      <p className="font-semibold text-sm">No invoices yet</p>
                      <Link
                        href="/admin/invoice/new"
                        className="text-sm font-semibold underline"
                        style={{ color: "#12D6C5" }}
                      >
                        Create your first invoice
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
      </div>
    </div>
  );
}
