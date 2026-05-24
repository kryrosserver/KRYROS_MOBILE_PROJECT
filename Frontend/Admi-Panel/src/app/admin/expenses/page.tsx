"use client";

import { useState } from "react";
import { Plus, Search, DollarSign, Eye, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function ExpensesPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Expenses</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Track business expenses and costs
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      {/* Table Card */}
      <div className="admin-card !p-0 overflow-hidden">
        <div className="p-4" style={{ borderBottom: "1px solid var(--card-border)" }}>
          <div className="relative max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-10 w-full"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th className="text-right">Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-3" style={{ color: "var(--text-muted)" }}>
                    <DollarSign className="h-12 w-12 opacity-20" />
                    <p className="font-semibold text-sm">No expenses recorded yet</p>
                    <p className="text-xs">Track your first business expense to get started.</p>
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
