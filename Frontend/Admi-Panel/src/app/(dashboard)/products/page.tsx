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
        </div>
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
                <th>Featured</th>
                <th>Flash Sale</th>
                <th>Flash Price</th>
                <th>Flash Ends</th>
                <th className="text-right">Save</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-slate-900">{p.name}</td>
                  <td className="font-mono text-sm">{p.sku}</td>
                  <td>{p.category?.name || "—"}</td>
                  <td>{p.brand?.name || "—"}</td>
                  <td>K {Number(p.price).toLocaleString()}</td>
                  <td><span className={`badge ${p.isActive !== false ? "badge-success" : "badge-danger"}`}>{p.isActive !== false ? "Active" : "Inactive"}</span></td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!p.isFeatured}
                      onChange={(e) => {
                        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isFeatured: e.target.checked } : x));
                      }}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={!!p.isFlashSale}
                      onChange={(e) => {
                        setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isFlashSale: e.target.checked } : x));
                      }}
                    />
                  </td>
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
                  <td className="text-right">
                    <button
                      disabled={savingId === p.id}
                      onClick={async () => {
                        try {
                          setSavingId(p.id);
                          const payload: any = {
                            isFeatured: !!p.isFeatured,
                            isFlashSale: !!p.isFlashSale,
                            flashSaleEnd: p.flashSaleEnd,
                          };
                          if ((p as any).flashSalePrice !== undefined) {
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
  );
}
