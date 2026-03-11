"use client";

import { useState } from "react";
import { Printer, Plus, Trash2, Save, ChevronLeft, UserPlus, PackagePlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInvoiceStore, LineItem } from "@/providers/InvoiceStore";
import { formatPrice } from "@/lib/utils";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";

export default function NewInvoicePage() {
  const router = useRouter();
  const { companyName, logoDataUrl } = useAdminSettings();
  const { addInvoice, clients, products } = useInvoiceStore();
  
  const [client, setClient] = useState({ name: "", email: "", address: "" });
  const [items, setItems] = useState<LineItem[]>([{ name: "", qty: 1, price: 0 }]);
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("Thank you for your business!");

  const subTotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const tax = Math.round(subTotal * 0.16);
  const total = subTotal + tax;

  const handleSave = () => {
    addInvoice({
      number: invoiceNo,
      clientId: client.name || "Walk-in Customer",
      items,
      notes,
      total,
      createdAt: new Date().toISOString(),
      dueDate: dueDate || undefined,
    });
    router.push("/admin/invoice");
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
          <Link href="/admin/invoice" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">New Invoice</h1>
            <p className="text-slate-500">Create a professional invoice for your client</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => window.print()} className="px-4 py-2 border border-slate-200 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors">
            <Printer className="h-4 w-4" /> Print
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-[#1e293b] text-white rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
            <Save className="h-4 w-4" /> Save Invoice
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Invoice Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center">
              {logoDataUrl ? (
                <img src={logoDataUrl} alt="logo" className="h-full w-full object-cover" />
              ) : (
                <span className="text-white font-bold text-2xl">{(companyName || "K")[0]}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{companyName || "KRYROS MOBILE"}</h2>
              <p className="text-sm text-slate-500">Business Invoice</p>
            </div>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Invoice No:</span>
              <input 
                value={invoiceNo} 
                onChange={(e) => setInvoiceNo(e.target.value)} 
                className="bg-white border border-slate-200 rounded-lg px-3 py-1 text-sm font-bold w-32 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500">Date:</span>
              <span className="text-sm font-semibold">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Billing Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Bill To</h3>
              <button className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:underline">
                <UserPlus className="h-3 w-3" /> Select Client
              </button>
            </div>
            <div className="space-y-3">
              <input 
                placeholder="Client Name" 
                value={client.name} 
                onChange={(e) => setClient({ ...client, name: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <input 
                placeholder="Email Address" 
                value={client.email} 
                onChange={(e) => setClient({ ...client, email: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
              <textarea 
                placeholder="Billing Address" 
                value={client.address} 
                onChange={(e) => setClient({ ...client, address: e.target.value })} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          {/* Dates & More */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Payment Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Payment Status</label>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
                  <option>Unpaid</option>
                  <option>Partially Paid</option>
                  <option>Paid</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="px-8 pb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 text-xs font-bold text-slate-900 uppercase tracking-wider">Item Description</th>
                  <th className="py-4 text-xs font-bold text-slate-900 uppercase tracking-wider w-24">Qty</th>
                  <th className="py-4 text-xs font-bold text-slate-900 uppercase tracking-wider w-40">Price</th>
                  <th className="py-4 text-xs font-bold text-slate-900 uppercase tracking-wider w-40 text-right">Total</th>
                  <th className="py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it, idx) => (
                  <tr key={idx} className="group">
                    <td className="py-4 pr-4">
                      <div className="relative">
                        <input 
                          placeholder="What are you selling?" 
                          value={it.name} 
                          onChange={(e) => updateItem(idx, "name", e.target.value)}
                          className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-slate-900 placeholder:text-slate-300"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <input 
                        type="number" 
                        value={it.qty} 
                        onChange={(e) => updateItem(idx, "qty", Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                      />
                    </td>
                    <td className="py-4 px-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">ZMW</span>
                        <input 
                          type="number" 
                          value={it.price} 
                          onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-12 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                        />
                      </div>
                    </td>
                    <td className="py-4 text-right font-bold text-slate-900">
                      ZMW {((Number(it.qty) || 0) * (Number(it.price) || 0)).toFixed(2)}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <button 
                        onClick={() => removeItem(idx)} 
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button 
            onClick={addItem} 
            className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-900 hover:text-slate-600 transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Line Item
          </button>
        </div>

        {/* Footer Totals */}
        <div className="p-8 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row justify-between gap-12">
          <div className="flex-1 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Notes & Terms</h3>
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes or payment instructions..." 
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm h-32 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
          <div className="w-full md:w-80 space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">ZMW {subTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Tax (16%)</span>
              <span className="font-semibold text-slate-900">ZMW {tax.toFixed(2)}</span>
            </div>
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-lg font-bold text-slate-900">Total Amount</span>
              <span className="text-2xl font-black text-slate-900 underline decoration-slate-200 underline-offset-4">
                ZMW {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
