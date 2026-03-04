"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";
import { User, LogOut, Package, CreditCard } from "lucide-react";

export function AuthButtons() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 animate-pulse rounded-full bg-slate-200"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="relative group">
        <button className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-green-600">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
            <User className="h-4 w-4" />
          </div>
          <span className="hidden md:inline">{user.firstName}</span>
        </button>
        
        {/* Dropdown Menu */}
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-slate-200 bg-white shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
          <div className="p-2">
            <p className="px-3 py-2 text-sm font-medium text-slate-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="px-3 py-1 text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="border-t border-slate-200 p-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <Package className="h-4 w-4" />
              My Orders
            </Link>
            <Link
              href="/dashboard/credits"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <CreditCard className="h-4 w-4" />
              My Credits
            </Link>
            <button
              onClick={logout}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className="text-sm font-medium text-slate-700 hover:text-green-600"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600"
      >
        Sign Up
      </Link>
    </div>
  );
}
