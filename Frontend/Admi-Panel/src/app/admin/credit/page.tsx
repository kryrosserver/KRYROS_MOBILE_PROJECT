"use client";

import { useEffect, useState } from "react";
import { CreditCard, Users, TrendingUp, TrendingDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type CreditSummary = {
  credit: { activeAccounts: number; totalOutstanding: number; repaymentRate: number; defaultRate: number };
};

export default function CreditPage() {
  const [data, setData] = useState<CreditSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/reports/summary?range=month", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (res.ok) setData(body);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credit System</h1>
          <p className="text-slate-500">Overview of credit accounts and performance</p>
        </div>
        <button onClick={load} className="btn-secondary">Refresh</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Active Credit Accounts</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data?.credit?.activeAccounts ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Total Outstanding</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{formatPrice(Number(data?.credit?.totalOutstanding || 0))}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Repayment Rate</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{(data?.credit?.repaymentRate ?? 0).toFixed(1)}%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
          <p className="mt-3 text-sm text-slate-500">Default Rate</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{(data?.credit?.defaultRate ?? 0).toFixed(1)}%</p>
        </div>
      </div>

      
    </div>
  );
}
