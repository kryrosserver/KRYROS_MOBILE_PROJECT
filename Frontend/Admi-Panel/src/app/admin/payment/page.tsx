"use client";

import { Plus, Search, CreditCard, Eye, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useInvoiceStore } from "@/providers/InvoiceStore";
import { formatPrice } from "@/lib/utils";

export default function PaymentPage() {
  const { payments } = useInvoiceStore();

  return (
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Payments</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Track and manage received payments
          </p>
        </div>
        <Link href="/admin/payment/new" className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Record Payment
        </Link>
      </div>

      {/* Payments Table */}
      <div className="admin-card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Method</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="group">
                    <td className="font-mono font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {p.reference}
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      {p.clientId || "Walk-in Customer"}
                    </td>
                    <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-sm capitalize" style={{ color: "var(--text-secondary)" }}>
                      {p.method || "Cash"}
                    </td>
                    <td className="text-right font-semibold" style={{ color: "#16C784" }}>
                      {formatPrice(p.amount)}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {[
                          { icon: Eye,     title: "View",   danger: false },
                          { icon: Printer, title: "Print",  danger: false },
                          { icon: Trash2,  title: "Delete", danger: true  },
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
                  <td colSpan={6} className="px-6 py-14 text-center" style={{ color: "var(--text-muted)" }}>
                    <div className="flex flex-col items-center gap-3">
                      <CreditCard className="h-10 w-10 opacity-20" />
                      <p className="font-semibold text-sm">No payments recorded yet</p>
                      <Link
                        href="/admin/payment/new"
                        className="text-sm font-semibold underline"
                        style={{ color: "#12D6C5" }}
                      >
                        Record your first payment
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
