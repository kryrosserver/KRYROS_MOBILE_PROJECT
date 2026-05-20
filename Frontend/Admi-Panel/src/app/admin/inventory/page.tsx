"use client";

import { useState } from "react";
import { Plus, Search, Package, MoreVertical, Edit2, Trash2, Database, Layers, MoveRight, History } from "lucide-react";
import { useInvoiceStore, Product } from "@/providers/InvoiceStore";
import { formatPrice } from "@/lib/utils";

export default function InventoryPage() {
  const { products, addProduct } = useInvoiceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, "id">>({ name: "", price: 0 });

  const handleAdd = () => {
    if (!newProduct.name || newProduct.price <= 0) return;
    addProduct(newProduct);
    setNewProduct({ name: "", price: 0 });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          <p className="text-slate-500">Track and manage your product stock levels</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAdd(true)}
            className="bg-[#1e293b] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: products.length, color: "text-slate-900" },
          { label: "Low Stock", value: 0, color: "text-orange-600" },
          { label: "Out of Stock", value: 0, color: "text-red-600" },
          { label: "Inventory Value", value: products.reduce((s, p) => s + p.price, 0), color: "text-green-600", isPrice: true },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${stat.color}`}>
              {stat.isPrice ? formatPrice(stat.value) : stat.value}
            </p>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Add New Product</h3>
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
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
            <button onClick={handleAdd} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold">Save Product</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search products by name or SKU..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><Layers className="h-4 w-4" /></button>
            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"><History className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Stock</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Unit Price</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                          <Package className="h-5 w-5" />
                        </div>
                        <span className="font-medium text-slate-900">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-sm uppercase">#{p.id.slice(0, 8)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Stock
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">{formatPrice(p.price)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="Stock Movement"><MoveRight className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" title="Edit"><Edit2 className="h-4 w-4" /></button>
                        <button className="p-2 hover:bg-red-50 rounded-lg text-red-500" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Database className="h-12 w-12 text-slate-200" />
                      <p>No inventory found. Add your first product!</p>
                      <button 
                        onClick={() => setShowAdd(true)}
                        className="text-slate-900 font-bold underline mt-2"
                      >
                        Add Product
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
