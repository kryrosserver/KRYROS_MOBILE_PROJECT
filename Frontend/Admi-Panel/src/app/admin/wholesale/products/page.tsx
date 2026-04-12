"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Package,
  Plus,
  Trash2,
  Edit,
  X,
  RefreshCw,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  isActive?: boolean;
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

export default function WholesaleProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
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
    loadProducts();
  }, [loadProducts]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/wholesale" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Wholesale Inventory</h1>
            <p className="text-slate-500 text-sm">Manage products exclusively for wholesale partners</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={loadProducts} className="p-2 text-slate-400 hover:text-blue-600"><RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} /></button>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" /> {showCreate ? "Close Form" : "Add Wholesale Product"}
          </button>
        </div>
      </div>

      {showCreate && (
        <div className="admin-card p-6 border-2 border-blue-100 bg-blue-50/10 mb-8">
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
                    fd.append("isWholesaleOnly", "true");
                    fd.append("allowCredit", "false");
                    fd.append("unitsPerPack", form.unitsPerPack);
                    fd.append("wholesaleMoq", form.wholesaleMoq);
                    fd.append("categorySlug", form.categorySlug || "general");
                    fd.append("description", form.description);
                    fd.append("isActive", String(form.isActive));
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
  );
}