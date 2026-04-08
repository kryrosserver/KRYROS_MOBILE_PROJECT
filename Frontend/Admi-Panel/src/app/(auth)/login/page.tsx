"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-10 h-full">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-green-500/20 blur-2xl" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center">
                <span className="font-bold">K</span>
              </div>
              <h1 className="font-heading text-2xl font-semibold">KRYROS Admin</h1>
            </div>

            <p className="mt-6 text-slate-200 leading-relaxed">
              Manage products, orders, users, credit, and system settings with a clean,
              professional interface optimized for productivity.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-slate-300">Quick Insights</p>
                <p className="mt-1 text-2xl font-semibold">Live Dashboard</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-slate-300">Secure Access</p>
                <p className="mt-1 text-2xl font-semibold">Role-Based</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-slate-300">Credit System</p>
                <p className="mt-1 text-2xl font-semibold">Integrated</p>
              </div>
              <div className="rounded-xl bg-white/5 p-4">
                <p className="text-sm text-slate-300">Orders</p>
                <p className="mt-1 text-2xl font-semibold">End-to-End</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mx-auto max-w-md">
          <div className="mb-8">
            <h2 className="font-heading text-3xl font-semibold text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2 text-slate-600">
              Sign in to your admin account to continue.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@kryros.com"
                  className="admin-input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="admin-input pl-10"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" className="rounded border-slate-300" />
                Remember me
              </label>
              <Link href="/admin/forgot-password" data-testid="forgot-password-link" className="text-sm font-medium text-green-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Not an admin?{" "}
            <Link href="/" className="font-medium text-green-600 hover:underline">
              Go to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
