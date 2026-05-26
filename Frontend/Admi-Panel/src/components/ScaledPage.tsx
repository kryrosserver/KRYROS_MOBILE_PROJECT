"use client";

import { ReactNode } from "react";

export function ScaledPage({ children }: { children: ReactNode }) {
  return (
    <div
      className="-m-6 overflow-hidden"
      style={{
        background: "var(--bg-primary)",
        width: "calc(100% + 48px)",
      }}
    >
      <div
        style={{
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
          padding: "24px",
          minHeight: "100vh",
        }}
      >
        {children}
      </div>
    </div>
  );
}
