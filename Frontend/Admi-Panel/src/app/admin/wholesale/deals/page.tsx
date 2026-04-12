"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Star,
  RefreshCw,
  Plus,
  Trash2,
  Image as ImageIcon,
  Package,
  X,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default function WholesaleDealsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadSections();
  }, [loadSections]);

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
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Wholesale Deals</h1>
            <p className="text-slate-500 text-sm">Manage featured wholesale offers on the storefront</p>
          </div>
        </div>
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
  );
}