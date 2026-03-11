"use client";

import { useState } from "react";
import { Plus, Search, FileText, MoreVertical, Eye, Trash2, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function SaleOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sale Orders</h1>
          <p className="text-slate-500">Manage customer sales orders and fulfillment</p>
        </div>
        <button className="bg-[#1e293b] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Plus className="h-4 w-4" /> New Sale Order
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search sale orders..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <ShoppingBag className="h-12 w-12 text-slate-200" />
                    <p>No sale orders found. Create your first sale order!</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
