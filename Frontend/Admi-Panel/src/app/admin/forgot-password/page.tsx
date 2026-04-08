"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function AdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: email, isAdmin: true }),
      });
      
      // Even if the email doesn't exist, we show success for security
      setSubmitted(true);
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-green-100/50">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="font-heading text-3xl font-semibold text-slate-900">
          Check your email
        </h2>
        <p className="mt-4 text-slate-600 leading-relaxed">
          If an account with that email exists, we've sent a password reset link. 
          Please check your inbox and follow the instructions.
        </p>
        <div className="mt-8">
          <Link 
            href="/admin/login" 
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8">
        <Link 
          href="/admin/login" 
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-green-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
        <h2 className="font-heading text-3xl font-semibold text-slate-900">
          Forgot password?
        </h2>
        <p className="mt-2 text-slate-600">
          Enter your email and we'll send you a link to reset your password. 
          Only Super Admin accounts are authorized for reset.
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

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {isLoading ? "Sending link..." : "Send reset link"}
        </button>
      </form>
    </div>
  );
}
