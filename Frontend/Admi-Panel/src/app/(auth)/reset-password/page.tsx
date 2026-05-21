"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle2, KeyRound } from "lucide-react";

export default function AdminResetPasswordPage() {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Failed to reset password.");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred. Please try again.");
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

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#12D6C5";
    e.currentTarget.style.boxShadow = "0 0 0 4px rgba(18,214,197,0.15)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = "#2B3648";
    e.currentTarget.style.boxShadow = "none";
  };

  if (success) {
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
        <h2 className="text-white font-bold text-2xl mb-3">Password Updated</h2>
        <p className="text-sm mb-8" style={{ color: "#AAB4C5", lineHeight: "1.6" }}>
          Your password has been reset and all active sessions have been revoked. Please sign in
          with your new password.
        </p>
        <Link
          href="/login"
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
          Sign In
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
          <KeyRound style={{ width: "28px", height: "28px", color: "#12D6C5" }} />
        </div>
        <h1 className="text-white font-bold text-2xl mb-1">New Password</h1>
        <p className="text-sm text-center" style={{ color: "#AAB4C5" }}>
          Paste your reset token and choose a new password
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#FFFFFF" }}>
            Reset Token
          </label>
          <div className="relative">
            <KeyRound
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: "16px", height: "16px", color: "#AAB4C5" }}
            />
            <input
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value.trim())}
              placeholder="Paste your reset token here"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#FFFFFF" }}>
            New Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: "16px", height: "16px", color: "#AAB4C5" }}
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              style={{ ...inputStyle, paddingRight: "44px" }}
              onFocus={onFocus}
              onBlur={onBlur}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
              style={{ color: "#AAB4C5" }}
            >
              {showPassword ? (
                <EyeOff style={{ width: "16px", height: "16px" }} />
              ) : (
                <Eye style={{ width: "16px", height: "16px" }} />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2" style={{ color: "#FFFFFF" }}>
            Confirm Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: "16px", height: "16px", color: "#AAB4C5" }}
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              style={inputStyle}
              onFocus={onFocus}
              onBlur={onBlur}
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
          {isLoading ? "Updating password..." : "Reset Password"}
        </button>

        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
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
