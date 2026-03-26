"use client";

import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "@/lib/config";
import { formatPrice } from "@/lib/utils";
import { X, Package, Image as ImageIcon, PlusCircle } from "lucide-react";

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
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
  allowCredit?: boolean;
  creditMinimum?: number | string | null;
  creditMessage?: string | null;
  deliveryInfo?: string | null;
  warrantyInfo?: string | null;
  flashSalePrice?: number | null;
  flashSaleEnd?: string | null;
  category?: { id: string; name: string; slug: string };
  brand?: { id: number; name: string; slug: string };
  specifications?: string | any[];
  images?: any[];
  productRelations?: any[];
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Brand = {
  id: number;
  name: string;
  slug: string;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "featured" | "flash" | "credit">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    description: "",
    shortDescription: "",
    categorySlug: "",
    brandId: "" as string | number,
    isFeatured: false,
    isNew: true,
    discountPercentage: "",
    stockTotal: "50",
    stockCurrent: "42",
    hasFiveYearGuarantee: true,
    fiveYearGuaranteeText: "5 Year Guarantee",
    hasFreeReturns: true,
    freeReturnsText: "Free Returns",
    hasInstallmentOptions: true,
    installmentOptionsText: "Installment Options",
    wholesalePrice: "",
    isWholesaleOnly: false,
    unitsPerPack: "1",
    wholesaleMoq: "1",
    upsellProductId: "",
    isActive: true,
    allowCredit: false,
    creditMinimum: "",
    creditMessage: "",
    deliveryInfo: "",
    warrantyInfo: "",
    images: [] as string[],
    specifications: [] as { key: string; value: string }[],
    wholesaleTiers: [] as { minQuantity: number; price: number }[],
  });
  const [files, setFiles] = useState<File[]>([]);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    price: "",
    description: "",
    shortDescription: "",
    categorySlug: "",
    brandId: "" as string | number,
    isActive: true,
    isFeatured: false,
    isNew: true,
    discountPercentage: "",
    stockTotal: "",
    stockCurrent: "",
    hasFiveYearGuarantee: true,
    fiveYearGuaranteeText: "",
    hasFreeReturns: true,
    freeReturnsText: "",
    hasInstallmentOptions: true,
    installmentOptionsText: "",
    wholesalePrice: "",
    isWholesaleOnly: false,
    unitsPerPack: "1",
    wholesaleMoq: "1",
    upsellProductId: "",
    allowCredit: false,
    creditMinimum: "",
    creditMessage: "",
    deliveryInfo: "",
    warrantyInfo: "",
    images: [] as string[],
    specifications: [] as { key: string; value: string }[],
    wholesaleTiers: [] as { minQuantity: number; price: number }[],
  });
  const [editFiles, setEditFiles] = useState<File[]>([]);

  async function compressImage(file: File, maxWidth = 1500, quality = 0.8): Promise<string> {
    const blobURL = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = blobURL;
    });
    const scale = Math.min(1, maxWidth / img.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(blobURL);
    // Prefer JPEG to drastically reduce size; fallback to PNG if original is PNG
    const isPng = file.type.includes("png");
    const type = isPng ? "image/png" : "image/jpeg";
    return canvas.toDataURL(type, quality);
  }
  
  function getAdminToken(): string {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/(?:^|; )admin_token=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }

  const loadData = useCallback(async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/admin/brands")
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (brandRes.ok) setBrands(await brandRes.json());
    } catch (e) {
      console.error("Failed to load categories/brands", e);
    }
  }, []);

  const load = useCallback(async (search = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL("/api/admin/products", window.location.origin);
      if (search) url.searchParams.set("search", search);
      url.searchParams.set("showInactive", "true");
      const res = await fetch(url.toString(), { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed to load products");
      const items = Array.isArray(body?.products) ? body.products : body?.data || [];
      setProducts(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const timer = setTimeout(() => {
      load(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, load, loadData]);

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-input h-10 w-64"
          />
          <button onClick={() => load(searchTerm)} className="btn-secondary">Refresh</button>
        </div>
      </div>

      <div className="admin-card p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add New Product</h2>
            <p className="text-sm text-slate-500">Upload product details and images</p>
          </div>
          <button onClick={() => setShowCreate(v => !v)} className="btn-secondary">
            {showCreate ? "Close" : "Add Product"}
          </button>
        </div>
        {showCreate && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <input
                placeholder="Product name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="admin-input w-full"
              />
              <input
                placeholder="SKU"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="admin-input w-full"
              />
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Retail Price (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Retail Price"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="admin-input w-full h-24"
              />
              <textarea
                placeholder="Short Description (Optional - shows below product title)"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="admin-input w-full h-16"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={form.categorySlug}
                  onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                  className="admin-input w-full"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={form.brandId}
                  onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                  className="admin-input w-full"
                >
                  <option value="">Select Brand (Optional)</option>
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isNew}
                    onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                  />
                  New Badge
                </label>
                <div className="flex flex-col gap-1">
                  <input
                    type="number"
                    placeholder="Discount %"
                    value={form.discountPercentage}
                    onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })}
                    className="admin-input w-24"
                  />
                </div>
              </div>

              {/* Stock Scarcity Section */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-slate-700">Stock Scarcity Logic</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Total Stock Capacity"
                    value={form.stockTotal}
                    onChange={(e) => setForm({ ...form, stockTotal: e.target.value })}
                    className="admin-input w-full"
                  />
                  <input
                    type="number"
                    placeholder="Current Stock"
                    value={form.stockCurrent}
                    onChange={(e) => setForm({ ...form, stockCurrent: e.target.value })}
                    className="admin-input w-full"
                  />
                </div>
              </div>

              {/* Wholesale Pricing Section */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-slate-700">Upsell & Bundle Logic</p>
                <div className="space-y-2">
                  <select
                    className="admin-input w-full"
                    value={form.upsellProductId}
                    onChange={(e) => setForm({ ...form, upsellProductId: e.target.value })}
                  >
                    <option value="">Select Linked Accessory (Upsell)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 italic">This product will be offered as a bundle with 8% discount on the product details page.</p>
                </div>
                
                <div className="flex flex-col gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <label className="flex items-center gap-2 text-sm font-bold text-blue-700">
                    <input
                      type="checkbox"
                      checked={form.isWholesaleOnly}
                      onChange={(e) => setForm({ ...form, isWholesaleOnly: e.target.checked })}
                    />
                    WHolesale Only Product
                  </label>
                  <p className="text-[10px] text-blue-600 italic px-6">If checked, this product will be hidden from regular retail customers.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Units per Pack</label>
                    <input
                      type="number"
                      placeholder="Units per Pack (e.g. 20)"
                      value={form.unitsPerPack}
                      onChange={(e) => setForm({ ...form, unitsPerPack: e.target.value })}
                      className="admin-input w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Min Order Qty (Packs)</label>
                    <input
                      type="number"
                      placeholder="Min Packs (e.g. 5)"
                      value={form.wholesaleMoq}
                      onChange={(e) => setForm({ ...form, wholesaleMoq: e.target.value })}
                      className="admin-input w-full"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Base Wholesale Price (Per Pack)</label>
                  <input
                    type="number"
                    placeholder="Base Wholesale Price"
                    value={form.wholesalePrice}
                    onChange={(e) => setForm({ ...form, wholesalePrice: e.target.value })}
                    className="admin-input w-full"
                  />
                </div>

                <div className="space-y-2 mt-2">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Wholesale Tiers (Quantity Based)</p>
                  {form.wholesaleTiers.map((tier, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="Min Qty (e.g. 10)"
                        value={tier.minQuantity}
                        onChange={(e) => {
                          const newTiers = [...form.wholesaleTiers];
                          newTiers[idx].minQuantity = Number(e.target.value);
                          setForm({ ...form, wholesaleTiers: newTiers });
                        }}
                        className="admin-input flex-1"
                      />
                      <input
                        type="number"
                        placeholder="Price (e.g. 150)"
                        value={tier.price}
                        onChange={(e) => {
                          const newTiers = [...form.wholesaleTiers];
                          newTiers[idx].price = Number(e.target.value);
                          setForm({ ...form, wholesaleTiers: newTiers });
                        }}
                        className="admin-input flex-1"
                      />
                      <button
                        onClick={() => setForm({ ...form, wholesaleTiers: form.wholesaleTiers.filter((_, i) => i !== idx) })}
                        className="text-red-500 p-1 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setForm({ ...form, wholesaleTiers: [...form.wholesaleTiers, { minQuantity: 0, price: 0 }] })}
                    className="text-xs text-blue-600 font-bold hover:underline"
                  >
                    + Add Price Tier
                  </button>
                </div>
              </div>

              {/* Guarantees Section */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-slate-700">Guarantees & Options</p>
                <div className="space-y-3">
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.hasFiveYearGuarantee}
                        onChange={(e) => setForm({ ...form, hasFiveYearGuarantee: e.target.checked })}
                      />
                      5 Year Guarantee
                    </label>
                    {form.hasFiveYearGuarantee && (
                      <input
                        placeholder="Guarantee Text (e.g. 5 Year Guarantee)"
                        value={form.fiveYearGuaranteeText}
                        onChange={(e) => setForm({ ...form, fiveYearGuaranteeText: e.target.value })}
                        className="admin-input w-full text-xs"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.hasFreeReturns}
                        onChange={(e) => setForm({ ...form, hasFreeReturns: e.target.checked })}
                      />
                      Free Returns
                    </label>
                    {form.hasFreeReturns && (
                      <input
                        placeholder="Returns Text (e.g. Free Returns)"
                        value={form.freeReturnsText}
                        onChange={(e) => setForm({ ...form, freeReturnsText: e.target.value })}
                        className="admin-input w-full text-xs"
                      />
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.hasInstallmentOptions}
                        onChange={(e) => setForm({ ...form, hasInstallmentOptions: e.target.checked })}
                      />
                      Installment Options
                    </label>
                    {form.hasInstallmentOptions && (
                      <input
                        placeholder="Installment Text (e.g. Installment Options)"
                        value={form.installmentOptionsText}
                        onChange={(e) => setForm({ ...form, installmentOptionsText: e.target.value })}
                        className="admin-input w-full text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.allowCredit}
                    onChange={(e) => setForm({ ...form, allowCredit: e.target.checked })}
                  />
                  Allow Credit
                </label>
                {form.allowCredit && (
                  <div className="grid grid-cols-2 gap-3 pl-6 border-l-2 border-green-200 w-full mt-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Down Payment (Min)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="e.g. 1500"
                        value={form.creditMinimum}
                        onChange={(e) => setForm({ ...form, creditMinimum: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Monthly Installment</label>
                      <input
                        placeholder="e.g. 250/month"
                        value={form.creditMessage}
                        onChange={(e) => setForm({ ...form, creditMessage: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping & Warranty Section */}
              <div className="border-t pt-4 space-y-3">
                <p className="text-sm font-medium text-slate-700">Display Information</p>
                <input
                  placeholder="Delivery Info (e.g. Fast Delivery - Lusaka)"
                  value={form.deliveryInfo}
                  onChange={(e) => setForm({ ...form, deliveryInfo: e.target.value })}
                  className="admin-input w-full"
                />
                <input
                  placeholder="Warranty Info (e.g. 1 Year Warranty)"
                  value={form.warrantyInfo}
                  onChange={(e) => setForm({ ...form, warrantyInfo: e.target.value })}
                  className="admin-input w-full"
                />
              </div>

              {/* Specifications Section */}
              <div className="border-t pt-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Specifications (e.g., RAM: 8GB)</p>
                <div className="space-y-2">
                  {form.specifications.map((spec, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        placeholder="Key (e.g. RAM)"
                        value={spec.key}
                        onChange={(e) => {
                          const newSpecs = [...form.specifications];
                          newSpecs[idx].key = e.target.value;
                          setForm({ ...form, specifications: newSpecs });
                        }}
                        className="admin-input flex-1"
                      />
                      <input
                        placeholder="Value (e.g. 8GB)"
                        value={spec.value}
                        onChange={(e) => {
                          const newSpecs = [...form.specifications];
                          newSpecs[idx].value = e.target.value;
                          setForm({ ...form, specifications: newSpecs });
                        }}
                        className="admin-input flex-1"
                      />
                      <button
                        onClick={() => setForm({ ...form, specifications: form.specifications.filter((_, i) => i !== idx) })}
                        className="text-red-500 p-2"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setForm({ ...form, specifications: [...form.specifications, { key: "", value: "" }] })}
                    className="text-sm text-green-600 font-medium hover:underline"
                  >
                    + Add Specification
                  </button>
                </div>
              </div>
            </div>
            <div>
              <div className="border rounded-lg p-4 bg-slate-50">
                <p className="text-sm font-medium text-slate-700">Images</p>
                <p className="text-xs text-slate-500 mb-2">Upload one or more images. First image becomes primary.</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    const previews = await Promise.all(
                      files.map((file) => compressImage(file, 1800, 0.9))
                    );
                    setForm((prev) => ({ ...prev, images: previews }));
                    setFiles(files);
                  }}
                />
                {form.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {form.images.map((src, i) => (
                      <div key={i} className="aspect-square rounded-md overflow-hidden border bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  disabled={creating}
                  onClick={async () => {
                    try {
                      if (!form.name || !form.sku || !form.price || !form.description) {
                        alert("Please fill in name, SKU, price and description.");
                        return;
                      }
                      setCreating(true);
                      let res;
                      const formData = new FormData();
                      formData.append("name", form.name);
                      formData.append("sku", form.sku);
                      formData.append("price", String(Number(form.price)));
                      formData.append("description", form.description);
                      if (form.shortDescription) formData.append("shortDescription", form.shortDescription);
                      formData.append("categorySlug", form.categorySlug || "general");
                      formData.append("brandId", String(form.brandId));
                      formData.append("isActive", String(form.isActive));
                      formData.append("isFeatured", String(form.isFeatured));
                      formData.append("isNew", String(form.isNew));
                      if (form.discountPercentage) formData.append("discountPercentage", String(Number(form.discountPercentage)));
                      formData.append("stockTotal", String(Number(form.stockTotal || 0)));
                      formData.append("stockCurrent", String(Number(form.stockCurrent || 0)));
                      formData.append("hasFiveYearGuarantee", String(form.hasFiveYearGuarantee));
                      if (form.fiveYearGuaranteeText) formData.append("fiveYearGuaranteeText", form.fiveYearGuaranteeText);
                      formData.append("hasFreeReturns", String(form.hasFreeReturns));
                      if (form.freeReturnsText) formData.append("freeReturnsText", form.freeReturnsText);
                      formData.append("hasInstallmentOptions", String(form.hasInstallmentOptions));
                      if (form.installmentOptionsText) formData.append("installmentOptionsText", form.installmentOptionsText);
                      if (form.wholesalePrice) formData.append("wholesalePrice", String(Number(form.wholesalePrice)));
                      formData.append("isWholesaleOnly", String(form.isWholesaleOnly));
                      formData.append("unitsPerPack", String(Number(form.unitsPerPack || 1)));
                      formData.append("wholesaleMoq", String(Number(form.wholesaleMoq || 1)));
                      if (form.upsellProductId) formData.append("upsellProductId", String(form.upsellProductId));
                      formData.append("allowCredit", String(form.allowCredit));
                      if (form.creditMinimum) formData.append("creditMinimum", String(Number(form.creditMinimum)));
                      if (form.creditMessage) formData.append("creditMessage", form.creditMessage);
                      if (form.deliveryInfo) formData.append("deliveryInfo", form.deliveryInfo);
                      if (form.warrantyInfo) formData.append("warrantyInfo", form.warrantyInfo);
                      if (form.specifications.length > 0) formData.append("specifications", JSON.stringify(form.specifications));

                      if (files.length > 0) {
                        const blobs = await Promise.all(
                          files.map(async (f) => {
                            const tooLarge = f.size > 3 * 1024 * 1024;
                            if (!tooLarge) return f;
                            const blobUrl = await compressImage(f, 2000, 0.9);
                            const resp = await fetch(blobUrl);
                            const blob = await resp.blob();
                            return new File([blob], f.name.replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg"), { type: "image/jpeg" });
                          })
                        );
                        for (const b of blobs) {
                          formData.append("images", b);
                        }
                      }

                      res = await fetch("/internal/admin/products/upload", {
                        method: "POST",
                        body: formData,
                      });
                      
                      const body = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(body?.error || body?.message || "Failed to create product");
                      
                      // Save wholesale tiers if any
                      if (form.wholesaleTiers.length > 0) {
                        await fetch(`/api/admin/wholesale/prices/${body.id}`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(form.wholesaleTiers),
                        });
                      }

                      setShowCreate(false);
                      setForm({
                        name: "",
                        sku: "",
                        price: "",
                        description: "",
                        shortDescription: "",
                        categorySlug: "general",
                        brandId: "",
                        isFeatured: false,
                        isNew: true,
                        discountPercentage: "",
                        stockTotal: "50",
                        stockCurrent: "42",
                        hasFiveYearGuarantee: true,
                        fiveYearGuaranteeText: "5 Year Guarantee",
                        hasFreeReturns: true,
                        freeReturnsText: "Free Returns",
                        hasInstallmentOptions: true,
                        installmentOptionsText: "Installment Options",
                        wholesalePrice: "",
                        isWholesaleOnly: false,
                        unitsPerPack: "1",
                        wholesaleMoq: "1",
                        upsellProductId: "",
                        isActive: true,
                        allowCredit: false,
                        creditMinimum: "",
                        creditMessage: "",
                        deliveryInfo: "",
                        warrantyInfo: "",
                        images: [],
                        specifications: [],
                        wholesaleTiers: [] as { minQuantity: number; price: number }[],
                      });
                      setFiles([]);
                      await load();
                    } catch (e: any) {
                      alert(e.message || "Failed to create product");
                    } finally {
                      setCreating(false);
                    }
                  }}
                  className="btn-primary"
                >
                  {creating ? "Creating..." : "Save Product"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="admin-card p-3 flex gap-2">
        <button
          onClick={() => setTab("all")}
          className={`px-3 py-1.5 rounded ${tab === "all" ? "bg-green-500 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          All
        </button>
        <button
          onClick={() => setTab("featured")}
          className={`px-3 py-1.5 rounded ${tab === "featured" ? "bg-green-500 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Featured
        </button>
        <button
          onClick={() => setTab("flash")}
          className={`px-3 py-1.5 rounded ${tab === "flash" ? "bg-green-500 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Flash Sales
        </button>
        <button
          onClick={() => setTab("credit")}
          className={`px-3 py-1.5 rounded ${tab === "credit" ? "bg-green-500 text-white" : "bg-slate-100 text-slate-700"}`}
        >
          Credit
        </button>
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Status</th>
                <th>Credit</th>
                {tab !== "flash" && <th>Featured</th>}
                {tab !== "featured" && <th>Flash Sale</th>}
                {tab === "flash" && <th>Flash Price</th>}
                {tab === "flash" && <th>Flash Ends</th>}
                <th className="text-right">Save</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td><div className="h-10 w-10 bg-slate-100 rounded"></div></td>
                    <td><div className="h-4 bg-slate-100 rounded w-3/4"></div></td>
                    <td><div className="h-4 bg-slate-100 rounded w-1/2"></div></td>
                    <td><div className="h-4 bg-slate-100 rounded w-1/2"></div></td>
                    <td><div className="h-4 bg-slate-100 rounded w-1/3"></div></td>
                    <td><div className="h-4 bg-slate-100 rounded w-1/4"></div></td>
                    <td><div className="h-6 bg-slate-100 rounded-full w-16"></div></td>
                    <td><div className="h-4 bg-slate-100 rounded w-4"></div></td>
                    <td><div className="h-4 bg-slate-100 rounded w-4"></div></td>
                    <td className="text-right"><div className="h-8 bg-slate-100 rounded-lg w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : (tab === "featured" ? products.filter(p => !!p.isFeatured) : tab === "flash" ? products.filter(p => !!(p as any).isFlashSale) : tab === "credit" ? products.filter(p => !!p.allowCredit) : products).map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="h-12 w-12 rounded-lg overflow-hidden border bg-slate-50">
                      {p.images && p.images[0] ? (
                        <img 
                          src={typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url} 
                          alt={p.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">No image</div>
                      )}
                    </div>
                  </td>
                  <td className="font-medium text-slate-900">{p.name}</td>
                  <td className="font-mono text-sm">{p.sku}</td>
                  <td>{p.category?.name || "—"}</td>
                  <td>{p.brand?.name || "—"}</td>
                  <td>{formatPrice(Number(p.price))}</td>
                  <td><span className={`badge ${p.isActive !== false ? "badge-success" : "badge-danger"}`}>{p.isActive !== false ? "Active" : "Inactive"}</span></td>
                  <td>
                    <div className="flex flex-col items-center">
                      <input
                        type="checkbox"
                        checked={!!p.allowCredit}
                        onChange={(e) => {
                          setProducts(prev => prev.map(x => x.id === p.id ? { ...x, allowCredit: e.target.checked } : x));
                        }}
                      />
                      {p.allowCredit && p.creditMinimum && (
                        <span className="text-[10px] text-slate-500">Min: {p.creditMinimum}</span>
                      )}
                    </div>
                  </td>
                  {tab !== "flash" && (
                  <td>
                    <input
                      type="checkbox"
                      checked={!!p.isFeatured}
                      onChange={(e) => {
                        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isFeatured: e.target.checked } : x));
                      }}
                    />
                  </td>
                  )}
                  {tab !== "featured" && (
                  <td>
                    <input
                      type="checkbox"
                      checked={!!p.isFlashSale}
                      onChange={(e) => {
                        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isFlashSale: e.target.checked } : x));
                      }}
                    />
                  </td>
                  )}
                  {tab === "flash" && (
                  <td>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Promo price"
                      value={(p as any).flashSalePrice ?? ""}
                      onChange={(e) => {
                        const hasValue = e.target.value !== "";
                        const val = hasValue ? Number(e.target.value) : undefined;
                        setProducts(prev => prev.map(x => x.id === p.id ? { ...(x as any), flashSalePrice: val } : x));
                      }}
                      className="admin-input w-36"
                    />
                  </td>
                  )}
                  {tab === "flash" && (
                  <td>
                    <input
                      type="datetime-local"
                      value={p.flashSaleEnd ? new Date(p.flashSaleEnd).toISOString().slice(0,16) : ""}
                      onChange={(e) => {
                        const iso = e.target.value ? new Date(e.target.value).toISOString() : null;
                        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, flashSaleEnd: iso } : x));
                      }}
                      className="admin-input"
                    />
                  </td>
                  )}
                  <td className="text-right space-x-2">
                    <button
                      onClick={async () => {
                        // Fetch wholesale prices first
                        let tiers = [];
                        try {
                          const res = await fetch(`/api/admin/wholesale/prices/${p.id}`);
                          if (res.ok) tiers = await res.json();
                        } catch (e) {}

                        setEditItem(p);
                        setEditForm({
                          id: p.id,
                          name: p.name,
                          price: String(p.price ?? ""),
                          description: (p as any).description || "",
                          shortDescription: (p as any).shortDescription || "",
                          categorySlug: p.category?.slug || "",
                          brandId: p.brand?.id || "",
                          isActive: p.isActive !== false,
                          isFeatured: !!p.isFeatured,
                          isNew: !!p.isNew,
                          discountPercentage: String(p.discountPercentage ?? ""),
                          stockTotal: String(p.stockTotal ?? ""),
                          stockCurrent: String(p.stockCurrent ?? ""),
                          hasFiveYearGuarantee: !!p.hasFiveYearGuarantee,
                          fiveYearGuaranteeText: p.fiveYearGuaranteeText || "5 Year Guarantee",
                          hasFreeReturns: !!p.hasFreeReturns,
                          freeReturnsText: p.freeReturnsText || "Free Returns",
                          hasInstallmentOptions: !!p.hasInstallmentOptions,
                          installmentOptionsText: p.installmentOptionsText || "Installment Options",
                          wholesalePrice: String(p.wholesalePrice ?? ""),
                          isWholesaleOnly: !!(p as any).isWholesaleOnly,
                          unitsPerPack: String((p as any).unitsPerPack || 1),
                          wholesaleMoq: String((p as any).wholesaleMoq || 1),
                          upsellProductId: String(p.productRelations?.[0]?.relatedId ?? ""),
                          allowCredit: !!p.allowCredit,
                          creditMinimum: String(p.creditMinimum ?? ""),
                          creditMessage: p.creditMessage || "",
                          deliveryInfo: p.deliveryInfo || "",
                          warrantyInfo: p.warrantyInfo || "",
                          specifications: typeof (p as any).specifications === 'string' 
                            ? JSON.parse((p as any).specifications) 
                            : (Array.isArray((p as any).specifications) ? (p as any).specifications : []),
                          images: Array.isArray(p.images) ? p.images.map((img: any) => img.url) : [],
                          wholesaleTiers: Array.isArray(tiers) ? tiers.map(t => ({ minQuantity: t.minQuantity, price: Number(t.price) })) : [],
                        });
                        setEditFiles([]);
                      }}
                      className="btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        const ok = confirm(`Delete product "${p.name}"? This cannot be undone.`);
                        if (!ok) return;
                        try {
                          const res = await fetch(`/internal/admin/products/${p.id}`, { method: "DELETE" });
                          const body = await res.json().catch(() => ({}));
                          if (!res.ok) throw new Error(body?.error || "Failed to delete");
                          setProducts(prev => prev.filter(x => x.id !== p.id));
                        } catch (e) {
                          alert(e instanceof Error ? e.message : "Failed to delete");
                        }
                      }}
                      className="btn-danger"
                    >
                      Delete
                    </button>
                    <button
                      disabled={savingId === p.id}
                      onClick={async () => {
                        try {
                          setSavingId(p.id);
                          const payload: any = {
                            ...(tab !== "flash" ? { isFeatured: !!p.isFeatured } : {}),
                            ...(tab !== "featured" ? { isFlashSale: !!p.isFlashSale } : {}),
                            ...(tab === "flash" ? { flashSaleEnd: p.flashSaleEnd } : {}),
                            allowCredit: !!p.allowCredit,
                          };
                          if (tab === "flash" && (p as any).flashSalePrice !== undefined) {
                            payload.flashSalePrice = (p as any).flashSalePrice;
                          }
                          const res = await fetch(`/internal/admin/products/${p.id}/flags`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(payload),
                          });
                          const body = await res.json().catch(() => ({}));
                          if (!res.ok) throw new Error(body?.error || "Failed to save");
                          await load();
                        } catch (e) {
                          alert(e instanceof Error ? e.message : "Failed to save");
                        } finally {
                          setSavingId(null);
                        }
                      }}
                      className="btn-primary"
                    >
                      {savingId === p.id ? "Saving..." : "Save"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-4 text-sm text-slate-500">Loading...</div>}
          {!loading && !products.length && !error && (
            <div className="p-4 text-sm text-slate-500">
              No products yet. Use “Seed Sample Products” to add a few items, then toggle Featured and Save.
            </div>
          )}
          {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </div>
    {editItem && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b shrink-0">
            <h3 className="text-xl font-bold text-slate-900">Edit Product</h3>
            <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Basic Information */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
                  <input
                    placeholder="Product name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="admin-input w-full"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Standard Retail Price (USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Retail Price"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="admin-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand</label>
                    <select
                      value={editForm.brandId}
                      onChange={(e) => setEditForm({ ...editForm, brandId: e.target.value })}
                      className="admin-input w-full"
                    >
                      <option value="">Select Brand (Optional)</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <select
                    value={editForm.categorySlug}
                    onChange={(e) => setEditForm({ ...editForm, categorySlug: e.target.value })}
                    className="admin-input w-full"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                  <textarea
                    placeholder="Description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="admin-input w-full h-32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Short Description</label>
                  <textarea
                    placeholder="Short Description"
                    value={editForm.shortDescription}
                    onChange={(e) => setEditForm({ ...editForm, shortDescription: e.target.value })}
                    className="admin-input w-full h-20"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                  <p className="text-sm font-bold text-slate-800 border-b pb-2">Product Status & Options</p>
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        className="w-4 h-4 text-green-500 rounded"
                      />
                      Active on Site
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isFeatured}
                        onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                        className="w-4 h-4 text-green-500 rounded"
                      />
                      Featured Product
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isNew}
                        onChange={(e) => setEditForm({ ...editForm, isNew: e.target.checked })}
                        className="w-4 h-4 text-green-500 rounded"
                      />
                      New Badge
                    </label>
                    <div className="flex flex-col gap-1 col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount Percentage (%)</label>
                      <input
                        type="number"
                        placeholder="Discount %"
                        value={editForm.discountPercentage}
                        onChange={(e) => setEditForm({ ...editForm, discountPercentage: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Stock Capacity</label>
                      <input
                        type="number"
                        placeholder="Total Capacity"
                        value={editForm.stockTotal}
                        onChange={(e) => setEditForm({ ...editForm, stockTotal: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Stock</label>
                      <input
                        type="number"
                        placeholder="Current Stock"
                        value={editForm.stockCurrent}
                        onChange={(e) => setEditForm({ ...editForm, stockCurrent: e.target.value })}
                        className="admin-input w-full"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Linked Accessory (Upsell Bundle)</label>
                    <select
                      className="admin-input w-full"
                      value={editForm.upsellProductId}
                      onChange={(e) => setEditForm({ ...editForm, upsellProductId: e.target.value })}
                    >
                      <option value="">No Accessory Linked</option>
                      {products.filter(p => p.id !== editForm.id).map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-500 mt-1 italic">Selecting a product here will enable the 8% bundle discount offer.</p>
                  </div>

                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Base Wholesale Price (USD)</label>
                    <input
                      type="number"
                      placeholder="Base Wholesale Price"
                      value={editForm.wholesalePrice}
                      onChange={(e) => setEditForm({ ...editForm, wholesalePrice: e.target.value })}
                      className="admin-input w-full"
                    />
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-4">
                    <p className="text-sm font-bold text-blue-800 border-b border-blue-200 pb-2">Wholesale & Bulk Pack</p>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-2 text-sm font-bold text-blue-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editForm.isWholesaleOnly}
                          onChange={(e) => setEditForm({ ...editForm, isWholesaleOnly: e.target.checked })}
                          className="w-4 h-4 text-blue-500 rounded"
                        />
                        Wholesale Only Product
                      </label>
                      <p className="text-[10px] text-blue-600 italic px-6">Hidden from regular retail customers.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Units per Pack</label>
                        <input
                          type="number"
                          placeholder="Units per Pack (e.g. 20)"
                          value={editForm.unitsPerPack}
                          onChange={(e) => setEditForm({ ...editForm, unitsPerPack: e.target.value })}
                          className="admin-input w-full bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Min Order Qty (Packs)</label>
                        <input
                          type="number"
                          placeholder="Min Packs (e.g. 5)"
                          value={editForm.wholesaleMoq}
                          onChange={(e) => setEditForm({ ...editForm, wholesaleMoq: e.target.value })}
                          className="admin-input w-full bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 space-y-3 border-t border-slate-100">
                    <p className="text-sm font-bold text-slate-800">Tiered Wholesale Pricing (Quantity Based)</p>
                    {editForm.wholesaleTiers.map((tier, idx) => (
                      <div key={idx} className="flex gap-2 items-center bg-white p-2 rounded border border-slate-100 shadow-sm">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Min Qty</label>
                          <input
                            type="number"
                            placeholder="e.g. 10"
                            value={tier.minQuantity}
                            onChange={(e) => {
                              const newTiers = [...editForm.wholesaleTiers];
                              newTiers[idx].minQuantity = Number(e.target.value);
                              setEditForm({ ...editForm, wholesaleTiers: newTiers });
                            }}
                            className="admin-input w-full text-xs"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Price</label>
                          <input
                            type="number"
                            placeholder="e.g. 150"
                            value={tier.price}
                            onChange={(e) => {
                              const newTiers = [...editForm.wholesaleTiers];
                              newTiers[idx].price = Number(e.target.value);
                              setEditForm({ ...editForm, wholesaleTiers: newTiers });
                            }}
                            className="admin-input w-full text-xs"
                          />
                        </div>
                        <button
                          onClick={() => setEditForm({ ...editForm, wholesaleTiers: editForm.wholesaleTiers.filter((_, i) => i !== idx) })}
                          className="text-red-500 p-1 hover:bg-red-50 rounded mt-4"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setEditForm({ ...editForm, wholesaleTiers: [...editForm.wholesaleTiers, { minQuantity: 0, price: 0 }] })}
                      className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                    >
                      <PlusCircle className="h-3 w-3" /> Add Price Tier
                    </button>
                  </div>

                  <div className="pt-2 space-y-3">
                    <p className="text-sm font-bold text-slate-800 border-b pb-2">Guarantees</p>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.hasFiveYearGuarantee}
                            onChange={(e) => setEditForm({ ...editForm, hasFiveYearGuarantee: e.target.checked })}
                            className="w-4 h-4 text-green-500 rounded"
                          />
                          5 Year Guarantee
                        </label>
                        {editForm.hasFiveYearGuarantee && (
                          <input
                            placeholder="Guarantee Text (e.g. 5 Year Guarantee)"
                            value={editForm.fiveYearGuaranteeText}
                            onChange={(e) => setEditForm({ ...editForm, fiveYearGuaranteeText: e.target.value })}
                            className="admin-input w-full text-xs"
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.hasFreeReturns}
                            onChange={(e) => setEditForm({ ...editForm, hasFreeReturns: e.target.checked })}
                            className="w-4 h-4 text-green-500 rounded"
                          />
                          Free Returns
                        </label>
                        {editForm.hasFreeReturns && (
                          <input
                            placeholder="Returns Text (e.g. Free Returns)"
                            value={editForm.freeReturnsText}
                            onChange={(e) => setEditForm({ ...editForm, freeReturnsText: e.target.value })}
                            className="admin-input w-full text-xs"
                          />
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editForm.hasInstallmentOptions}
                            onChange={(e) => setEditForm({ ...editForm, hasInstallmentOptions: e.target.checked })}
                            className="w-4 h-4 text-green-500 rounded"
                          />
                          Installment Options
                        </label>
                        {editForm.hasInstallmentOptions && (
                          <input
                            placeholder="Installment Text (e.g. Installment Options)"
                            value={editForm.installmentOptionsText}
                            onChange={(e) => setEditForm({ ...editForm, installmentOptionsText: e.target.value })}
                            className="admin-input w-full text-xs"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        checked={editForm.allowCredit}
                        onChange={(e) => setEditForm({ ...editForm, allowCredit: e.target.checked })}
                        className="w-4 h-4 text-green-500 rounded"
                      />
                      Enable Installments / Credit
                    </label>
                    {editForm.allowCredit && (
                      <div className="grid grid-cols-2 gap-3 pl-6 border-l-2 border-green-200">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Down Payment (Min)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="e.g. 1500"
                            value={editForm.creditMinimum}
                            onChange={(e) => setEditForm({ ...editForm, creditMinimum: e.target.value })}
                            className="admin-input w-full"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Monthly Installment</label>
                          <input
                            placeholder="e.g. 250/month"
                            value={editForm.creditMessage}
                            onChange={(e) => setEditForm({ ...editForm, creditMessage: e.target.value })}
                            className="admin-input w-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
                  <p className="text-sm font-bold text-blue-800 border-b border-blue-200 pb-2">Display Badges</p>
                  <input
                    placeholder="Delivery Text (e.g. Fast Delivery - Lusaka)"
                    value={editForm.deliveryInfo}
                    onChange={(e) => setEditForm({ ...editForm, deliveryInfo: e.target.value })}
                    className="admin-input w-full bg-white"
                  />
                  <input
                    placeholder="Warranty Text (e.g. 1 Year Warranty)"
                    value={editForm.warrantyInfo}
                    onChange={(e) => setEditForm({ ...editForm, warrantyInfo: e.target.value })}
                    className="admin-input w-full bg-white"
                  />
                </div>
              </div>

              {/* Right Column: Media & Specifications */}
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Product Images</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 text-center">
                    <input
                      type="file"
                      id="edit-images"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        const previews = await Promise.all(files.map((f) => compressImage(f, 1800, 0.9)));
                        setEditForm((prev) => ({ ...prev, images: previews }));
                        setEditFiles(files);
                      }}
                    />
                    <label htmlFor="edit-images" className="cursor-pointer">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-2 text-slate-400">
                        <Package className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Click to upload new images</p>
                      <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG (Max 5MB each)</p>
                    </label>

                    {editForm.images.length > 0 && (
                      <div className="mt-6 grid grid-cols-3 gap-3">
                        {editForm.images.map((src, i) => (
                          <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border bg-white shadow-sm">
                            <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                                {i === 0 ? 'Primary' : `Image ${i + 1}`}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-slate-700">Specifications</label>
                    <button
                      onClick={() => setEditForm({ ...editForm, specifications: [...editForm.specifications, { key: "", value: "" }] })}
                      className="text-xs bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-green-600 transition-colors"
                    >
                      + Add New Spec
                    </button>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    {editForm.specifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4 italic">No specifications added yet.</p>
                    ) : (
                      editForm.specifications.map((spec, idx) => (
                        <div key={idx} className="flex gap-2 items-start animate-in fade-in slide-in-from-top-1">
                          <input
                            placeholder="Key (e.g. RAM)"
                            value={spec.key}
                            onChange={(e) => {
                              const newSpecs = [...editForm.specifications];
                              newSpecs[idx].key = e.target.value;
                              setEditForm({ ...editForm, specifications: newSpecs });
                            }}
                            className="admin-input flex-1 text-sm h-10"
                          />
                          <input
                            placeholder="Value (e.g. 8GB)"
                            value={spec.value}
                            onChange={(e) => {
                              const newSpecs = [...editForm.specifications];
                              newSpecs[idx].value = e.target.value;
                              setEditForm({ ...editForm, specifications: newSpecs });
                            }}
                            className="admin-input flex-1 text-sm h-10"
                          />
                          <button
                            onClick={() => setEditForm({ ...editForm, specifications: editForm.specifications.filter((_, i) => i !== idx) })}
                            className="text-slate-400 hover:text-red-500 p-2 transition-colors"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t bg-slate-50 flex justify-end items-center gap-3 shrink-0 rounded-b-xl">
            <button onClick={() => setEditItem(null)} className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Cancel
            </button>
            <button
              onClick={async () => {
                if (!editItem) return;
                try {
                  const id = editItem.id;
                  let res;
                  const formData = new FormData();
                  if (editForm.name) formData.append("name", editForm.name);
                  if (editForm.price) formData.append("price", String(Number(editForm.price)));
                  if (editForm.description) formData.append("description", editForm.description);
                  if (editForm.shortDescription) formData.append("shortDescription", editForm.shortDescription);
                  if (editForm.categorySlug) formData.append("categorySlug", editForm.categorySlug);
                  if (editForm.brandId) formData.append("brandId", String(editForm.brandId));
                  formData.append("isActive", String(editForm.isActive));
                  formData.append("isFeatured", String(editForm.isFeatured));
                  formData.append("isNew", String(editForm.isNew));
                  if (editForm.discountPercentage) formData.append("discountPercentage", String(Number(editForm.discountPercentage)));
                  if (editForm.stockTotal) formData.append("stockTotal", String(Number(editForm.stockTotal)));
                  if (editForm.stockCurrent) formData.append("stockCurrent", String(Number(editForm.stockCurrent)));
                  formData.append("isWholesaleOnly", String(editForm.isWholesaleOnly));
                  formData.append("unitsPerPack", String(Number(editForm.unitsPerPack || 1)));
                  formData.append("wholesaleMoq", String(Number(editForm.wholesaleMoq || 1)));
                  formData.append("hasFiveYearGuarantee", String(editForm.hasFiveYearGuarantee));
                  if (editForm.fiveYearGuaranteeText) formData.append("fiveYearGuaranteeText", editForm.fiveYearGuaranteeText);
                  formData.append("hasFreeReturns", String(editForm.hasFreeReturns));
                  if (editForm.freeReturnsText) formData.append("freeReturnsText", editForm.freeReturnsText);
                  formData.append("hasInstallmentOptions", String(editForm.hasInstallmentOptions));
                  if (editForm.installmentOptionsText) formData.append("installmentOptionsText", editForm.installmentOptionsText);
                  if (editForm.wholesalePrice) formData.append("wholesalePrice", String(Number(editForm.wholesalePrice)));
                  if (editForm.upsellProductId) formData.append("upsellProductId", String(editForm.upsellProductId));
                  formData.append("allowCredit", String(editForm.allowCredit));
                  if (editForm.creditMinimum) formData.append("creditMinimum", String(Number(editForm.creditMinimum)));
                  if (editForm.creditMessage) formData.append("creditMessage", editForm.creditMessage);
                  if (editForm.deliveryInfo) formData.append("deliveryInfo", editForm.deliveryInfo);
                  if (editForm.warrantyInfo) formData.append("warrantyInfo", editForm.warrantyInfo);
                  if (editForm.specifications.length > 0) formData.append("specifications", JSON.stringify(editForm.specifications));

                  if (editFiles.length > 0) {
                    formData.append("replaceImages", "true");
                    for (const f of editFiles) {
                      const recompressed = await compressImage(f, 2000, 0.9);
                      const resp = await fetch(recompressed);
                      const blob = await resp.blob();
                      formData.append("images", new File([blob], f.name.replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg"), { type: "image/jpeg" }));
                    }
                  }

                  res = await fetch(`/internal/admin/products/${id}/upload`, { method: "POST", body: formData });
                  
                  const body = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(body?.error || body?.message || "Failed to update product");
                  
                  // Update wholesale tiers if any
                  await fetch(`/api/admin/wholesale/prices/${id}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(editForm.wholesaleTiers),
                  });

                  setEditItem(null);
                  setEditFiles([]);
                  await load();
                } catch (e: any) {
                  alert(e.message || "Failed to update product");
                }
              }}
              className="bg-green-500 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
