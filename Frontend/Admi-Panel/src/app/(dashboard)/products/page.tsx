"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isFlashSale?: boolean;
  flashSaleEnd?: string | null;
  category?: { name: string };
  brand?: { name: string };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "featured" | "flash">("all");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    description: "",
    categorySlug: "general",
    brandSlug: "",
    isFeatured: false,
    isActive: true,
    images: [] as string[],
  });
  const [files, setFiles] = useState<File[]>([]);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    description: "",
    categorySlug: "",
    brandSlug: "",
    isActive: true,
    isFeatured: false,
    images: [] as string[],
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

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/internal/admin/products", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed to load products");
      const items = Array.isArray(body?.products) ? body.products : body?.data || [];
      setProducts(items);
    } catch (e: any) {
      setError(e?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500">Manage your product inventory</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="btn-secondary">Refresh</button>
          {!loading && !products.length && (
            <button
              onClick={async () => {
                const ok = confirm("Seed sample products? This will add a few demo products.");
                if (!ok) return;
                const res = await fetch("/internal/admin/products/seed", { method: "POST" });
                const body = await res.json().catch(() => ({}));
                if (!res.ok) {
                  alert(body?.error || "Failed to seed products");
                } else {
                  await load();
                }
              }}
              className="btn-primary"
            >
              Seed Sample Products
            </button>
          )}
          {tab === "flash" && (
            <button
              onClick={async () => {
                const ok = confirm("Seed flash sale deals on a few products?");
                if (!ok) return;
                const res = await fetch("/internal/admin/products/flash-sales/seed", { method: "POST" });
                const body = await res.json().catch(() => ({}));
                if (!res.ok) {
                  alert(body?.error || "Failed to seed flash sales");
                } else {
                  await load();
                }
              }}
              className="btn-primary"
            >
              Seed Flash Sales
            </button>
          )}
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
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="admin-input w-full"
              />
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="admin-input w-full h-24"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Category (slug)"
                  value={form.categorySlug}
                  onChange={(e) => setForm({ ...form, categorySlug: e.target.value })}
                  className="admin-input w-full"
                />
                <input
                  placeholder="Brand (slug)"
                  value={form.brandSlug}
                  onChange={(e) => setForm({ ...form, brandSlug: e.target.value })}
                  className="admin-input w-full"
                />
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
                      if (files.length > 0) {
                        const formData = new FormData();
                        formData.append("name", form.name);
                        formData.append("sku", form.sku);
                        formData.append("price", String(Number(form.price)));
                        formData.append("description", form.description);
                        formData.append("categorySlug", form.categorySlug || "general");
                        if (form.brandSlug) formData.append("brandSlug", form.brandSlug);
                        formData.append("isActive", String(form.isActive));
                        formData.append("isFeatured", String(form.isFeatured));
                        // Recompress large files to blobs if needed for better size/quality tradeoff
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
                        res = await fetch("/internal/admin/products/upload", {
                          method: "POST",
                          body: formData,
                        });
                        if (res.status === 404) {
                          const fallbackPayload = {
                            name: form.name,
                            sku: form.sku,
                            price: Number(form.price),
                            description: form.description,
                            categorySlug: form.categorySlug || "general",
                            brandSlug: form.brandSlug || undefined,
                            isActive: form.isActive,
                            isFeatured: form.isFeatured,
                            imageDataUrls: form.images,
                          };
                          res = await fetch("/internal/admin/products", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(fallbackPayload),
                          });
                        }
                      } else {
                        const payload = {
                          name: form.name,
                          sku: form.sku,
                          price: Number(form.price),
                          description: form.description,
                          categorySlug: form.categorySlug || "general",
                          brandSlug: form.brandSlug || undefined,
                          isActive: form.isActive,
                          isFeatured: form.isFeatured,
                          imageDataUrls: form.images,
                        };
                        res = await fetch("/internal/admin/products", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                      }
                      const body = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(body?.error || "Failed to create product");
                      setShowCreate(false);
                      setForm({
                        name: "",
                        sku: "",
                        price: "",
                        description: "",
                        categorySlug: "general",
                        brandSlug: "",
                        isFeatured: false,
                        isActive: true,
                        images: [],
                      });
                      setFiles([]);
                      await load();
                    } catch (e) {
                      alert(e instanceof Error ? e.message : "Failed to create product");
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
      </div>

      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Status</th>
                {tab !== "flash" && <th>Featured</th>}
                {tab !== "featured" && <th>Flash Sale</th>}
                {tab === "flash" && <th>Flash Price</th>}
                {tab === "flash" && <th>Flash Ends</th>}
                <th className="text-right">Save</th>
              </tr>
            </thead>
            <tbody>
              {(tab === "featured" ? products.filter(p => !!p.isFeatured) : tab === "flash" ? products : products).map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-slate-900">{p.name}</td>
                  <td className="font-mono text-sm">{p.sku}</td>
                  <td>{p.category?.name || "—"}</td>
                  <td>{p.brand?.name || "—"}</td>
                  <td>K {Number(p.price).toLocaleString()}</td>
                  <td><span className={`badge ${p.isActive !== false ? "badge-success" : "badge-danger"}`}>{p.isActive !== false ? "Active" : "Inactive"}</span></td>
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
                      onClick={() => {
                        setEditItem(p);
                        setEditForm({
                          name: p.name,
                          price: String(p.price ?? ""),
                          description: "",
                          categorySlug: "",
                          brandSlug: "",
                          isActive: p.isActive !== false,
                          isFeatured: !!p.isFeatured,
                          images: [],
                        });
                        setEditFiles([]);
                      }}
                      className="btn-secondary"
                    >
                      Edit
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
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Edit Product</h3>
            <button onClick={() => setEditItem(null)} className="btn-secondary">Close</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <input
                placeholder="Product name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="admin-input w-full"
              />
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Price"
                value={editForm.price}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                className="admin-input w-full"
              />
              <textarea
                placeholder="Description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="admin-input w-full h-24"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Category (slug)"
                  value={editForm.categorySlug}
                  onChange={(e) => setEditForm({ ...editForm, categorySlug: e.target.value })}
                  className="admin-input w-full"
                />
                <input
                  placeholder="Brand (slug)"
                  value={editForm.brandSlug}
                  onChange={(e) => setEditForm({ ...editForm, brandSlug: e.target.value })}
                  className="admin-input w-full"
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editForm.isFeatured}
                    onChange={(e) => setEditForm({ ...editForm, isFeatured: e.target.checked })}
                  />
                  Featured
                </label>
              </div>
            </div>
            <div>
              <div className="border rounded-lg p-4 bg-slate-50">
                <p className="text-sm font-medium text-slate-700">Images</p>
                <p className="text-xs text-slate-500 mb-2">Upload new images to replace or add.</p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    const previews = await Promise.all(files.map((f) => compressImage(f, 1800, 0.9)));
                    setEditForm((prev) => ({ ...prev, images: previews }));
                    setEditFiles(files);
                  }}
                />
                {editForm.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {editForm.images.map((src, i) => (
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
                  onClick={async () => {
                    if (!editItem) return;
                    try {
                      const id = editItem.id;
                      let res;
                      if (editFiles.length > 0) {
                        const formData = new FormData();
                        if (editForm.name) formData.append("name", editForm.name);
                        if (editForm.price) formData.append("price", String(Number(editForm.price)));
                        if (editForm.description) formData.append("description", editForm.description);
                        if (editForm.categorySlug) formData.append("categorySlug", editForm.categorySlug);
                        if (editForm.brandSlug) formData.append("brandSlug", editForm.brandSlug);
                        formData.append("isActive", String(editForm.isActive));
                        formData.append("isFeatured", String(editForm.isFeatured));
                        formData.append("replaceImages", "true");
                        for (const f of editFiles) {
                          const recompressed = await compressImage(f, 2000, 0.9);
                          const resp = await fetch(recompressed);
                          const blob = await resp.blob();
                          formData.append("images", new File([blob], f.name.replace(/\.(png|jpg|jpeg|webp)$/i, ".jpg"), { type: "image/jpeg" }));
                        }
                        res = await fetch(`/internal/admin/products/${id}/upload`, { method: "POST", body: formData });
                        if (res.status === 404) {
                          const fallbackPayload: any = {
                            ...(editForm.name ? { name: editForm.name } : {}),
                            ...(editForm.price ? { price: Number(editForm.price) } : {}),
                            ...(editForm.description ? { description: editForm.description } : {}),
                            ...(editForm.categorySlug ? { categorySlug: editForm.categorySlug } : {}),
                            ...(editForm.brandSlug ? { brandSlug: editForm.brandSlug } : {}),
                            isActive: editForm.isActive,
                            isFeatured: editForm.isFeatured,
                            ...(editForm.images.length ? { imageDataUrls: editForm.images, replaceImages: true } : {}),
                          };
                          res = await fetch(`/internal/admin/products/${id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(fallbackPayload),
                          });
                        }
                      } else {
                        const payload: any = {
                          ...(editForm.name ? { name: editForm.name } : {}),
                          ...(editForm.price ? { price: Number(editForm.price) } : {}),
                          ...(editForm.description ? { description: editForm.description } : {}),
                          ...(editForm.categorySlug ? { categorySlug: editForm.categorySlug } : {}),
                          ...(editForm.brandSlug ? { brandSlug: editForm.brandSlug } : {}),
                          isActive: editForm.isActive,
                          isFeatured: editForm.isFeatured,
                          ...(editForm.images.length ? { imageDataUrls: editForm.images, replaceImages: true } : {}),
                        };
                        res = await fetch(`/internal/admin/products/${id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                      }
                      const body = await res.json().catch(() => ({}));
                      if (!res.ok) throw new Error(body?.error || "Failed to update product");
                      setEditItem(null);
                      setEditFiles([]);
                      await load();
                    } catch (e) {
                      alert(e instanceof Error ? e.message : "Failed to update product");
                    }
                  }}
                  className="btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
