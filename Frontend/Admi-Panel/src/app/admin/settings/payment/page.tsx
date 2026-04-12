"use client";

import { useState } from "react";
import { 
  CreditCard, ShieldCheck, ChevronLeft, Save, Check, 
  Building2, FileText
} from "lucide-react";
import Link from "next/link";

export default function PaymentSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const paymentSettings = {
    paystackKey: "pk_test_****",
    flutterwaveKey: "flw_test_****",
    bankName: "Stanbic Bank Global",
    accountNumber: "********1234",
    accountName: "KRYROS MOBILE TECH LIMITED"
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Payment Gateways</h1>
            <p className="text-slate-500 text-sm">Configure how you receive money from customers</p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-lg ${
            saved 
              ? "bg-green-500 text-white shadow-green-500/20" 
              : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20"
          }`}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : saved ? "Saved!" : "Save Configuration"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Online Payments */}
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              Online Payment Providers
            </h3>
            
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">P</div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Paystack</p>
                      <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Connected</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500">Disconnect</button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Public Key</label>
                  <input type="password" value={paymentSettings.paystackKey} className="w-full px-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl focus:border-blue-500 outline-none transition-all font-mono text-xs" />
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border-2 border-slate-50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black">F</div>
                    <div>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Flutterwave</p>
                      <p className="text-[10px] text-green-600 font-bold uppercase tracking-widest">Connected</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black uppercase text-slate-400 hover:text-red-500">Disconnect</button>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Public Key</label>
                  <input type="password" value={paymentSettings.flutterwaveKey} className="w-full px-4 py-2.5 bg-white border-2 border-slate-100 rounded-xl focus:border-orange-500 outline-none transition-all font-mono text-xs" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Manual Transfers */}
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-500" />
              Direct Bank Transfers
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bank Name</label>
                <input type="text" defaultValue={paymentSettings.bankName} className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" defaultValue={paymentSettings.accountNumber} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Name</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input type="text" defaultValue={paymentSettings.accountName} className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium" />
                </div>
              </div>
            </div>
            
            <p className="mt-8 text-[10px] text-slate-400 font-medium italic text-center">
              These details will be shown to customers who select "Bank Transfer" as their payment method.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}