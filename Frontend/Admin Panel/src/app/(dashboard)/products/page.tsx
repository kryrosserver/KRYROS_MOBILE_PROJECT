"use client";

import { useState } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Package,
  Image as ImageIcon
} from "lucide-react";

const products = [
  { 
    id: "1", 
    name: "iPhone 15 Pro Max 256GB", 
    sku: "IPP15PM256", 
    category: "Phones", 
    brand: "Apple",
    price: 25000,
    stock: 45,
    status: "active",
    featured: true
  },
  { 
    id: "2", 
    name: "Samsung Galaxy S24 Ultra", 
    sku: "SGS24ULT", 
    category: "Phones", 
    brand: "Samsung",
    price: 22000,
    stock: 32,
    status: "active",
    featured: true
  },
  { 
    id: "3", 
    name: "MacBook Pro 16-inch M3", 
    sku: "MBP16M3", 
    category: "Laptops", 
    brand: "Apple",
    price: 45000,
    stock: 12,
    status: "active",
    featured: false
  },
  { 
    id: "4", 
    name: "AirPods Pro (2nd Gen)", 
    sku: "APP2GEN", 
    category: "Audio", 
    brand: "Apple",
    price: 3500,
    stock: 156,
    status: "active",
    featured: true
  },
  { 
    id: "5", 
    name: "iPad Pro 12.9-inch", 
    sku: "IPP129", 
    category: "Tablets", 
    brand: "Apple",
    price: 18000,
    stock: 0,
    status: "out_of_stock",
    featured: false
  },
];

const categories = ["All", "Phones", "Laptops", "Tablets", "Audio", "Accessories"];
const brands = ["All", "Apple", "Samsung", "Huawei", "Xiaomi", "Oppo"];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredProducts = products.filter(product => {
    if (selectedCategory !== "All" && product.category !== selectedCategory) return false;
    if (selectedBrand !== "All" && product.brand !== selectedBrand) return false;
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-slate-500">Manage your product inventory</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="admin-input pl-10"
            />
          </div>
          <div className="flex gap-3">
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="admin-select w-40"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select 
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="admin-select w-40"
            >
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="w-16">Image</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Brand</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-slate-400" />
                    </div>
                  </td>
                  <td>
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      {product.featured && (
                        <span className="text-xs text-green-600">Featured</span>
                      )}
                    </div>
                  </td>
                  <td className="font-mono text-sm">{product.sku}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td className="font-medium">K {product.price.toLocaleString()}</td>
                  <td>
                    <span className={product.stock === 0 ? "text-red-500 font-medium" : ""}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      product.status === "active" ? "badge-success" :
                      product.status === "out_of_stock" ? "badge-danger" :
                      "badge-neutral"
                    }`}>
                      {product.status === "active" ? "Active" : 
                       product.status === "out_of_stock" ? "Out of Stock" : "Draft"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <Eye className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg">
                        <Edit className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">Showing {filteredProducts.length} of {products.length} products</p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
              2
            </button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Add New Product</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
                  <input type="text" className="admin-input" placeholder="Enter product name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
                  <input type="text" className="admin-input" placeholder="Product SKU" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select className="admin-select">
                    <option>Select category</option>
                    {categories.filter(c => c !== "All").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Brand</label>
                  <select className="admin-select">
                    <option>Select brand</option>
                    {brands.filter(b => b !== "All").map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Price (K)</label>
                  <input type="number" className="admin-input" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                  <input type="number" className="admin-input" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea className="admin-input" rows={4} placeholder="Product description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Product Images</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-600">Drag and drop images here or click to browse</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
              <button 
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button className="btn-primary">
                Add Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
