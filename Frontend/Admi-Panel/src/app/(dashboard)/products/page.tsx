"use client";

import { useEffect, useState } from "react";

type Product = {
  id: string;
  name: string;
  sku: string;
  price: number;
  isActive?: boolean;
  category?: { name: string };
  brand?: { name: string };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products", { cache: "no-store" });
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
        <button onClick={load} className="btn-secondary">Refresh</button>
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
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-4 text-sm text-slate-500">Loading...</div>}
          {!loading && !products.length && !error && <div className="p-4 text-sm text-slate-500">No products yet</div>}
          {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
}
