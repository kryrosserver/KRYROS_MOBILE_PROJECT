"use client";

import { useState } from "react";
import { Printer, Plus, Trash2, Save, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInvoiceStore, LineItem } from "@/providers/InvoiceStore";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";
import { formatPrice } from "@/lib/utils";

export default function NewEstimatePage() {
  const router = useRouter();
  const { companyName, logoDataUrl } = useAdminSettings();
  const { addEstimate } = useInvoiceStore();
  
  const [client, setClient] = useState({ name: "", email: "", address: "" });
  const [items, setItems] = useState<LineItem[]>([{ name: "", qty: 1, price: 0 }]);
  const [estimateNo, setEstimateNo] = useState(`EST-${Date.now().toString().slice(-6)}`);
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("This estimate is valid for 30 days.");

  const subTotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const tax = Math.round(subTotal * 0.16);
  const total = subTotal + tax;

  const handleSave = () => {
    addEstimate({
      number: estimateNo,
      clientId: client.name || "Walk-in Customer",
      items,
      total,
      createdAt: new Date().toISOString(),
      validUntil: validUntil || undefined,
    });
    router.push("/admin/estimate");
  };

  const addItem = () => setItems([...items, { name: "", qty: 1, price: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof LineItem, value: any) => {
    setItems(items.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/estimate" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Estimate</h1>
            <p className="text-slate-500">Provide a quote for your services</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="px-4 py-2 bg-[#1e293b] text-white rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <Save className="h-4 w-4" /> Save Estimate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-8">
        {/* Simplified form for Estimate */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Estimate Details</h3>
            <input 
              placeholder="Estimate No" 
              value={estimateNo} 
              onChange={(e) => setEstimateNo(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
            />
            <input 
              type="date"
              placeholder="Valid Until"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase">Client Info</h3>
            <input 
              placeholder="Client Name" 
              value={client.name} 
              onChange={(e) => setClient({ ...client, name: e.target.value })} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="mt-8">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="py-4 text-xs font-bold text-slate-900 uppercase">Description</th>
                <th className="py-4 text-xs font-bold text-slate-900 uppercase w-24 text-center">Qty</th>
                <th className="py-4 text-xs font-bold text-slate-900 uppercase w-40 text-right">Price</th>
                <th className="py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td className="py-4 pr-4">
                    <input 
                      placeholder="Item name" 
                      value={it.name} 
                      onChange={(e) => updateItem(idx, "name", e.target.value)}
                      className="w-full bg-transparent border-none p-0 text-sm font-medium"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <input 
                      type="number" 
                      value={it.qty} 
                      onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-center"
                    />
                  </td>
                  <td className="py-4 text-right">
                    <input 
                      type="number" 
                      value={it.price} 
                      onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-right"
                    />
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <button onClick={() => removeItem(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addItem} className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-900"><Plus className="h-4 w-4" /> Add Item</button>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200 flex justify-end">
          <div className="w-80 space-y-2">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatPrice(subTotal)}</span></div>
            <div className="flex justify-between text-xl font-bold text-slate-900 pt-2 border-t"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
