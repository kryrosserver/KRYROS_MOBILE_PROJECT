"use client";

import { useState } from "react";
import { Plus, Search, Package, Edit2, Trash2, Database, Layers, MoveRight, History } from "lucide-react";
import { useInvoiceStore, Product } from "@/providers/InvoiceStore";
import { formatPrice } from "@/lib/utils";

export default function InventoryPage() {
  const { products, addProduct } = useInvoiceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({ name: "", price: 0 });

  const handleAdd = () => {
    if (!newProduct.name || newProduct.price <= 0) return;
    addProduct(newProduct);
    setNewProduct({ name: "", price: 0 });
    setShowAdd(false);
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: "Total Items",      value: products.length,                                          color: "var(--text-primary)" },
    { label: "Low Stock",        value: 0,                                                         color: "#F59E0B" },
    { label: "Out of Stock",     value: 0,                                                         color: "#EF4444" },
    { label: "Inventory Value",  value: formatPrice(products.reduce((s, p) => s + p.price, 0)),   color: "#16C784" },
  ];

  return (
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Inventory</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Track and manage your product stock levels
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="admin-card !py-4">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              {s.label}
            </p>
            <p className="text-2xl font-black mt-1.5" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Add Product Form */}
      {showAdd && (
        <div className="admin-card space-y-4">
          <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Add New Product</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Product Name"
              className="admin-input"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            />
            <input
              type="number"
              placeholder="Unit Price"
              className="admin-input"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAdd} className="btn-primary">Save Product</button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="admin-card !p-0 overflow-hidden">
        <div
          className="p-4 flex items-center justify-between gap-4"
          style={{ borderBottom: "1px solid var(--card-border)" }}
        >
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              placeholder="Search products by name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="admin-input pl-10 w-full"
            />
          </div>
          <div className="flex items-center gap-1">
            {[Layers, History].map((Icon, i) => (
              <button
                key={i}
                className="p-2 rounded-lg transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th className="text-center">Stock</th>
                <th className="text-right">Unit Price</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id} className="group">
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ background: "var(--icon-bg)", color: "var(--text-muted)" }}
                        >
                          <Package className="h-5 w-5" />
                        </div>
                        <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                          {p.name}
                        </span>
                      </div>
                    </td>
                    <td className="font-mono text-sm" style={{ color: "var(--text-muted)" }}>
                      #{p.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="text-center">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{ background: "rgba(22,199,132,0.12)", color: "#16C784" }}
                      >
                        In Stock
                      </span>
                    </td>
                    <td className="text-right font-bold" style={{ color: "var(--text-primary)" }}>
                      {formatPrice(p.price)}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {[
                          { Icon: MoveRight, title: "Stock Movement", danger: false },
                          { Icon: Edit2,     title: "Edit",           danger: false },
                          { Icon: Trash2,    title: "Delete",         danger: true  },
                        ].map(({ Icon, title, danger }) => (
                          <button
                            key={title}
                            title={title}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: danger ? "#EF4444" : "var(--text-muted)" }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = danger ? "rgba(239,68,68,0.1)" : "var(--hover-bg)";
                            }}
                            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3" style={{ color: "var(--text-muted)" }}>
                      <Database className="h-12 w-12 opacity-20" />
                      <p className="font-semibold text-sm">No inventory found</p>
                      <button
                        onClick={() => setShowAdd(true)}
                        className="text-sm font-bold underline"
                        style={{ color: "#12D6C5" }}
                      >
                        Add your first product
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
