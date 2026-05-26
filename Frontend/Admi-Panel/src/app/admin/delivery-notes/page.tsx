"use client";

import { Construction } from "lucide-react";

export default function DeliverynotesPage() {
  return (
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)", padding: "20px" }}>
      <div>
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Delivery notes</h2>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>Manage your delivery notes</p>
      </div>
      <div className="admin-card flex flex-col items-center justify-center py-20 text-center gap-4">
        <div className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--icon-bg)" }}>
          <Construction className="h-7 w-7" style={{ color: "var(--text-muted)" }} />
        </div>
        <div>
          <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Coming Soon</p>
          <p className="text-sm mt-1 max-w-sm" style={{ color: "var(--text-secondary)" }}>
            This feature is under development. The backend API endpoint for delivery notes is not yet available.
          </p>
        </div>
      </div>
    </div>
  );
}
