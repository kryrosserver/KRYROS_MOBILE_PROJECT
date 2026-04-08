"use client";

import { useEffect, useState, useCallback } from "react";
import { API_BASE } from "@/lib/config";
import { formatPrice } from "@/lib/utils";
import { X, Package, Image as ImageIcon, PlusCircle, Search, RefreshCw, Plus } from "lucide-react";

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
  isWholesaleOnly?: boolean;
  allowCredit?: boolean;
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
  const [tab, setTab] = useState<"all" | "featured" | "flash">("all");
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
    isFlashSale: false,
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
    upsellProductId: "",
    isActive: true,
    deliveryInfo: "",
    warrantyInfo: "",
    flashSalePrice: "",
    flashSaleEnd: "",
    images: [] as string[],
    specifications: [] as { key: string; value: string }[],
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
    isFlashSale: false,
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
    upsellProductId: "",
    deliveryInfo: "",
    warrantyInfo: "",
    flashSalePrice: "",
    flashSaleEnd: "",
    images: [] as string[],
    specifications: [] as { key: string; value: string }[],
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
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500 text-sm hidden sm:block">Manage your product inventory</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input h-10 sm:w-48 md:w-64 pl-10"
            />
          </div>
          <button onClick={() => load(searchTerm)} className="btn-secondary min-h-[40px] md:min-h-[44px] px-4 py-2 flex items-center justify-center gap-2">
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button 
            onClick={() => {
              setForm({
                ...form,
                isFeatured: tab === "featured",
                isFlashSale: tab === "flash",
              } as any);
              setShowCreate(true);
            }} 
            className="btn-primary min-h-[40px] md:min-h-[44px] px-4 py-2 flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add {tab === "featured" ? "Featured" : tab === "flash" ? "Flash Sale" : "Product"}</span>
          </button>
        </div>
      </div>

      {/* Tab Buttons - Touch Friendly */}
      <div className="admin-card p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors min-h-[44px] ${tab === "all" ? "bg-green-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
        >
          All Products
        </button>
        <button
          onClick={() => setTab("featured")}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors min-h-[44px] ${tab === "featured" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
        >
          Featured
        </button>
        <button
          onClick={() => setTab("flash")}
          className={`px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-colors min-h-[44px] ${tab === "flash" ? "bg-red-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
        >
          Flash Sales
        </button>
      </div>

      {/* Mobile Card View for small screens */}
      <div className="lg:hidden space-y-3">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
              <div className="flex gap-3 mb-3">
                <div className="h-16 w-16 bg-slate-100 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          (tab === "featured" ? products.filter(p => !!p.isFeatured) : 
          tab === "flash" ? products.filter(p => !!(p as any).isFlashSale) : 
          products.filter(p => !p.isWholesaleOnly && !p.allowCredit)).map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex gap-3 mb-3">
                <div className="h-16 w-16 rounded-lg overflow-hidden border bg-slate-50 shrink-0">
                  {p.images && p.images[0] ? (
                    <img src={typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">No image</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-slate-900 truncate">{p.name}</h3>
                  <p className="text-xs text-slate-500">{p.sku}</p>
                  <p className="text-lg font-bold text-slate-900 mt-1">{formatPrice(Number(p.price))}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.isActive !== false ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                  {p.isActive !== false ? "Active" : "Inactive"}
                </span>
                {p.isFeatured && <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Featured</span>}
                {(p as any).isFlashSale && <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Flash Sale</span>}
                {p.category?.name && <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">{p.category.name}</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
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
                      isFlashSale: !!(p as any).isFlashSale,
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
                      upsellProductId: String(p.productRelations?.[0]?.relatedId ?? ""),
                      deliveryInfo: p.deliveryInfo || "",
                      warrantyInfo: p.warrantyInfo || "",
                      flashSalePrice: String((p as any).flashSalePrice ?? ""),
                      flashSaleEnd: p.flashSaleEnd ? new Date(p.flashSaleEnd).toISOString().slice(0,16) : "",
                      specifications: typeof (p as any).specifications === 'string' ? JSON.parse((p as any).specifications) : (Array.isArray((p as any).specifications) ? (p as any).specifications : []),
                      images: Array.isArray(p.images) ? p.images.map((img: any) => img.url) : [],
                    } as any);
                    setEditFiles([]);
                  }}
                  className="flex-1 px-4 py-2.5 min-h-[44px] bg-slate-900 text-white text-sm rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    const ok = confirm(`Delete product "${p.name}"?`);
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
                  className="px-4 py-2.5 min-h-[44px] bg-red-100 text-red-600 text-sm rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
        {!loading && !products.length && !error && (
          <div className="text-center py-12 text-slate-500">No products found.</div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                {tab !== "flash" && <th className="px-4 py-3">Featured</th>}
                {tab !== "featured" && <th className="px-4 py-3">Flash Sale</th>}
                {tab === "flash" && <th className="px-4 py-3">Flash Price</th>}
                {tab === "flash" && <th className="px-4 py-3">Flash Ends</th>}
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-10 w-10 bg-slate-100 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-3/4"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-1/2"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-1/2"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-1/3"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-1/4"></div></td>
                    <td className="px-4 py-3"><div className="h-6 bg-slate-100 rounded-full w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-4"></div></td>
                    <td className="px-4 py-3 text-right"><div className="h-8 bg-slate-100 rounded-lg w-20 ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                (tab === "featured" ? products.filter(p => !!p.isFeatured) : 
                tab === "flash" ? products.filter(p => !!(p as any).isFlashSale) : 
                products.filter(p => !p.isWholesaleOnly && !p.allowCredit)).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="h-12 w-12 rounded-lg overflow-hidden border bg-slate-50">
                        {p.images && p.images[0] ? (
                          <img src={typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url} alt={p.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">No image</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-[200px] truncate">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-sm">{p.sku}</td>
                    <td className="px-4 py-3">{p.category?.name || "—"}</td>
                    <td className="px-4 py-3">{p.brand?.name || "—"}</td>
                    <td className="px-4 py-3">{formatPrice(Number(p.price))}</td>
                    <td className="px-4 py-3"><span className={`badge ${p.isActive !== false ? "badge-success" : "badge-danger"}`}>{p.isActive !== false ? "Active" : "Inactive"}</span></td>
                    {tab !== "flash" && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!p.isFeatured}
                        onChange={(e) => {
                          setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isFeatured: e.target.checked } : x));
                        }}
                        className="w-5 h-5 rounded cursor-pointer"
                      />
                    </td>
                    )}
                    {tab !== "featured" && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={!!p.isFlashSale}
                        onChange={(e) => {
                          setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isFlashSale: e.target.checked } : x));
                        }}
                        className="w-5 h-5 rounded cursor-pointer"
                      />
                    </td>
                    )}
                    {tab === "flash" && (
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3">
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
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
                              isFlashSale: !!(p as any).isFlashSale,
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
                              upsellProductId: String(p.productRelations?.[0]?.relatedId ?? ""),
                              deliveryInfo: p.deliveryInfo || "",
                              warrantyInfo: p.warrantyInfo || "",
                              flashSalePrice: String((p as any).flashSalePrice ?? ""),
                              flashSaleEnd: p.flashSaleEnd ? new Date(p.flashSaleEnd).toISOString().slice(0,16) : "",
                              specifications: typeof (p as any).specifications === 'string' ? JSON.parse((p as any).specifications) : (Array.isArray((p as any).specifications) ? (p as any).specifications : []),
                              images: Array.isArray(p.images) ? p.images.map((img: any) => img.url) : [],
                            } as any);
                            setEditFiles([]);
                          }}
                          className="btn-secondary px-4 py-2.5 min-h-[44px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={async () => {
                            const ok = confirm(`Delete product "${p.name}"?`);
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
                          className="btn-danger px-4 py-2.5 min-h-[44px]"
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
                          className="btn-primary px-4 py-2.5 min-h-[44px]"
                        >
                          {savingId === p.id ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {loading && <div className="p-4 text-sm text-slate-500">Loading...</div>}
          {!loading && !products.length && !error && (
            <div className="p-4 text-sm text-slate-500">
              No products found.
            </div>
          )}
          {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </div>

    {/* Create Product Modal */}
    {showCreate && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b shrink-0">
            <h3 className="text-lg md:text-xl font-bold text-slate-900">Add New Product</h3>
            <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100">
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Left Column: Basic Information */}
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
                  <input
                    placeholder="Product name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="admin-input w-full min-h-[44px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Retail Price (USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Retail Price"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className="admin-input w-full min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand</label>
                    <select
                      value={form.brandId}
                      onChange={(e) => setForm({ ...form, brandId: e.target.value })}
                      className="admin-input w-full min-h-[44px]"
                    >
                      <option value="">Select Brand</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <select
                    value={form.categorySlug}
                    onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                    className="admin-input w-full min-h-[44px]"
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
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="admin-input w-full h-24 resize-none"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                  <p className="text-sm font-bold text-slate-800 border-b pb-2">Product Status</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="w-5 h-5 text-green-500 rounded"
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                        className="w-5 h-5 text-green-500 rounded"
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFlashSale}
                        onChange={(e) => setForm({ ...form, isFlashSale: e.target.checked })}
                        className="w-5 h-5 text-green-500 rounded"
                      />
                      Flash Sale
                    </label>
                  </div>
                  
                  {(form.isFlashSale) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Flash Sale Price</label>
                        <input
                          type="number"
                          placeholder="Flash Price"
                          value={form.flashSalePrice}
                          onChange={(e) => setForm({ ...form, flashSalePrice: e.target.value })}
                          className="admin-input w-full min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ends At</label>
                        <input
                          type="datetime-local"
                          value={form.flashSaleEnd}
                          onChange={(e) => setForm({ ...form, flashSaleEnd: e.target.value })}
                          className="admin-input w-full min-h-[44px]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Stock</label>
                      <input
                        type="number"
                        placeholder="Total"
                        value={form.stockTotal}
                        onChange={(e) => setForm({ ...form, stockTotal: e.target.value })}
                        className="admin-input w-full min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Stock</label>
                      <input
                        type="number"
                        placeholder="Current"
                        value={form.stockCurrent}
                        onChange={(e) => setForm({ ...form, stockCurrent: e.target.value })}
                        className="admin-input w-full min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Media & Specifications */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Product Images</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 md:p-6 bg-slate-50 text-center relative">
                    <input
                      type="file"
                      id="create-images"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const newFiles = Array.from(e.target.files || []);
                        const previews = await Promise.all(newFiles.map((f) => compressImage(f, 1800, 0.9)));
                        setForm((prev) => ({ ...prev, images: [...prev.images, ...previews] }));
                        setFiles((prev) => [...prev, ...newFiles]);
                      }}
                    />
                    <label htmlFor="create-images" className="cursor-pointer">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-2 text-slate-400">
                        <Package className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Click to upload images</p>
                      <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
                    </label>

                    {form.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {form.images.map((src, i) => (
                          <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border bg-white shadow-sm">
                            <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => {
                                setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
                                setFiles(prev => prev.filter((_, idx) => idx !== i));
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-bold text-center py-0.5">
                              {i === 0 ? 'PRIMARY' : `IMAGE ${i + 1}`}
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
                      onClick={() => setForm({ ...form, specifications: [...form.specifications, { key: "", value: "" }] })}
                      className="text-xs bg-green-500 text-white px-3 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors min-h-[44px]"
                    >
                      + Add Spec
                    </button>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    {form.specifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4 italic">No specifications.</p>
                    ) : (
                      form.specifications.map((spec, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center animate-in fade-in slide-in-from-top-1">
                          <input
                            placeholder="Key (e.g. RAM)"
                            value={spec.key}
                            onChange={(e) => {
                              const newSpecs = [...form.specifications];
                              newSpecs[idx].key = e.target.value;
                              setForm({ ...form, specifications: newSpecs });
                            }}
                            className="admin-input flex-1 text-sm min-h-[44px]"
                          />
                          <input
                            placeholder="Value (e.g. 8GB)"
                            value={spec.value}
                            onChange={(e) => {
                              const newSpecs = [...form.specifications];
                              newSpecs[idx].value = e.target.value;
                              setForm({ ...form, specifications: newSpecs });
                            }}
                            className="admin-input flex-1 text-sm min-h-[44px]"
                          />
                          <button
                            onClick={() => setForm({ ...form, specifications: form.specifications.filter((_, i) => i !== idx) })}
                            className="text-slate-400 hover:text-red-500 p-2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-red-50"
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

          <div className="p-4 md:p-6 border-t bg-slate-50 flex flex-col sm:flex-row justify-end items-center gap-3 shrink-0 rounded-b-xl">
            <button onClick={() => setShowCreate(false)} className="w-full sm:w-auto px-6 py-3 min-h-[44px] text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
              Cancel
            </button>
            <button
              disabled={creating}
              onClick={async () => {
                if (creating) return;
                setCreating(true);
                try {
                  const formData = new FormData();
                  Object.keys(form).forEach(key => {
                    if (key === 'images') return;
                    if (key === 'specifications') {
                      formData.append(key, JSON.stringify(form.specifications));
                      return;
                    }
                    formData.append(key, (form as any)[key]);
                  });
                  
                  // Retail focus
                  formData.append("isWholesaleOnly", "false");
                  formData.append("allowCredit", "false");

                  for (const f of files) {
                    const recompressed = await compressImage(f, 2000, 0.9);
                    const resp = await fetch(recompressed);
                    const blob = await resp.blob();
                    formData.append("images", new File([blob], f.name, { type: "image/jpeg" }));
                  }

                  const res = await fetch("/api/admin/products", { method: "POST", body: formData });
                  const body = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(body?.error || "Failed to create product");
                  
                  setShowCreate(false);
                  setFiles([]);
                  setForm({
                    name: "",
                    sku: "",
                    price: "",
                    description: "",
                    shortDescription: "",
                    categorySlug: "",
                    brandId: "" as string | number,
                    isFeatured: false,
                    isFlashSale: false,
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
                    upsellProductId: "",
                    isActive: true,
                    deliveryInfo: "",
                    warrantyInfo: "",
                    flashSalePrice: "",
                    flashSaleEnd: "",
                    images: [] as string[],
                    specifications: [] as { key: string; value: string }[],
                  } as any);
                  await load();
                } catch (e: any) {
                  alert(e.message || "Failed to create product");
                } finally {
                  setCreating(false);
                }
              }}
              className="w-full sm:w-auto bg-green-500 text-white px-8 py-3 min-h-[44px] rounded-lg font-bold hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all"
            >
              {creating ? "Adding..." : "Add Product"}
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Edit Product Modal - Responsive */}
    {editItem && (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between p-4 md:p-6 border-b shrink-0">
            <h3 className="text-lg md:text-xl font-bold text-slate-900">Edit Product</h3>
            <button onClick={() => setEditItem(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-slate-100">
              <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* Left Column: Basic Information */}
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Product Name</label>
                  <input
                    placeholder="Product name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="admin-input w-full min-h-[44px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Retail Price (USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Retail Price"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      className="admin-input w-full min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Brand</label>
                    <select
                      value={editForm.brandId}
                      onChange={(e) => setEditForm({ ...editForm, brandId: e.target.value })}
                      className="admin-input w-full min-h-[44px]"
                    >
                      <option value="">Select Brand</option>
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
                    className="admin-input w-full min-h-[44px]"
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
                    className="admin-input w-full h-24 resize-none"
                  />
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                  <p className="text-sm font-bold text-slate-800 border-b pb-2">Product Status</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                        className="w-5 h-5 text-green-500 rounded"
                      />
                      Active
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isFeatured}
                        onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                        className="w-5 h-5 text-green-500 rounded"
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editForm.isFlashSale}
                        onChange={(e) => setEditForm({ ...editForm, isFlashSale: e.target.checked })}
                        className="w-5 h-5 text-green-500 rounded"
                      />
                      Flash Sale
                    </label>
                  </div>
                  
                  {editForm.isFlashSale && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Flash Sale Price</label>
                        <input
                          type="number"
                          placeholder="Flash Price"
                          value={editForm.flashSalePrice}
                          onChange={(e) => setEditForm({ ...editForm, flashSalePrice: e.target.value })}
                          className="admin-input w-full min-h-[44px]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Ends At</label>
                        <input
                          type="datetime-local"
                          value={editForm.flashSaleEnd}
                          onChange={(e) => setEditForm({ ...editForm, flashSaleEnd: e.target.value })}
                          className="admin-input w-full min-h-[44px]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-2 border-t border-slate-200">
                    <p className="text-sm font-bold text-slate-800">Guarantee & Details</p>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
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
                          className="admin-input w-full text-xs min-h-[36px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
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
                          className="admin-input w-full text-xs min-h-[36px]"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
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
                          className="admin-input w-full text-xs min-h-[36px]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Total Stock</label>
                      <input
                        type="number"
                        placeholder="Total"
                        value={editForm.stockTotal}
                        onChange={(e) => setEditForm({ ...editForm, stockTotal: e.target.value })}
                        className="admin-input w-full min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Stock</label>
                      <input
                        type="number"
                        placeholder="Current"
                        value={editForm.stockCurrent}
                        onChange={(e) => setEditForm({ ...editForm, stockCurrent: e.target.value })}
                        className="admin-input w-full min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Media & Specifications */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">Product Images</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 md:p-6 bg-slate-50 text-center relative">
                    <input
                      type="file"
                      id="edit-images"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const newFiles = Array.from(e.target.files || []);
                        const previews = await Promise.all(newFiles.map((f) => compressImage(f, 1800, 0.9)));
                        setEditForm((prev) => ({ ...prev, images: [...prev.images, ...previews] }));
                        setEditFiles((prev) => [...prev, ...newFiles]);
                      }}
                    />
                    <label htmlFor="edit-images" className="cursor-pointer">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm mb-2 text-slate-400">
                        <Package className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Click to upload images</p>
                      <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG</p>
                    </label>

                    {editForm.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {editForm.images.map((src, i) => (
                          <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border bg-white shadow-sm">
                            <img src={src} alt={`Image ${i + 1}`} className="w-full h-full object-cover" />
                            <button
                              onClick={() => {
                                setEditForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
                                setEditFiles(prev => prev.filter((_, idx) => idx !== i));
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-bold text-center py-0.5">
                              {i === 0 ? 'PRIMARY' : `IMAGE ${i + 1}`}
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
                      className="text-xs bg-green-500 text-white px-3 py-2 rounded-lg font-bold hover:bg-green-600 transition-colors min-h-[44px]"
                    >
                      + Add Spec
                    </button>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                    {editForm.specifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4 italic">No specifications.</p>
                    ) : (
                      editForm.specifications.map((spec, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center animate-in fade-in slide-in-from-top-1">
                          <input
                            placeholder="Key (e.g. RAM)"
                            value={spec.key}
                            onChange={(e) => {
                              const newSpecs = [...editForm.specifications];
                              newSpecs[idx].key = e.target.value;
                              setEditForm({ ...editForm, specifications: newSpecs });
                            }}
                            className="admin-input flex-1 text-sm min-h-[44px]"
                          />
                          <input
                            placeholder="Value (e.g. 8GB)"
                            value={spec.value}
                            onChange={(e) => {
                              const newSpecs = [...editForm.specifications];
                              newSpecs[idx].value = e.target.value;
                              setEditForm({ ...editForm, specifications: newSpecs });
                            }}
                            className="admin-input flex-1 text-sm min-h-[44px]"
                          />
                          <button
                            onClick={() => setEditForm({ ...editForm, specifications: editForm.specifications.filter((_, i) => i !== idx) })}
                            className="text-slate-400 hover:text-red-500 p-2 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-red-50"
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

          <div className="p-4 md:p-6 border-t bg-slate-50 flex flex-col sm:flex-row justify-end items-center gap-3 shrink-0 rounded-b-xl">
            <button onClick={() => setEditItem(null)} className="w-full sm:w-auto px-6 py-3 min-h-[44px] text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
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
                  formData.append("isFlashSale", String(editForm.isFlashSale));

                  // STRICT RETAIL FLAGS - Dedicated Page Upload
                  formData.append("isWholesaleOnly", "false");
                  formData.append("allowCredit", "false");

                  formData.append("isNew", String(editForm.isNew));
                  if (editForm.discountPercentage) formData.append("discountPercentage", String(Number(editForm.discountPercentage)));
                  if (editForm.stockTotal) formData.append("stockTotal", String(Number(editForm.stockTotal)));
                  if (editForm.stockCurrent) formData.append("stockCurrent", String(Number(editForm.stockCurrent)));
                  if (editForm.flashSalePrice) formData.append("flashSalePrice", String(Number(editForm.flashSalePrice)));
                  if (editForm.flashSaleEnd) formData.append("flashSaleEnd", editForm.flashSaleEnd);
                  formData.append("hasFiveYearGuarantee", String(editForm.hasFiveYearGuarantee));
                  if (editForm.fiveYearGuaranteeText) formData.append("fiveYearGuaranteeText", editForm.fiveYearGuaranteeText);
                  formData.append("hasFreeReturns", String(editForm.hasFreeReturns));
                  if (editForm.freeReturnsText) formData.append("freeReturnsText", editForm.freeReturnsText);
                  formData.append("hasInstallmentOptions", String(editForm.hasInstallmentOptions));
                  if (editForm.installmentOptionsText) formData.append("installmentOptionsText", editForm.installmentOptionsText);
                  if (editForm.upsellProductId) formData.append("upsellProductId", String(editForm.upsellProductId));
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
                  
                  setEditItem(null);
                  setEditFiles([]);
                  await load();
                } catch (e: any) {
                  alert(e.message || "Failed to update product");
                }
              }}
              className="w-full sm:w-auto bg-green-500 text-white px-8 py-3 min-h-[44px] rounded-lg font-bold hover:bg-green-600 shadow-lg shadow-green-500/20 transition-all"
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
