"use client";

import { useState, useEffect } from "react";
import { CreditCard, Eye, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface PaymentRecord {
  id: string;
  orderNumber: string;
  paymentStatus: string;
  paymentReference: string | null;
  total: number;
  createdAt: string;
  user: { firstName: string; lastName: string; email: string | null } | null;
}

export default function PaymentPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/payments", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load payments");
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Error loading payments"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-20" style={{ color: "#111827", padding: "20px" }}>
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#111827" }}>Payments</h2>
        <p className="text-sm mt-1" style={{ color: "#4B5563" }}>Track and manage received payments</p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20" style={{ color: "var(--text-muted)" }}>
          <div className="animate-spin h-6 w-6 border-2 border-current border-t-transparent rounded-full mr-2" />
          Loading payments...
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl flex items-center gap-2 text-sm font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="admin-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p.id} className="group">
                      <td className="font-mono font-semibold text-sm" style={{ color: "#111827" }}>
                        {p.orderNumber}
                      </td>
                      <td className="text-sm" style={{ color: "#4B5563" }}>
                        {p.user ? `${p.user.firstName} ${p.user.lastName}` : "Guest"}
                      </td>
                      <td className="text-sm" style={{ color: "var(--text-muted)" }}>
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-sm">
                        <span
                          className="px-2 py-0.5 rounded-md text-xs font-bold uppercase"
                          style={{
                            background:
                              p.paymentStatus === "SUCCESS"
                                ? "rgba(22,199,132,0.12)"
                                : p.paymentStatus === "FAILED"
                                  ? "rgba(239,68,68,0.1)"
                                  : "rgba(245,158,11,0.12)",
                            color:
                              p.paymentStatus === "SUCCESS"
                                ? "#16C784"
                                : p.paymentStatus === "FAILED"
                                  ? "#EF4444"
                                  : "#F59E0B",
                          }}
                        >
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="text-right font-semibold" style={{ color: "#16C784" }}>
                        {formatPrice(p.total)}
                      </td>
                      <td className="text-right">
                        <button
                          title="View"
                          className="p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAFB"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center" style={{ color: "var(--text-muted)" }}>
                      <div className="flex flex-col items-center gap-3">
                        <CreditCard className="h-10 w-10 opacity-20" />
                        <p className="font-semibold text-sm">No payments found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
