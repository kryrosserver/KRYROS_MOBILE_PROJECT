"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  CreditCard, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MoreHorizontal,
  TrendingUp,
  Users,
  Ban,
  Plus,
  Settings,
  X,
  Package,
  PlusCircle,
  Trash2,
  Edit,
  Save,
  Image as ImageIcon
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Mock data for requests
const creditRequests = [
  { id: "CR-1024", user: "John Doe", email: "john@example.com", amount: 1200, item: "iPhone 15 Pro", status: "pending", date: "2024-03-20", score: 720 },
  { id: "CR-1025", user: "Sarah Smith", email: "sarah@example.com", amount: 850, item: "MacBook Air", status: "approved", date: "2024-03-19", score: 680 },
  { id: "CR-1026", user: "Mike Johnson", email: "mike@example.com", amount: 2100, item: "Gaming PC", status: "rejected", date: "2024-03-18", score: 450 },
  { id: "CR-1027", user: "Elena Rodriguez", email: "elena@example.com", amount: 1500, item: "Camera Kit", status: "reviewing", date: "2024-03-17", score: 610 },
  { id: "CR-1028", user: "David Chen", email: "david@example.com", amount: 500, item: "Samsung Tablet", status: "blacklisted", date: "2024-03-16", score: 300 },
];

