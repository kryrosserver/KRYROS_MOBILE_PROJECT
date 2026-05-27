"use client";

import { Search } from "lucide-react";

export default function WalletPage() {
  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: 0 }}>Wallet</h2>
          <p style={{ fontSize: 13, color: "#6B7280", margin: "4px 0 0" }}>Manage digital wallets</p>
        </div>
      </div>
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: 40, textAlign: "center" }}>
        <p style={{ color: "#9CA3AF", fontSize: 13 }}>Wallet management coming soon.</p>
      </div>
    </div>
  );
}
