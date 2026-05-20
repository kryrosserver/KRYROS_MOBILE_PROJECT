"use client";

import { useState } from "react";
import { Save, ChevronLeft, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useInvoiceStore } from "@/providers/InvoiceStore";

export default function NewPaymentPage() {
  const router = useRouter();
  const { addPayment } = useInvoiceStore();
  
  const [client, setClient] = useState({ name: "" });
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("Cash");
  const [reference, setReference] = useState(`PAY-${Date.now().toString().slice(-6)}`);
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const handleSave = () => {
    addPayment({
      reference,
      clientId: client.name || "Walk-in Customer",
      amount,
      createdAt: new Date().toISOString(),
      method,
      invoiceNumber: invoiceNumber || undefined,
    });
    router.push("/admin/payment");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/payment" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Record Payment</h1>
        </div>
        <button onClick={handleSave} className="px-6 py-2 bg-[#1e293b] text-white rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors">
          <Save className="h-4 w-4" /> Save Payment
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Client Name</label>
            <input 
              placeholder="Client Name" 
              value={client.name} 
              onChange={(e) => setClient({ ...client, name: e.target.value })} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Invoice Number (Optional)</label>
            <input 
              placeholder="e.g. INV-123456" 
              value={invoiceNumber} 
              onChange={(e) => setInvoiceNumber(e.target.value)} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Amount Received</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-lg font-bold"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-slate-700">Payment Method</label>
            <select 
              value={method} 
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm"
            >
              <option>Cash</option>
              <option>Bank Transfer</option>
              <option>Mobile Money</option>
              <option>Cheque</option>
              <option>Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-slate-700">Payment Reference</label>
          <input 
            value={reference} 
            onChange={(e) => setReference(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-mono"
          />
        </div>
      </div>
    </div>
  );
}
