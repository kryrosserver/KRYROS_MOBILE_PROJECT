"use client";

import { useState } from "react";
import { FilePlus, Receipt, Users, Package, Printer, Download } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";

type Item = { name: string; qty: number; price: number };

export default function InvoicePage() {
  const { companyName, logoDataUrl } = useAdminSettings();
  const [client, setClient] = useState({ name: "", email: "", address: "" });
  const [items, setItems] = useState<Item[]>([{ name: "", qty: 1, price: 0 }]);
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const subTotal = items.reduce((s, i) => s + (Number(i.qty) || 0) * (Number(i.price) || 0), 0);
  const tax = Math.round(subTotal * 0.16);
  const total = subTotal + tax;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KRYROS Invoice</h1>
          <p className="text-slate-500">Create invoices, estimates and payments</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="btn-secondary inline-flex items-center gap-2">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "New Invoice", icon: FilePlus },
          { title: "New Estimate", icon: Receipt },
          { title: "New Payment", icon: Download },
        ].map((card) => (
          <div key={card.title} className="bg-white rounded-xl border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">{card.title}</p>
            </div>
            <card.icon className="h-6 w-6 text-slate-600" />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-green-500 flex items-center justify-center">
              {logoDataUrl ? <img src={logoDataUrl} alt="logo" className="h-10 w-10 object-cover" /> : <span className="text-white font-bold">{(companyName || "K")[0]}</span>}
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">{companyName || "KRYROS"}</h2>
              <p className="text-xs text-slate-500">Invoice #{invoiceNo}</p>
            </div>
          </div>
          <div className="text-right">
            <label className="text-xs text-slate-500">Invoice #</label>
            <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} className="admin-input ml-2 w-40" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-slate-700">Bill To</label>
            <input placeholder="Client name" value={client.name} onChange={(e)=> setClient({...client, name: e.target.value})} className="admin-input w-full mt-1" />
            <input placeholder="Email" value={client.email} onChange={(e)=> setClient({...client, email: e.target.value})} className="admin-input w-full mt-2" />
            <textarea placeholder="Address" value={client.address} onChange={(e)=> setClient({...client, address: e.target.value})} className="admin-input w-full h-20 mt-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-slate-600">Date</label>
              <input type="date" defaultValue={new Date().toISOString().slice(0,10)} className="admin-input w-full" />
            </div>
            <div>
              <label className="text-sm text-slate-600">Due Date</label>
              <input type="date" className="admin-input w-full" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="w-24">Qty</th>
                <th className="w-40">Unit Price</th>
                <th className="w-40 text-right">Line Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td>
                    <input className="admin-input w-full" placeholder="Item description" value={it.name} onChange={(e)=> setItems(arr => arr.map((x,i)=> i===idx? {...x, name: e.target.value}: x))} />
                  </td>
                  <td>
                    <input type="number" className="admin-input w-full" value={it.qty} onChange={(e)=> setItems(arr => arr.map((x,i)=> i===idx? {...x, qty: Number(e.target.value)}: x))} />
                  </td>
                  <td>
                    <input type="number" className="admin-input w-full" value={it.price} onChange={(e)=> setItems(arr => arr.map((x,i)=> i===idx? {...x, price: Number(e.target.value)}: x))} />
                  </td>
                  <td className="text-right">{formatPrice((Number(it.qty)||0)*(Number(it.price)||0))}</td>
                  <td className="text-right">
                    <button onClick={()=> setItems(arr => arr.filter((_,i)=> i!==idx))} className="btn-danger">Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3">
            <button onClick={()=> setItems(arr => [...arr, { name: "", qty: 1, price: 0 }])} className="btn-secondary">
              Add Item
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex-1">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea className="admin-input w-full h-24 mt-1" placeholder="Thank you for your business." />
          </div>
          <div className="w-full md:w-80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Subtotal</span>
              <span className="font-medium">{formatPrice(subTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Tax (16%)</span>
              <span className="font-medium">{formatPrice(tax)}</span>
            </div>
            <div className="border-t pt-2 flex items-center justify-between">
              <span className="font-semibold text-slate-900">Total</span>
              <span className="text-xl font-bold text-slate-900">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
