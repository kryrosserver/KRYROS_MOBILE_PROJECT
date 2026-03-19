"use client";

import { useEffect, useState } from "react";
import { CreditCard, Users, TrendingUp, TrendingDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";

type CreditSummary = {
  credit: { activeAccounts: number; totalOutstanding: number; repaymentRate: number; defaultRate: number };
};

export default function CreditPage() {
  const [data, setData] = useState<CreditSummary | null>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [accountsLoading, setAccountsLoading] = useState(false);

  const loadSummary = async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/reports/summary?range=month", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (res.ok) setData(body);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async () => {
    setAccountsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-d68q.onrender.com/api'}/credit/all`, {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok) setAccounts(body.data || []);
    } finally {
      setAccountsLoading(false);
    }
  };

  function getAdminToken(): string {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/(?:^|; )admin_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  useEffect(() => { 
    loadSummary();
    loadAccounts();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-d68q.onrender.com/api'}/credit/accounts/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setAccounts(prev => prev.map(acc => acc.id === id ? { ...acc, status: newStatus } : acc));
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credit System</h1>
          <p className="text-slate-500">Overview of credit accounts and performance</p>
        </div>
        <button onClick={() => { loadSummary(); loadAccounts(); }} className="btn-secondary">Refresh</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* ... existing summary cards ... */}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">All Credit Applications</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Product</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Total Payable</th>
                <th className="px-6 py-4">Monthly</th>
                <th className="px-6 py-4">Next Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {accountsLoading ? (
                <tr><td colSpan={9} className="px-6 py-10 text-center text-slate-400">Loading accounts...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-10 text-center text-slate-400">No applications found</td></tr>
              ) : accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-900">{acc.user?.firstName} {acc.user?.lastName}</p>
                    <p className="text-[11px] text-slate-500">{acc.user?.email}</p>
                    <p className="text-[11px] text-slate-500">{acc.user?.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{acc.product?.name}</p>
                    <p className="text-[11px] text-slate-500">Price: {formatPrice(Number(acc.product?.price || 0))}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">{acc.creditPlan?.name}</p>
                    <p className="text-[11px] text-slate-500">{acc.creditPlan?.duration} months</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">{formatPrice(Number(acc.amount))}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{formatPrice(Number(acc.totalPayable))}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{formatPrice(Number(acc.monthlyPayment))}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(acc.nextPaymentDate).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      acc.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                      acc.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                      acc.status === 'DEFAULTED' ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {acc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <select
                      value={acc.status}
                      onChange={(e) => handleStatusUpdate(acc.id, e.target.value)}
                      className="text-xs border rounded p-1"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="DEFAULTED">Defaulted</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
