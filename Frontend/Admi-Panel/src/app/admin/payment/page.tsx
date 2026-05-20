"use client";

import { Plus, Search, CreditCard, Eye, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useInvoiceStore } from "@/providers/InvoiceStore";
import { formatPrice } from "@/lib/utils";

export default function PaymentPage() {
  const { payments } = useInvoiceStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500">Track and manage received payments</p>
        </div>
        <Link href="/admin/payment/new" className="bg-[#1e293b] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Plus className="h-4 w-4" /> Record Payment
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Reference #</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Method</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.length > 0 ? (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">{p.reference}</td>
                    <td className="px-6 py-4 text-slate-600">{p.clientId || "Walk-in Customer"}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-500 capitalize">{p.method || "Cash"}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900 text-green-600">{formatPrice(p.amount)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="View"><Eye className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="Print"><Printer className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <CreditCard className="h-10 w-10 text-slate-200" />
                      <p>No payments recorded. Record your first payment!</p>
                      <Link href="/admin/payment/new" className="text-slate-900 font-medium underline mt-2">
                        Record Payment
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