export default function CreditPage() {
  const [activeTab, setActiveTab] = useState<"requests" | "plans" | "products">("requests");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  
  // Summary Data State
  const [summaryData, setSummaryData] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  
  // Plans State
  const [plans, setPlans] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm, setPlanModalForm] = useState({
    name: "",
    duration: 6,
    interestRate: 10,
    minimumAmount: 500,
    maximumAmount: 10000,
    targetBrandId: "",
    targetCategoryId: "",
    isActive: true
  });

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    description: "",
    categorySlug: "",
    brandId: "" as string | number,
    allowCredit: true,
    creditMinimum: "",
    creditMessage: "",
    isActive: true,
    hasFiveYearGuarantee: true,
    fiveYearGuaranteeText: "5 Year Guarantee",
    hasFreeReturns: true,
    freeReturnsText: "Free Returns",
    hasInstallmentOptions: true,
    installmentOptionsText: "Installment Options",
    images: [] as string[],
  });

  const [editItem, setEditItem] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    sku: "",
    price: "",
    description: "",
    categorySlug: "",
    brandId: "" as string | number,
    allowCredit: true,
    creditMinimum: "",
    creditMessage: "",
    isActive: true,
    hasFiveYearGuarantee: true,
    fiveYearGuaranteeText: "",
    hasFreeReturns: true,
    freeReturnsText: "",
    hasInstallmentOptions: true,
    installmentOptionsText: "",
    images: [] as string[],
  });
  const [editFiles, setEditFiles] = useState<File[]>([]);

  function getAdminToken(): string {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/(?:^|; )admin_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  const loadData = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://kryrosbackend-hxfp.onrender.com/api';
      const token = getAdminToken();
      const headers = { 'Authorization': `Bearer ${token}` };

      const [summaryRes, accountsRes, plansRes, catsRes, brandsRes, productsRes] = await Promise.all([
        fetch("/internal/admin/reports/summary?range=month", { cache: "no-store" }).then(r => r.json()),
        fetch(`${apiUrl}/credit/all`, { headers }).then(r => r.json()),
        fetch(`${apiUrl}/credit/plans`).then(r => r.json()),
        fetch(`${apiUrl}/categories`).then(r => r.json()),
        fetch(`${apiUrl}/brands`).then(r => r.json()),
        fetch(`${apiUrl}/admin/products?showInactive=true`).then(r => r.json())
      ]);

      setSummaryData(summaryRes);
      setAccounts(accountsRes.data || []);
      setPlans(plansRes || []);
      setCategories(catsRes.data || []);
      setBrands(brandsRes.data || []);
      
      const allProds = Array.isArray(productsRes?.products) ? productsRes.products : productsRes?.data || [];
      setProducts(allProds.filter((p: any) => !!p.allowCredit));
    } catch (e) {
      console.error("Failed to load credit data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  async function compressImage(file: File, maxWidth = 800, quality = 0.85): Promise<string> {
    const blobURL = URL.createObjectURL(file);
    const img = new Image();
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

  const handleSavePlan = async () => {
    try {
      const url = editingPlan 
        ? `${process.env.NEXT_PUBLIC_API_URL}/credit/plans/${editingPlan.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/credit/plans`;
      
      const res = await fetch(url, {
        method: editingPlan ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          ...planForm,
          targetBrandId: planForm.targetBrandId ? Number(planForm.targetBrandId) : null,
          targetCategoryId: planForm.targetCategoryId || null
        })
      });

      if (res.ok) {
        setIsPlanModalOpen(false);
        setEditingPlan(null);
        loadData();
      }
    } catch (e) {
      alert("Failed to save plan");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/credit/accounts/${id}/status`, {
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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return <Clock className="h-4 w-4 text-yellow-500" />;
      case "approved": case "active": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected": case "cancelled": return <XCircle className="h-4 w-4 text-red-500" />;
      case "reviewing": return <Eye className="h-4 w-4 text-blue-500" />;
      case "blacklisted": case "defaulted": return <Ban className="h-4 w-4 text-red-700" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Credit Management</h1>
          <p className="text-slate-500">Manage applications and rules for installments</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "requests" ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            Applications
          </button>
          <button 
            onClick={() => setActiveTab("plans")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "plans" ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            Manage Plans
          </button>
          <button 
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "products" ? "bg-green-500 text-white shadow-lg shadow-green-500/20" : "bg-white text-slate-600 border border-slate-200"}`}
          >
            Installment Products
          </button>
        </div>
      </div>

      {activeTab === "requests" ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="admin-card p-5 border-l-4 border-l-blue-500">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Active Accounts</p>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900">{summaryData?.credit?.activeAccounts || 0}</h3>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="admin-card p-5 border-l-4 border-l-green-500">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900">{formatPrice(summaryData?.credit?.totalOutstanding || 0)}</h3>
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="admin-card p-5 border-l-4 border-l-indigo-500">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Repayment Rate</p>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900">{summaryData?.credit?.repaymentRate || 0}%</h3>
                <TrendingUp className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="admin-card p-5 border-l-4 border-l-red-500">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Default Rate</p>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-black text-slate-900">{summaryData?.credit?.defaultRate || 0}%</h3>
                <TrendingUp className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">All Credit Applications</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search user or email..."
                  className="pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Plan</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accounts.length === 0 ? (
                    <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic">No credit accounts found</td></tr>
                  ) : accounts.map((acc) => (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{acc.user?.firstName} {acc.user?.lastName}</p>
                        <p className="text-[11px] text-slate-500">{acc.user?.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{acc.product?.name}</p>
                        <p className="text-[11px] text-slate-500">Price: {formatPrice(acc.product?.price || 0)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">{acc.creditPlan?.name}</p>
                        <p className="text-[11px] text-slate-500">{acc.creditPlan?.duration} months</p>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">{formatPrice(acc.amount)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(acc.status)}
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            acc.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            acc.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                            acc.status === 'DEFAULTED' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {acc.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={acc.status}
                          onChange={(e) => handleStatusUpdate(acc.id, e.target.value)}
                          className="text-xs border rounded p-1 bg-white"
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
        </>
      ) : activeTab === "products" ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Installment Product Inventory</h2>
            <button 
              onClick={() => setShowCreate(!showCreate)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> {showCreate ? 'Close Form' : 'Add Credit Product'}
            </button>
          </div>

          {showCreate && (
            <div className="admin-card p-6 border-2 border-green-100 bg-green-50/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Product Name</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="admin-input w-full font-bold" placeholder="e.g. iPhone 15 Pro (Credit)" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">SKU</label>
                      <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="admin-input w-full" placeholder="CR-IP15" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Cash Price (USD)</label>
                      <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="admin-input w-full" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Credit Minimum Deposit</label>
                      <input type="number" value={form.creditMinimum} onChange={e => setForm({...form, creditMinimum: e.target.value})} className="admin-input w-full" placeholder="e.g. 200" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Category</label>
                      <select value={form.categorySlug} onChange={e => setForm({...form, categorySlug: e.target.value})} className="admin-input w-full">
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Credit Policy/Message</label>
                    <textarea value={form.creditMessage} onChange={e => setForm({...form, creditMessage: e.target.value})} className="admin-input w-full h-24" placeholder="e.g. Pay 20% deposit and split the rest over 6 months..." />
                  </div>
                  
                  {/* Guarantee & Details Section */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guarantee & Details</p>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.hasFiveYearGuarantee}
                            onChange={(e) => setForm({ ...form, hasFiveYearGuarantee: e.target.checked })}
                            className="w-4 h-4 text-green-500 rounded"
                          />
                          Show Guarantee
                        </label>
                        <input
                          placeholder="Guarantee Text (e.g. 5 YEARS GUARANTEE)"
                          value={form.fiveYearGuaranteeText}
                          onChange={(e) => setForm({ ...form, fiveYearGuaranteeText: e.target.value })}
                          className="admin-input text-xs min-h-[32px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.hasFreeReturns}
                            onChange={(e) => setForm({ ...form, hasFreeReturns: e.target.checked })}
                            className="w-4 h-4 text-green-500 rounded"
                          />
                          Show Free Returns
                        </label>
                        <input
                          placeholder="Returns Text (e.g. FREE RETURNS)"
                          value={form.freeReturnsText}
                          onChange={(e) => setForm({ ...form, freeReturnsText: e.target.value })}
                          className="admin-input text-xs min-h-[32px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.hasInstallmentOptions}
                            onChange={(e) => setForm({ ...form, hasInstallmentOptions: e.target.checked })}
                            className="w-4 h-4 text-green-500 rounded"
                          />
                          Show Installment Options
                        </label>
                        <input
                          placeholder="Installment Text (e.g. INSTALLMENT OPTIONS)"
                          value={form.installmentOptionsText}
                          onChange={(e) => setForm({ ...form, installmentOptionsText: e.target.value })}
                          className="admin-input text-xs min-h-[32px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Product Images</label>
                    <input type="file" multiple accept="image/*" onChange={async e => {
                      const filesList = Array.from(e.target.files || []);
                      const previews = await Promise.all(filesList.map(f => compressImage(f, 1200, 0.85)));
                      setForm({...form, images: [...form.images, ...previews]});
                      setFiles(prev => [...prev, ...filesList]);
                    }} className="text-xs mb-3" />
                    <div className="grid grid-cols-4 gap-2">
                      {form.images.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded-lg border overflow-hidden bg-white shadow-sm">
                          <img src={src} className="w-full h-full object-cover" />
                          <button onClick={() => {
                            setForm({...form, images: form.images.filter((_, idx) => idx !== i)});
                            setFiles(prev => prev.filter((_, idx) => idx !== i));
                          }} className="absolute top-0 right-0 bg-red-500 text-white p-0.5"><X className="h-3 w-3" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button 
                    disabled={creating}
                    onClick={async () => {
                      if (!form.name || !form.sku || !form.price) return alert("Fill required fields");
                      setCreating(true);
                      try {
                        const fd = new FormData();
                        fd.append("name", form.name);
                        fd.append("sku", form.sku);
                        fd.append("price", form.price);
                        fd.append("allowCredit", "true");
                        fd.append("isWholesaleOnly", "false");
                        fd.append("creditMinimum", form.creditMinimum);
                        fd.append("creditMessage", form.creditMessage);
                        fd.append("categorySlug", form.categorySlug || "general");
                        fd.append("description", form.description || form.name);
                        fd.append("isActive", String(form.isActive));
                        
                        fd.append("hasFiveYearGuarantee", String(form.hasFiveYearGuarantee));
                        if (form.fiveYearGuaranteeText) fd.append("fiveYearGuaranteeText", form.fiveYearGuaranteeText);
                        fd.append("hasFreeReturns", String(form.hasFreeReturns));
                        if (form.freeReturnsText) fd.append("freeReturnsText", form.freeReturnsText);
                        fd.append("hasInstallmentOptions", String(form.hasInstallmentOptions));
                        if (form.installmentOptionsText) fd.append("installmentOptionsText", form.installmentOptionsText);
                        
                        files.forEach(f => fd.append("images", f));
                        
                        const res = await fetch("/api/admin/products/upload", { method: "POST", body: fd });
                        if (!res.ok) throw new Error("Failed to upload");
                        
                        setShowCreate(false);
                        setForm({
                          name: "", sku: "", price: "", description: "", categorySlug: "", brandId: "",
                          allowCredit: true, creditMinimum: "", creditMessage: "", isActive: true,
                          hasFiveYearGuarantee: true, fiveYearGuaranteeText: "5 Year Guarantee",
                          hasFreeReturns: true, freeReturnsText: "Free Returns",
                          hasInstallmentOptions: true, installmentOptionsText: "Installment Options",
                          images: []
                        });
                        setFiles([]);
                        loadData();
                      } catch (e: any) { alert(e.message); }
                      finally { setCreating(false); }
                    }}
                    className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all active:scale-95"
                  >
                    {creating ? "Processing..." : "Create Installment Product"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Cash Price</th>
                  <th className="px-6 py-4">Min Deposit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded bg-slate-100 border overflow-hidden flex-shrink-0">
                          {p.images?.[0] ? <img src={p.images[0].url} className="w-full h-full object-cover" /> : <Package className="h-6 w-6 m-3 text-slate-300" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-[10px] font-mono text-slate-400 uppercase tracking-tight">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-slate-700">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4 font-black text-green-600">{p.creditMinimum ? formatPrice(Number(p.creditMinimum)) : "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                        {p.isActive ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setEditItem(p);
                            setEditForm({
                              id: p.id,
                              name: p.name,
                              sku: p.sku,
                              price: String(p.price || ""),
                              description: p.description || "",
                              categorySlug: p.category?.slug || "",
                              brandId: p.brand?.id || "",
                              allowCredit: true,
                              creditMinimum: String(p.creditMinimum || ""),
                              creditMessage: p.creditMessage || "",
                              isActive: p.isActive !== false,
                              hasFiveYearGuarantee: !!p.hasFiveYearGuarantee,
                              fiveYearGuaranteeText: p.fiveYearGuaranteeText || "",
                              hasFreeReturns: !!p.hasFreeReturns,
                              freeReturnsText: p.freeReturnsText || "",
                              hasInstallmentOptions: !!p.hasInstallmentOptions,
                              installmentOptionsText: p.installmentOptionsText || "",
                              images: p.images?.map((img: any) => img.url) || [],
                            });
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={async () => {
                          if (!confirm("Delete this credit product?")) return;
                          await fetch(`/api/admin/products/${p.id}`, { method: "DELETE" });
                          loadData();
                        }} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">Available Installment Plans</h2>
            <button 
              onClick={() => {
                setEditingPlan(null);
                setPlanModalForm({ name: "", duration: 6, interestRate: 10, minimumAmount: 500, maximumAmount: 10000, targetBrandId: "", targetCategoryId: "", isActive: true });
                setIsPlanModalOpen(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create New Plan
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <div key={plan.id} className="admin-card p-6 border-t-4 border-t-green-500 relative group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{plan.name}</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{plan.duration} Months</p>
                  </div>
                  <div className={`px-2 py-1 rounded text-[10px] font-bold ${plan.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {plan.isActive ? 'ACTIVE' : 'DISABLED'}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Interest Rate</span>
                    <span className="font-bold text-green-600">{plan.interestRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Price Range</span>
                    <span className="font-medium text-slate-700">{formatPrice(plan.minimumAmount)} - {formatPrice(plan.maximumAmount)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Applicable To</p>
                    <div className="flex flex-wrap gap-1">
                      {!plan.targetBrandId && !plan.targetCategoryId && (
                        <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-bold">ALL PRODUCTS</span>
                      )}
                      {plan.brand && (
                        <span className="bg-orange-50 text-orange-600 text-[10px] px-2 py-0.5 rounded-full font-bold">BRAND: {plan.brand.name}</span>
                      )}
                      {plan.category && (
                        <span className="bg-purple-50 text-purple-600 text-[10px] px-2 py-0.5 rounded-full font-bold">CAT: {plan.category.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingPlan(plan);
                      setPlanModalForm({
                        name: plan.name,
                        duration: plan.duration,
                        interestRate: Number(plan.interestRate),
                        minimumAmount: Number(plan.minimumAmount),
                        maximumAmount: Number(plan.maximumAmount),
                        targetBrandId: plan.targetBrandId || "",
                        targetCategoryId: plan.targetCategoryId || "",
                        isActive: plan.isActive
                      });
                      setIsPlanModalOpen(true);
                    }}
                    className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Edit Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plan Modal */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingPlan ? 'Edit Credit Plan' : 'Create New Credit Plan'}</h3>
              <button onClick={() => setIsPlanModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Plan Name</label>
                <input 
                  placeholder="e.g. Standard 6-Month Plan"
                  className="admin-input w-full"
                  value={planForm.name}
                  onChange={e => setPlanModalForm({...planForm, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Duration (Months)</label>
                  <input 
                    type="number"
                    className="admin-input w-full"
                    value={planForm.duration}
                    onChange={e => setPlanModalForm({...planForm, duration: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Interest Rate (%)</label>
                  <input 
                    type="number"
                    className="admin-input w-full"
                    value={planForm.interestRate}
                    onChange={e => setPlanModalForm({...planForm, interestRate: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Min Price (USD)</label>
                  <input 
                    type="number"
                    className="admin-input w-full"
                    value={planForm.minimumAmount}
                    onChange={e => setPlanModalForm({...planForm, minimumAmount: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Max Price (USD)</label>
                  <input 
                    type="number"
                    className="admin-input w-full"
                    value={planForm.maximumAmount}
                    onChange={e => setPlanModalForm({...planForm, maximumAmount: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-xl space-y-4 border border-blue-100">
                <p className="text-xs font-bold text-blue-800 uppercase tracking-widest">Eligibility Rules</p>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Limit to Brand</label>
                  <select 
                    className="admin-input w-full bg-white"
                    value={planForm.targetBrandId}
                    onChange={e => setPlanModalForm({...planForm, targetBrandId: e.target.value})}
                  >
                    <option value="">Apply to All Brands</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Limit to Category</label>
                  <select 
                    className="admin-input w-full bg-white"
                    value={planForm.targetCategoryId}
                    onChange={e => setPlanModalForm({...planForm, targetCategoryId: e.target.value})}
                  >
                    <option value="">Apply to All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-green-500 rounded focus:ring-green-500"
                  checked={planForm.isActive}
                  onChange={e => setPlanModalForm({...planForm, isActive: e.target.checked})}
                />
                <span className="text-sm font-bold text-slate-700">Plan is Active and Visible to Users</span>
              </label>
            </div>

            <div className="p-6 border-t bg-slate-50 flex gap-3">
              <button 
                onClick={() => setIsPlanModalOpen(false)}
                className="flex-1 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSavePlan}
                className="flex-[2] bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all active:scale-95"
              >
                {editingPlan ? 'Update Plan Settings' : 'Create Credit Plan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">Edit Installment Product</h3>
              <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Product Name</label>
                  <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="admin-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">SKU</label>
                    <input value={editForm.sku} onChange={e => setEditForm({...editForm, sku: e.target.value})} className="admin-input" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Price (USD)</label>
                    <input type="number" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} className="admin-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Min Deposit</label>
                    <input type="number" value={editForm.creditMinimum} onChange={e => setEditForm({...editForm, creditMinimum: e.target.value})} className="admin-input" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                    <select value={editForm.categorySlug} onChange={e => setEditForm({...editForm, categorySlug: e.target.value})} className="admin-input">
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Policy Message</label>
                  <textarea value={editForm.creditMessage} onChange={e => setEditForm({...editForm, creditMessage: e.target.value})} className="admin-input h-32" />
                </div>
                
                {/* Guarantee & Details Section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guarantee & Details</p>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.hasFiveYearGuarantee}
                          onChange={(e) => setEditForm({ ...editForm, hasFiveYearGuarantee: e.target.checked })}
                          className="w-4 h-4 text-green-500 rounded"
                        />
                        Show Guarantee
                      </label>
                      <input
                        placeholder="Guarantee Text (e.g. 5 YEARS GUARANTEE)"
                        value={editForm.fiveYearGuaranteeText}
                        onChange={(e) => setEditForm({ ...editForm, fiveYearGuaranteeText: e.target.value })}
                        className="admin-input text-xs bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.hasFreeReturns}
                          onChange={(e) => setEditForm({ ...editForm, hasFreeReturns: e.target.checked })}
                          className="w-4 h-4 text-green-500 rounded"
                        />
                        Show Free Returns
                      </label>
                      <input
                        placeholder="Returns Text (e.g. FREE RETURNS)"
                        value={editForm.freeReturnsText}
                        onChange={(e) => setEditForm({ ...editForm, freeReturnsText: e.target.value })}
                        className="admin-input text-xs bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.hasInstallmentOptions}
                          onChange={(e) => setEditForm({ ...editForm, hasInstallmentOptions: e.target.checked })}
                          className="w-4 h-4 text-green-500 rounded"
                        />
                        Show Installment Options
                      </label>
                      <input
                        placeholder="Installment Text (e.g. INSTALLMENT OPTIONS)"
                        value={editForm.installmentOptionsText}
                        onChange={(e) => setEditForm({ ...editForm, installmentOptionsText: e.target.value })}
                        className="admin-input text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Images</label>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {editForm.images.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg border overflow-hidden bg-white shadow-sm group">
                        <img src={src} className="w-full h-full object-cover" />
                        <button onClick={() => setEditForm({...editForm, images: editForm.images.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                      <PlusCircle className="h-6 w-6 text-slate-300" />
                      <input type="file" multiple accept="image/*" className="hidden" onChange={async e => {
                        const filesList = Array.from(e.target.files || []);
                        const previews = await Promise.all(filesList.map(f => compressImage(f, 1200, 0.85)));
                        setEditForm({...editForm, images: [...editForm.images, ...previews]});
                        setEditFiles(prev => [...prev, ...filesList]);
                      }} />
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t flex gap-3">
                  <button onClick={() => setEditItem(null)} className="flex-1 px-6 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-all uppercase tracking-widest text-xs">Cancel</button>
                  <button 
                    disabled={creating}
                    onClick={async () => {
                      setCreating(true);
                      try {
                        const fd = new FormData();
                        fd.append("name", editForm.name);
                        fd.append("sku", editForm.sku);
                        fd.append("price", editForm.price);
                        fd.append("allowCredit", "true");
                        fd.append("isWholesaleOnly", "false");
                        fd.append("creditMinimum", editForm.creditMinimum);
                        fd.append("creditMessage", editForm.creditMessage);
                        fd.append("categorySlug", editForm.categorySlug);
                        fd.append("description", editForm.description || editForm.name);
                        
                        fd.append("hasFiveYearGuarantee", String(editForm.hasFiveYearGuarantee));
                        if (editForm.fiveYearGuaranteeText) fd.append("fiveYearGuaranteeText", editForm.fiveYearGuaranteeText);
                        fd.append("hasFreeReturns", String(editForm.hasFreeReturns));
                        if (editForm.freeReturnsText) fd.append("freeReturnsText", editForm.freeReturnsText);
                        fd.append("hasInstallmentOptions", String(editForm.hasInstallmentOptions));
                        if (editForm.installmentOptionsText) fd.append("installmentOptionsText", editForm.installmentOptionsText);
                        
                        editFiles.forEach(f => fd.append("images", f));
                        
                        const res = await fetch(`/api/admin/products/${editItem.id}`, { method: "PUT", body: fd });
                        if (!res.ok) throw new Error("Update failed");
                        
                        setEditItem(null);
                        loadData();
                      } catch (e: any) { alert(e.message); }
                      finally { setCreating(false); }
                    }}
                    className="flex-[2] px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 uppercase tracking-widest text-xs"
                  >
                    {creating ? "Saving..." : "Update Credit Product"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
