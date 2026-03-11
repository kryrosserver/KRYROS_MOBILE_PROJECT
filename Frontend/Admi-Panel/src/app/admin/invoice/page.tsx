"use client";

import { Plus, Search, FileText, MoreVertical, Eye, Download, Trash2, Printer } from "lucide-react";
import Link from "next/link";
import { useInvoiceStore } from "@/providers/InvoiceStore";
import { formatPrice } from "@/lib/utils";

export default function InvoicePage() {
  const { invoices } = useInvoiceStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-500">Manage and track your customer invoices</p>
        </div>
        <Link href="/admin/invoice/new" className="bg-[#1e293b] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Plus className="h-4 w-4" /> New Invoice
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Invoiced", value: invoices.reduce((s, i) => s + i.total, 0), color: "text-slate-900" },
          { label: "Paid", value: 0, color: "text-green-600" },
          { label: "Unpaid", value: invoices.reduce((s, i) => s + i.total, 0), color: "text-orange-600" },
          { label: "Overdue", value: 0, color: "text-red-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${stat.color}`}>{formatPrice(stat.value)}</p>
          </div>
        ))}
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            placeholder="Search by invoice number or client name..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
          />
        </div>
        <select className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none">
          <option>All Status</option>
          <option>Paid</option>
          <option>Unpaid</option>
          <option>Overdue</option>
          <option>Draft</option>
        </select>
        <input type="date" className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 focus:outline-none" />
      </div>

      {/* Invoice List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Invoice #</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Due Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {invoices.length > 0 ? (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-900">#{inv.number}</td>
                    <td className="px-6 py-4 text-slate-600">{inv.clientId || "Walk-in Customer"}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "-"}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatPrice(inv.total)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        Unpaid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="View"><Eye className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="Print"><Printer className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="Download"><Download className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-10 w-10 text-slate-200" />
                      <p>No invoices found. Create your first invoice!</p>
                      <Link href="/admin/invoice/new" className="text-slate-900 font-medium underline mt-2">
                        Create Invoice
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
