"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Login failed");
      }
      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '52px',
    background: '#111827',
    border: '1px solid #2B3648',
    borderRadius: '14px',
    color: '#FFFFFF',
    fontSize: '14px',
    padding: '0 16px 0 44px',
    outline: 'none',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  };

  const inputFocusStyle: React.CSSProperties = {
    borderColor: '#12D6C5',
    boxShadow: '0 0 0 4px rgba(18,214,197,0.15)',
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '480px',
        background: '#151E2D',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '28px',
        padding: '48px 40px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.45)',
      }}
    >
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(18,214,197,0.1)',
            border: '1.5px solid rgba(18,214,197,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <ShieldCheck style={{ width: '28px', height: '28px', color: '#12D6C5' }} />
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #12D6C5, #0e9e91)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="text-white font-black text-base">K</span>
          </div>
          <div>
            <span className="text-white font-black text-xl tracking-wide">KRYROS</span>
            <div
              className="text-[10px] font-bold tracking-[0.2em] uppercase"
              style={{ color: '#12D6C5', lineHeight: 1 }}
            >
              Admin Portal
            </div>
          </div>
        </div>

        <h1 className="text-white font-bold text-2xl mb-1">Welcome Back</h1>
        <p className="text-sm text-center" style={{ color: '#AAB4C5' }}>
          Sign in to access your admin dashboard
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {/* Email */}
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: '#FFFFFF' }}
          >
            Email Address
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: '16px', height: '16px', color: '#AAB4C5' }}
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              style={inputStyle}
              onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={e => { e.currentTarget.style.borderColor = '#2B3648'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            className="block text-sm font-semibold mb-2"
            style={{ color: '#FFFFFF' }}
          >
            Password
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ width: '16px', height: '16px', color: '#AAB4C5' }}
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ ...inputStyle, paddingRight: '44px' }}
              onFocus={e => Object.assign(e.currentTarget.style, inputFocusStyle)}
              onBlur={e => { e.currentTarget.style.borderColor = '#2B3648'; e.currentTarget.style.boxShadow = 'none'; }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#AAB4C5' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#12D6C5')}
              onMouseLeave={e => (e.currentTarget.style.color = '#AAB4C5')}
            >
              {showPassword
                ? <EyeOff style={{ width: '16px', height: '16px' }} />
                : <Eye style={{ width: '16px', height: '16px' }} />
              }
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: '#EF4444',
            }}
          >
            {error}
          </div>
        )}

        {/* Remember me + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '5px',
                border: `1.5px solid ${rememberMe ? '#12D6C5' : '#2B3648'}`,
                background: rememberMe ? '#12D6C5' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
            >
              {rememberMe && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="#0B1320" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-sm" style={{ color: '#AAB4C5' }}>Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold transition-colors"
            style={{ color: '#12D6C5' }}
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 font-semibold text-sm transition-all active:scale-[0.98]"
          style={{
            height: '52px',
            borderRadius: '14px',
            background: isLoading ? '#2B3648' : '#12D6C5',
            color: isLoading ? '#6B7280' : '#FFFFFF',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: isLoading ? 'none' : '0 10px 25px rgba(18,214,197,0.3)',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#10C4B5'; }}
          onMouseLeave={e => { if (!isLoading) e.currentTarget.style.background = '#12D6C5'; }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight style={{ width: '16px', height: '16px' }} />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
