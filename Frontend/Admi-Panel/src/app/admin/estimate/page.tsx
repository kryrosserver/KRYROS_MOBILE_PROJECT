"use client";

import { Plus, Search, FileEdit, Eye, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useInvoiceStore } from "@/providers/InvoiceStore";
import { formatPrice } from "@/lib/utils";

export default function EstimatePage() {
  const { estimates } = useInvoiceStore();

  return (
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Estimates</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage and track your customer estimates
          </p>
        </div>
        <Link href="/admin/estimate/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Estimate
        </Link>
      </div>

      {/* Table */}
      <div className="admin-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Estimate #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Valid Until</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {estimates.length > 0 ? (
                estimates.map((est) => (
                  <tr key={est.id} className="group">
                    <td className="font-mono font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      #{est.number}
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {est.clientId || "Walk-in Customer"}
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {new Date(est.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {est.validUntil ? new Date(est.validUntil).toLocaleDateString() : "—"}
                    </td>
                    <td className="text-right font-bold" style={{ color: "var(--text-primary)" }}>
                      {formatPrice(est.total)}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {[
                          { Icon: Eye,     title: "View",   danger: false },
                          { Icon: Printer, title: "Print",  danger: false },
                          { Icon: Trash2,  title: "Delete", danger: true  },
                        ].map(({ Icon, title, danger }) => (
                          <button
                            key={title}
                            title={title}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: danger ? "#EF4444" : "var(--text-muted)" }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = danger ? "rgba(239,68,68,0.1)" : "var(--hover-bg)";
                            }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
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
                  <td colSpan={6} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-3" style={{ color: "var(--text-muted)" }}>
                      <FileEdit className="h-10 w-10 opacity-20" />
                      <p className="font-semibold text-sm">No estimates yet</p>
                      <Link
                        href="/admin/estimate/new"
                        className="text-sm font-bold underline"
                        style={{ color: "#12D6C5" }}
                      >
                        Create your first estimate
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
  );
}
