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
  Search,
  Star,
  Plus,
  Trash2,
  Image as ImageIcon,
  Edit,
  Save,
  Package
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
  const [activeTab, setActiveTab] = useState<"accounts" | "deals">("accounts");
  const [accounts, setAccounts] = useState<WholesaleAccount[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
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

  const loadSections = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/cms/sections", { cache: "no-store", credentials: "same-origin" });
      if (res.ok) {
        const data = await res.json();
        setSections(Array.isArray(data) ? data : data?.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "accounts") loadAccounts();
    else loadSections();
  }, [activeTab, loadAccounts, loadSections]);

  async function compressImage(file: File, maxWidth = 800, quality = 0.85): Promise<string> {
    const blobURL = URL.createObjectURL(file);
    const img = await new Image();
    const p = new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = blobURL;
    });
    const i = await p;
    const scale = Math.min(1, maxWidth / i.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(i.width * scale);
    canvas.height = Math.round(i.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(i, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(blobURL);
    return canvas.toDataURL("image/jpeg", quality);
  }

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
          onClick={activeTab === "accounts" ? loadAccounts : loadSections} 
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("accounts")}
            className={`flex items-center gap-2 py-4 border-b-2 font-semibold text-sm transition-all ${
              activeTab === "accounts" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="h-4 w-4" />
            Wholesale Accounts
            <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px]">
              {accounts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("deals")}
            className={`flex items-center gap-2 py-4 border-b-2 font-semibold text-sm transition-all ${
              activeTab === "deals" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Star className="h-4 w-4" />
            Featured Deals (CMS)
            <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px]">
              {sections.filter((s:any) => s.type === "wholesale_deals" && s.isActive).length}
            </span>
          </button>
        </nav>
      </div>

      {activeTab === "accounts" ? (
        <>
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
        </>
      ) : (
        <div className="admin-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Featured Wholesale Deals</h2>
            <button
              onClick={async () => {
                const sample = [
                  { title: "iPhone 13 (Bulk)", subtitle: "Min 10 units", price: 9999, minQty: 10 },
                  { title: "MacBook Air M2 (Bulk)", subtitle: "Min 5 units", price: 54999, minQty: 5 },
                ];
                const res = await fetch("/internal/admin/cms/sections", {
                  method: "POST",
                  credentials: "same-origin",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ type: "wholesale_deals", title: "Featured Wholesale Deals", isActive: true, order: 5, config: { items: sample } }),
                });
                if (res.ok) {
                  await loadSections();
                  alert("Wholesale deals section created/updated");
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium border border-slate-200 text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset to Defaults
            </button>
          </div>

          <div className="space-y-6">
            {sections.filter((s:any) => s.type === "wholesale_deals").map((s:any) => (
              <div key={s.id} className="space-y-6 p-6 border border-slate-200 rounded-xl bg-slate-50/30">
                <div className="flex items-center justify-between">
                  <div className="flex-1 max-w-md">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Section Title</label>
                    <input 
                      defaultValue={s.title || "Wholesale Deals"} 
                      className="admin-input font-bold" 
                      onBlur={async (e) => {
                        await fetch(`/internal/admin/cms/sections/${s.id}`, {
                          method: "PUT",
                          credentials: "same-origin",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ title: e.target.value }),
                        });
                        await loadSections();
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={s.isActive}
                        onChange={async (e) => {
                          await fetch(`/internal/admin/cms/sections/${s.id}`, {
                            method: "PUT",
                            credentials: "same-origin",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ isActive: e.target.checked }),
                          });
                          await loadSections();
                        }}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-semibold text-slate-700">Active on Site</span>
                    </label>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <input placeholder="Product Title" className="admin-input" id={`w-title-${s.id}`} />
                    <input placeholder="Subtitle (e.g. Min 10 units)" className="admin-input" id={`w-subtitle-${s.id}`} />
                    <input placeholder="Product Slug (URL)" className="admin-input" id={`w-slug-${s.id}`} />
                    <input type="number" placeholder="Min Qty" className="admin-input" id={`w-minqty-${s.id}`} />
                    <input type="number" placeholder="Wholesale Price" className="admin-input" id={`w-price-${s.id}`} />
                    <div className="flex gap-2">
                      <input type="file" accept="image/*" id={`w-image-${s.id}`} className="hidden" />
                      <label htmlFor={`w-image-${s.id}`} className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-blue-400 text-slate-400 hover:text-blue-500 text-xs font-bold transition-all bg-white">
                        <ImageIcon className="h-4 w-4" /> Upload Image
                      </label>
                      <button
                        onClick={async () => {
                          const title = (document.getElementById(`w-title-${s.id}`) as HTMLInputElement).value.trim();
                          const subtitle = (document.getElementById(`w-subtitle-${s.id}`) as HTMLInputElement).value.trim();
                          const slug = (document.getElementById(`w-slug-${s.id}`) as HTMLInputElement).value.trim();
                          const minQty = Number((document.getElementById(`w-minqty-${s.id}`) as HTMLInputElement).value);
                          const price = Number((document.getElementById(`w-price-${s.id}`) as HTMLInputElement).value);
                          const fileInput = document.getElementById(`w-image-${s.id}`) as HTMLInputElement;
                          if (!title || !price) return alert("Title and Price are required");
                          
                          let image = "";
                          if (fileInput.files?.[0]) image = await compressImage(fileInput.files[0], 800, 0.9);
                          
                          const items = Array.isArray(s.config?.items) ? [...s.config.items] : [];
                          items.push({ title, subtitle, minQty, price, slug, image });
                          
                          const res = await fetch(`/internal/admin/cms/sections/${s.id}`, {
                            method: "PUT",
                            credentials: "same-origin",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ config: { items } }),
                          });
                          if (res.ok) {
                            (document.getElementById(`w-title-${s.id}`) as HTMLInputElement).value = "";
                            (document.getElementById(`w-subtitle-${s.id}`) as HTMLInputElement).value = "";
                            (document.getElementById(`w-slug-${s.id}`) as HTMLInputElement).value = "";
                            (document.getElementById(`w-minqty-${s.id}`) as HTMLInputElement).value = "";
                            (document.getElementById(`w-price-${s.id}`) as HTMLInputElement).value = "";
                            fileInput.value = "";
                            await loadSections();
                          }
                        }}
                        className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3">Details</th>
                          <th className="px-4 py-3">Pricing</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {(Array.isArray(s.config?.items) ? s.config.items : []).map((it:any, idx:number) => (
                          <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                                  {it.image ? <img src={it.image} alt={it.title} className="h-full w-full object-cover" /> : <Package className="h-6 w-6 m-3 text-slate-300" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-slate-900 truncate">{it.title}</p>
                                  <p className="text-[10px] text-slate-400 font-mono truncate">{it.slug || "no-slug"}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-xs text-slate-600 font-medium">{it.subtitle || "—"}</p>
                              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">Min Qty: {it.minQty || 1}</p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-black text-blue-600">ZK {it.price?.toLocaleString()}</p>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={async () => {
                                  const items = [...s.config.items];
                                  items.splice(idx, 1);
                                  await fetch(`/internal/admin/cms/sections/${s.id}`, {
                                    method: "PUT",
                                    credentials: "same-origin",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ config: { items } }),
                                  });
                                  await loadSections();
                                }}
                                className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
