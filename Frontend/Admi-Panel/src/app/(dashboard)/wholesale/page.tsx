"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Building2,
  Mail,
  Phone,
  FileText,
  RefreshCw,
  Search
} from "lucide-react";

type WholesaleAccount = {
  id: string;
  userId: string;
  companyName: string;
  taxId: string;
  address: string;
  contactPerson: string;
  status: "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED";
  discountTier: number;
  notes: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export default function WholesalePage() {
  const [accounts, setAccounts] = useState<WholesaleAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/wholesale/accounts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load wholesale accounts");
      setAccounts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/wholesale/accounts/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      await load();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" /> Wholesale Management
          </h1>
          <p className="text-slate-500 text-sm">Review applications and manage wholesale partners</p>
        </div>
        <button 
          onClick={load} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search companies, emails, or contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Company Details</th>
                <th className="px-6 py-4">Contact Person</th>
                <th className="px-6 py-4">Tax ID / Address</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" /> {acc.companyName}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                        <Mail className="h-3.5 w-3.5 text-slate-400" /> {acc.user.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <p className="font-medium text-slate-900">{acc.contactPerson}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{acc.user.firstName} {acc.user.lastName}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 max-w-[200px]">
                    <p className="flex items-center gap-1.5 font-mono">
                      <FileText className="h-3.5 w-3.5 text-slate-400" /> {acc.taxId || "N/A"}
                    </p>
                    <p className="mt-1 line-clamp-2 italic">{acc.address || "No address provided"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                      acc.status === "APPROVED" ? "bg-green-100 text-green-700 border-green-200" :
                      acc.status === "REJECTED" ? "bg-red-100 text-red-700 border-red-200" :
                      acc.status === "PENDING" ? "bg-yellow-100 text-yellow-700 border-yellow-200" :
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      {acc.status === "APPROVED" && <CheckCircle className="h-3 w-3" />}
                      {acc.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                      {acc.status === "PENDING" && <Clock className="h-3 w-3" />}
                      {acc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {acc.status === "PENDING" && (
                        <>
                          <button 
                            onClick={() => updateStatus(acc.id, "APPROVED")}
                            disabled={updatingId === acc.id}
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 shadow-sm shadow-green-500/20"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => updateStatus(acc.id, "REJECTED")}
                            disabled={updatingId === acc.id}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 shadow-sm shadow-red-500/20"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {acc.status === "APPROVED" && (
                        <button 
                          onClick={() => updateStatus(acc.id, "SUSPENDED")}
                          disabled={updatingId === acc.id}
                          className="px-3 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                        >
                          Suspend
                        </button>
                      )}
                      {acc.status === "SUSPENDED" && (
                        <button 
                          onClick={() => updateStatus(acc.id, "APPROVED")}
                          disabled={updatingId === acc.id}
                          className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50 shadow-sm shadow-blue-500/20"
                        >
                          Re-activate
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-sm font-medium italic">Fetching partners...</p>
            </div>
          )}
          
          {!loading && !filteredAccounts.length && (
            <div className="p-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Building2 className="h-12 w-12 opacity-20" />
              <p className="text-sm font-medium italic">No wholesale partners found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
