"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
      setSubmitted(true);
    } catch {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    height: "52px",
    background: "#111827",
    border: "1px solid #2B3648",
    borderRadius: "14px",
    color: "#FFFFFF",
    fontSize: "14px",
    padding: "0 16px 0 44px",
    outline: "none",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
  };

  if (submitted) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "#151E2D",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "28px",
          padding: "48px 40px",
          boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(18,214,197,0.1)",
            border: "1.5px solid rgba(18,214,197,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
          }}
        >
          <CheckCircle2 style={{ width: "28px", height: "28px", color: "#12D6C5" }} />
        </div>

        <h2 className="text-white font-bold text-2xl mb-3">Reset Token Issued</h2>
        <p className="text-sm mb-6" style={{ color: "#AAB4C5", lineHeight: "1.6" }}>
          If an account with that identifier exists, a reset token has been generated. Use it on
          the reset password page within <strong style={{ color: "#FFFFFF" }}>1 hour</strong>.
        </p>

        {resetToken && (
          <div
            className="rounded-xl px-4 py-4 mb-6 text-left"
            style={{
              background: "rgba(18,214,197,0.06)",
              border: "1px solid rgba(18,214,197,0.25)",
            }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: "#12D6C5" }}>
              RESET TOKEN — copy this now
            </p>
            <code
              className="text-xs break-all"
              style={{ color: "#FFFFFF", wordBreak: "break-all", lineHeight: "1.6" }}
            >
              {resetToken}
            </code>
          </div>
        )}

        <Link
          href="/reset-password"
          className="block w-full text-center font-semibold text-sm"
          style={{
            height: "52px",
            borderRadius: "14px",
            background: "#12D6C5",
            color: "#FFFFFF",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 25px rgba(18,214,197,0.3)",
            textDecoration: "none",
          }}
        >
          Go to Reset Password
        </Link>

        <Link
          href="/login"
          className="block mt-4 text-sm font-semibold"
          style={{ color: "#AAB4C5", textDecoration: "none" }}
        >
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "480px",
        background: "#151E2D",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "28px",
        padding: "48px 40px",
        boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
      }}
    >
      <div className="flex flex-col items-center mb-8">
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "rgba(18,214,197,0.1)",
            border: "1.5px solid rgba(18,214,197,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <ShieldCheck style={{ width: "28px", height: "28px", color: "#12D6C5" }} />
        </div>

        <h1 className="text-white font-bold text-2xl mb-1">Reset Password</h1>
        <p className="text-sm text-center" style={{ color: "#AAB4C5" }}>
          Enter your email or phone to receive a reset token
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#FFFFFF" }}>
            Email Address or Phone
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: "16px", height: "16px", color: "#AAB4C5" }}
            />
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@kryros.com"
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#12D6C5";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(18,214,197,0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#2B3648";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>
        </div>

        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              color: "#EF4444",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 font-semibold text-sm"
          style={{
            height: "52px",
            borderRadius: "14px",
            background: isLoading ? "#2B3648" : "#12D6C5",
            color: isLoading ? "#6B7280" : "#FFFFFF",
            border: "none",
            cursor: isLoading ? "not-allowed" : "pointer",
            boxShadow: isLoading ? "none" : "0 10px 25px rgba(18,214,197,0.3)",
            transition: "all 0.15s ease",
          }}
        >
          {isLoading ? "Generating token..." : "Get Reset Token"}
        </button>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
            style={{ color: "#AAB4C5", textDecoration: "none" }}
          >
            <ArrowLeft style={{ width: "14px", height: "14px" }} />
            Back to login
          </Link>
        </div>
      </form>
    </div>
  );
}
