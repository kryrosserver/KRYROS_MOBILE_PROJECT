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
  Package,
  PlusCircle,
  X
} from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  discountPercentage?: number | null;
  stockTotal?: number;
  stockCurrent?: number;
  hasFiveYearGuarantee?: boolean;
  fiveYearGuaranteeText?: string | null;
  hasFreeReturns?: boolean;
  freeReturnsText?: string | null;
  hasInstallmentOptions?: boolean;
  installmentOptionsText?: string | null;
  wholesalePrice?: number | null;
  isWholesaleOnly?: boolean;
  unitsPerPack?: number;
  wholesaleMoq?: number;
  category?: { id: string; name: string; slug: string };
  brand?: { id: number; name: string; slug: string };
  images?: any[];
  wholesaleTiers?: any[];
};

type Category = { id: string; name: string; slug: string };
type Brand = { id: number; name: string; slug: string };

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
  const [activeTab, setActiveTab] = useState<"accounts" | "deals" | "products">("accounts");
  const [accounts, setAccounts] = useState<WholesaleAccount[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Product Form State
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
    stockTotal: "100",
    stockCurrent: "100",
    wholesalePrice: "",
    unitsPerPack: "1",
    wholesaleMoq: "1",
    isActive: true,
    hasFiveYearGuarantee: true,
    fiveYearGuaranteeText: "5 Year Guarantee",
    hasFreeReturns: true,
    freeReturnsText: "Free Returns",
    hasInstallmentOptions: true,
    installmentOptionsText: "Installment Options",
    images: [] as string[],
    wholesaleTiers: [] as { minQuantity: number; price: number }[],
  });

  const [editItem, setEditItem] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    sku: "",
    price: "",
    description: "",
    categorySlug: "",
    brandId: "" as string | number,
    stockTotal: "",
    stockCurrent: "",
    wholesalePrice: "",
    unitsPerPack: "1",
    wholesaleMoq: "1",
    isActive: true,
    hasFiveYearGuarantee: true,
    fiveYearGuaranteeText: "",
    hasFreeReturns: true,
    freeReturnsText: "",
    hasInstallmentOptions: true,
    installmentOptionsText: "",
    images: [] as string[],
    wholesaleTiers: [] as { minQuantity: number; price: number }[],
  });
  const [editFiles, setEditFiles] = useState<File[]>([]);

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

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, brandRes] = await Promise.all([
        fetch("/api/admin/products?showInactive=true"),
        fetch("/api/admin/categories"),
        fetch("/api/admin/brands")
      ]);
      
      if (prodRes.ok) {
        const data = await prodRes.json();
        const items = Array.isArray(data?.products) ? data.products : data?.data || [];
        setProducts(items.filter((p: any) => !!p.isWholesaleOnly));
      }
      if (catRes.ok) setCategories(await catRes.json());
      if (brandRes.ok) setBrands(await brandRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "accounts") loadAccounts();
    else if (activeTab === "deals") loadSections();
    else if (activeTab === "products") loadProducts();
  }, [activeTab, loadAccounts, loadSections, loadProducts]);

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

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/wholesale/accounts/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status"); 
      await loadAccounts(); 
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
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 py-4 border-b-2 font-semibold text-sm transition-all ${
              activeTab === "products" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Package className="h-4 w-4" />
            Wholesale Inventory
            <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px]">
              {products.length}
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
      ) : activeTab === "products" ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Wholesale Product Inventory</h2>
            <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" /> {showCreate ? "Close Form" : "Add Wholesale Product"}
            </button>
          </div>

          {showCreate && (
            <div className="admin-card p-6 border-2 border-blue-100 bg-blue-50/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name</label>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="admin-input" placeholder="e.g. iPhone 15 Pro Max (Wholesale)" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">SKU</label>
                    <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})} className="admin-input" placeholder="WH-IP15-PRO" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Base Price (Per Pack)</label>
                      <input type="number" value={form.wholesalePrice} onChange={e => setForm({...form, wholesalePrice: e.target.value})} className="admin-input" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Retail Ref (Optional)</label>
                      <input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="admin-input" placeholder="0.00" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Units Per Pack</label>
                      <input type="number" value={form.unitsPerPack} onChange={e => setForm({...form, unitsPerPack: e.target.value})} className="admin-input" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">MOQ (Packs)</label>
                      <input type="number" value={form.wholesaleMoq} onChange={e => setForm({...form, wholesaleMoq: e.target.value})} className="admin-input" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                    <select value={form.categorySlug} onChange={e => setForm({...form, categorySlug: e.target.value})} className="admin-input">
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                    <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="admin-input h-24" placeholder="Wholesale product description..." />
                  </div>
                  
                  {/* Guarantee & Details Section */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                    <p className="text-xs font-bold text-slate-500 uppercase">Guarantee & Details</p>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.hasFiveYearGuarantee}
                            onChange={(e) => setForm({ ...form, hasFiveYearGuarantee: e.target.checked })}
                            className="w-3.5 h-3.5 text-blue-500 rounded"
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
                        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.hasFreeReturns}
                            onChange={(e) => setForm({ ...form, hasFreeReturns: e.target.checked })}
                            className="w-3.5 h-3.5 text-blue-500 rounded"
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
                        <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={form.hasInstallmentOptions}
                            onChange={(e) => setForm({ ...form, hasInstallmentOptions: e.target.checked })}
                            className="w-3.5 h-3.5 text-blue-500 rounded"
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

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bulk Pricing Tiers</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-lg bg-white">
                      {form.wholesaleTiers.map((t, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input type="number" value={t.minQuantity} onChange={e => {
                            const nt = [...form.wholesaleTiers];
                            nt[i].minQuantity = Number(e.target.value);
                            setForm({...form, wholesaleTiers: nt});
                          }} className="admin-input h-8 text-xs flex-1" placeholder="Min Qty" />
                          <input type="number" value={t.price} onChange={e => {
                            const nt = [...form.wholesaleTiers];
                            nt[i].price = Number(e.target.value);
                            setForm({...form, wholesaleTiers: nt});
                          }} className="admin-input h-8 text-xs flex-1" placeholder="Price" />
                          <button onClick={() => setForm({...form, wholesaleTiers: form.wholesaleTiers.filter((_, idx) => idx !== i)})} className="text-red-500"><X className="h-4 w-4" /></button>
                        </div>
                      ))}
                      <button onClick={() => setForm({...form, wholesaleTiers: [...form.wholesaleTiers, {minQuantity: 0, price: 0}]})} className="text-[10px] font-bold text-blue-600 uppercase">+ Add Tier</button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Images</label>
                    <input type="file" multiple accept="image/*" onChange={async e => {
                      const files = Array.from(e.target.files || []);
                      const previews = await Promise.all(files.map(f => compressImage(f, 1200, 0.85)));
                      setForm({...form, images: [...form.images, ...previews]});
                      setFiles(prev => [...prev, ...files]);
                    }} className="text-xs" />
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {form.images.map((src, i) => (
                        <div key={i} className="relative aspect-square rounded border overflow-hidden">
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
                      if (!form.name || !form.sku || !form.wholesalePrice) return alert("Fill required fields");
                      setCreating(true);
                      try {
                        const fd = new FormData();
                        fd.append("name", form.name);
                        fd.append("sku", form.sku);
                        fd.append("wholesalePrice", form.wholesalePrice);
                        fd.append("price", form.price || form.wholesalePrice);
                        
                        // STRICT WHOLESALE FLAGS - Dedicated Page Upload
                        fd.append("isWholesaleOnly", "true");
                        fd.append("allowCredit", "false");
                        
                        fd.append("unitsPerPack", form.unitsPerPack);
                        fd.append("wholesaleMoq", form.wholesaleMoq);
                        fd.append("categorySlug", form.categorySlug || "general");
                        fd.append("description", form.description);
                        fd.append("isActive", String(form.isActive));
                        
                        fd.append("hasFiveYearGuarantee", String(form.hasFiveYearGuarantee));
                        if (form.fiveYearGuaranteeText) fd.append("fiveYearGuaranteeText", form.fiveYearGuaranteeText);
                        fd.append("hasFreeReturns", String(form.hasFreeReturns));
                        if (form.freeReturnsText) fd.append("freeReturnsText", form.freeReturnsText);
                        fd.append("hasInstallmentOptions", String(form.hasInstallmentOptions));
                        if (form.installmentOptionsText) fd.append("installmentOptionsText", form.installmentOptionsText);
                        
                        files.forEach(f => fd.append("images", f));
                        
                        const res = await fetch("/internal/admin/products/upload", { method: "POST", body: fd });
                        const body = await res.json();
                        if (!res.ok) throw new Error(body.message || "Failed");
                        
                        if (form.wholesaleTiers.length > 0) {
                          await fetch(`/api/admin/wholesale/prices/${body.id}`, {
                            method: "POST",
                            headers: {"Content-Type": "application/json"},
                            body: JSON.stringify(form.wholesaleTiers)
                          });
                        }
                        
                        setShowCreate(false);
                        setForm({
                          name: "", sku: "", price: "", description: "", categorySlug: "", brandId: "",
                          stockTotal: "100", stockCurrent: "100", wholesalePrice: "", unitsPerPack: "1",
                          wholesaleMoq: "1", isActive: true, 
                          hasFiveYearGuarantee: true, fiveYearGuaranteeText: "5 Year Guarantee",
                          hasFreeReturns: true, freeReturnsText: "Free Returns",
                          hasInstallmentOptions: true, installmentOptionsText: "Installment Options",
                          images: [], wholesaleTiers: []
                        });
                        setFiles([]);
                        await loadProducts();
                      } catch (e: any) { alert(e.message); }
                      finally { setCreating(false); }
                    }}
                    className="w-full btn-primary h-12"
                  >
                    {creating ? "Creating..." : "Save Wholesale Product"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b">
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Wholesale Info</th>
                  <th className="px-6 py-4">Base Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded bg-slate-100 border overflow-hidden">
                          {p.images?.[0] ? <img src={p.images[0].url} className="w-full h-full object-cover" /> : <Package className="h-6 w-6 m-3 text-slate-300" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-[10px] font-mono text-slate-400">{p.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600 font-medium">{p.unitsPerPack} units/pack</p>
                      <p className="text-[10px] text-slate-400 uppercase font-black">Min Order: {p.wholesaleMoq} packs</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-blue-600">ZK {p.wholesalePrice?.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${p.isActive ? "badge-success" : "badge-danger"}`}>{p.isActive ? "Active" : "Hidden"}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={async () => {
                            let tiers = [];
                            try {
                              const res = await fetch(`/api/admin/wholesale/prices/${p.id}`);
                              if (res.ok) tiers = await res.json();
                            } catch (e) {}

                            setEditItem(p);
                            setEditForm({
                              id: p.id,
                              name: p.name,
                              sku: p.sku,
                              price: String(p.price || ""),
                              description: (p as any).description || "",
                              categorySlug: p.category?.slug || "",
                              brandId: p.brand?.id || "",
                              stockTotal: String(p.stockTotal || ""),
                              stockCurrent: String(p.stockCurrent || ""),
                              wholesalePrice: String(p.wholesalePrice || ""),
                              unitsPerPack: String(p.unitsPerPack || 1),
                              wholesaleMoq: String(p.wholesaleMoq || 1),
                              isActive: p.isActive !== false,
                              hasFiveYearGuarantee: !!p.hasFiveYearGuarantee,
                              fiveYearGuaranteeText: p.fiveYearGuaranteeText || "",
                              hasFreeReturns: !!p.hasFreeReturns,
                              freeReturnsText: p.freeReturnsText || "",
                              hasInstallmentOptions: !!p.hasInstallmentOptions,
                              installmentOptionsText: p.installmentOptionsText || "",
                              images: p.images?.map(img => img.url) || [],
                              wholesaleTiers: tiers.map((t: any) => ({ minQuantity: t.minQuantity, price: Number(t.price) })),
                            });
                          }}
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={async () => {
                          const ok = confirm("Delete this product?");
                          if (!ok) return;
                          await fetch(`/internal/admin/products/${p.id}`, { method: "DELETE" });
                          await loadProducts();
                        }} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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

      {/* Edit Wholesale Product Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90dvh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" /> Edit Wholesale Product
              </h2>
              <button onClick={() => setEditItem(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Product Name</label>
                  <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="admin-input" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">SKU</label>
                  <input value={editForm.sku} onChange={e => setEditForm({...editForm, sku: e.target.value})} className="admin-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Wholesale Price (Per Pack)</label>
                    <input type="number" value={editForm.wholesalePrice} onChange={e => setEditForm({...editForm, wholesalePrice: e.target.value})} className="admin-input" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Units per Pack</label>
                    <input type="number" value={editForm.unitsPerPack} onChange={e => setEditForm({...editForm, unitsPerPack: e.target.value})} className="admin-input" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Min Order Qty (Packs)</label>
                    <input type="number" value={editForm.wholesaleMoq} onChange={e => setEditForm({...editForm, wholesaleMoq: e.target.value})} className="admin-input" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Category</label>
                    <select value={editForm.categorySlug} onChange={e => setEditForm({...editForm, categorySlug: e.target.value})} className="admin-input">
                      {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Description</label>
                  <textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="admin-input h-32" />
                </div>

                {/* Guarantee & Details Section */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Guarantee & Details</p>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.hasFiveYearGuarantee}
                          onChange={(e) => setEditForm({ ...editForm, hasFiveYearGuarantee: e.target.checked })}
                          className="w-3.5 h-3.5 text-blue-500 rounded"
                        />
                        Show Guarantee
                      </label>
                      <input
                        placeholder="Guarantee Text (e.g. 5 YEARS GUARANTEE)"
                        value={editForm.fiveYearGuaranteeText}
                        onChange={(e) => setEditForm({ ...editForm, fiveYearGuaranteeText: e.target.value })}
                        className="admin-input-ghost text-xs bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.hasFreeReturns}
                          onChange={(e) => setEditForm({ ...editForm, hasFreeReturns: e.target.checked })}
                          className="w-3.5 h-3.5 text-blue-500 rounded"
                        />
                        Show Free Returns
                      </label>
                      <input
                        placeholder="Returns Text (e.g. FREE RETURNS)"
                        value={editForm.freeReturnsText}
                        onChange={(e) => setEditForm({ ...editForm, freeReturnsText: e.target.value })}
                        className="admin-input-ghost text-xs bg-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.hasInstallmentOptions}
                          onChange={(e) => setEditForm({ ...editForm, hasInstallmentOptions: e.target.checked })}
                          className="w-3.5 h-3.5 text-blue-500 rounded"
                        />
                        Show Installment Options
                      </label>
                      <input
                        placeholder="Installment Text (e.g. INSTALLMENT OPTIONS)"
                        value={editForm.installmentOptionsText}
                        onChange={(e) => setEditForm({ ...editForm, installmentOptionsText: e.target.value })}
                        className="admin-input-ghost text-xs bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Price Tiers</label>
                  <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    {editForm.wholesaleTiers.map((t, i) => (
                      <div key={i} className="flex gap-2 items-center bg-white p-2 rounded-lg border">
                        <input type="number" value={t.minQuantity} onChange={e => {
                          const nt = [...editForm.wholesaleTiers];
                          nt[i].minQuantity = Number(e.target.value);
                          setEditForm({...editForm, wholesaleTiers: nt});
                        }} className="admin-input-ghost text-xs w-20" placeholder="Qty" />
                        <span className="text-slate-300">→</span>
                        <input type="number" value={t.price} onChange={e => {
                          const nt = [...editForm.wholesaleTiers];
                          nt[i].price = Number(e.target.value);
                          setEditForm({...editForm, wholesaleTiers: nt});
                        }} className="admin-input-ghost text-xs flex-1" placeholder="Price" />
                        <button onClick={() => setEditForm({...editForm, wholesaleTiers: editForm.wholesaleTiers.filter((_, idx) => idx !== i)})} className="text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                    <button onClick={() => setEditForm({...editForm, wholesaleTiers: [...editForm.wholesaleTiers, {minQuantity: 0, price: 0}]})} className="text-[10px] font-black text-blue-600 uppercase hover:underline">+ Add Tier</button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Product Images</label>
                  <div className="grid grid-cols-4 gap-2">
                    {editForm.images.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg border overflow-hidden bg-white shadow-sm group">
                        <img src={src} className="w-full h-full object-cover" />
                        <button onClick={() => setEditForm({...editForm, images: editForm.images.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                      <PlusCircle className="h-6 w-6 text-slate-300" />
                      <input type="file" multiple accept="image/*" className="hidden" onChange={async e => {
                        const files = Array.from(e.target.files || []);
                        const previews = await Promise.all(files.map(f => compressImage(f, 1200, 0.85)));
                        setEditForm({...editForm, images: [...editForm.images, ...previews]});
                        setEditFiles(prev => [...prev, ...files]);
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
                        fd.append("wholesalePrice", editForm.wholesalePrice);
                        fd.append("price", editForm.price || editForm.wholesalePrice);
                        fd.append("unitsPerPack", editForm.unitsPerPack);
                        fd.append("wholesaleMoq", editForm.wholesaleMoq);
                        fd.append("categorySlug", editForm.categorySlug);
                        fd.append("description", editForm.description);
                        fd.append("isWholesaleOnly", "true");
                        fd.append("allowCredit", "false");
                        
                        fd.append("hasFiveYearGuarantee", String(editForm.hasFiveYearGuarantee));
                        if (editForm.fiveYearGuaranteeText) fd.append("fiveYearGuaranteeText", editForm.fiveYearGuaranteeText);
                        fd.append("hasFreeReturns", String(editForm.hasFreeReturns));
                        if (editForm.freeReturnsText) fd.append("freeReturnsText", editForm.freeReturnsText);
                        fd.append("hasInstallmentOptions", String(editForm.hasInstallmentOptions));
                        if (editForm.installmentOptionsText) fd.append("installmentOptionsText", editForm.installmentOptionsText);
                        
                        editFiles.forEach(f => fd.append("images", f));
                        // Also handle existing images if needed (depends on how backend handles updates)
                        
                        const res = await fetch(`/internal/admin/products/${editItem.id}`, { method: "PUT", body: fd });
                        if (!res.ok) throw new Error("Update failed");
                        
                        await fetch(`/api/admin/wholesale/prices/${editItem.id}`, {
                          method: "POST",
                          headers: {"Content-Type": "application/json"},
                          body: JSON.stringify(editForm.wholesaleTiers)
                        });
                        
                        setEditItem(null);
                        await loadProducts();
                      } catch (e: any) { alert(e.message); }
                      finally { setCreating(false); }
                    }}
                    className="flex-[2] px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 uppercase tracking-widest text-xs"
                  >
                    {creating ? "Saving..." : "Update Wholesale Product"}
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
