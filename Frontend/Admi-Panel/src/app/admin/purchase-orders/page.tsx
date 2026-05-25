"use client";

import { useState } from "react";
import { Plus, Search, ShoppingCart } from "lucide-react";

export default function PurchaseOrdersPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Purchase Orders</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage and track your orders to suppliers
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Purchase Order
        </button>
      </div>

      <div className="admin-card !p-0 overflow-hidden">
        <div className="p-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
            <input placeholder="Search purchase orders..." value={search} onChange={e => setSearch(e.target.value)} className="admin-input pl-10 w-full" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order #</th><th>Supplier</th><th>Date</th>
                <th className="text-right">Total</th><th>Status</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3" style={{ color: "var(--text-muted)" }}>
                    <ShoppingCart className="h-12 w-12 opacity-20" />
                    <p className="font-semibold text-sm">No purchase orders yet</p>
                    <p className="text-xs">Create your first purchase order to track supplier orders.</p>
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
