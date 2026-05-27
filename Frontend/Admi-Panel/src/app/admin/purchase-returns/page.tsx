"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, Search, RotateCw, Bell, Calendar, Sun, Moon, Menu, ChevronDown } from "lucide-react";

export default function PurchaseReturnsPage() {
  const [search, setSearch] = useState("");

  useEffect(() => {}, []);

  return (
    <div style={{ background: "#F5F6FA", minHeight: "100%", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "#111827", padding: "20px" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: "#111827" }}>Purchase Returns</h2>
              <p className="text-sm mt-1" style={{ color: "#4B5563" }}>Manage returns to suppliers</p>
            </div>
            <button className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> New Purchase Return</button>
          </div>
          <div className="admin-card !p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead><tr><th>Return #</th><th>Supplier</th><th>Date</th><th className="text-right">Amount</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  <tr><td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3" style={{ color: "var(--text-muted)" }}>
                      <RotateCw className="h-12 w-12 opacity-20" />
                      <p className="font-semibold text-sm">No purchase returns yet</p>
                      <p className="text-xs">Manage your first supplier return here.</p>
                    </div>
                  </td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
  );
}