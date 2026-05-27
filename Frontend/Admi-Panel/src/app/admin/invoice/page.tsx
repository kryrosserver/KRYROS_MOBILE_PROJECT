"use client";

import { Construction } from "lucide-react";

export default function InvoicePage() {
  return (
    <div className="space-y-6 pb-20" style={{ color: "#111827", padding: "20px" }}>
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "#111827" }}>Invoice</h2>
        <p className="text-sm mt-1" style={{ color: "#4B5563" }}>Manage your invoice</p>
      </div>
      <div className="admin-card flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: "#F9FAFB" }}>
          <Construction className="h-7 w-7" style={{ color: "var(--text-muted)" }} />
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: "#111827" }}>Coming Soon</p>
          <p className="text-sm mt-1 max-w-sm" style={{ color: "#4B5563" }}>
            This feature is under development. The backend API endpoint for invoice is not yet available.
          </p>
        </div>
      </div>
    </div>
  );
}
