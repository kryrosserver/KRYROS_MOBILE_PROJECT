"use client";

import { useState } from "react";
import { 
  Bell, Mail, Check, ChevronLeft, Save
} from "lucide-react";
import Link from "next/link";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";

export default function NotificationSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const { 
    emailSettings, setEmailSettings,
    pushSettings, setPushSettings
  } = useAdminSettings();

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
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Notifications</h1>
            <p className="text-slate-500 text-sm">Control how and when you receive system alerts</p>
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
          {isSaving ? "Saving..." : saved ? "Saved!" : "Save Alerts"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Email Notifications */}
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-500" />
              Email Notifications
            </h3>
            <div className="space-y-4">
              {[
                { id: 'orders', label: 'New Orders', sub: 'Receive emails for every successful purchase', checked: emailSettings.orders },
                { id: 'payments', label: 'Payment Receipts', sub: 'Receive copies of customer payment receipts', checked: emailSettings.payments },
                { id: 'credit', label: 'Credit Updates', sub: 'Alerts for credit system applications and changes', checked: emailSettings.credit }
              ].map((item) => (
                <label key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-all border-2 border-transparent hover:border-slate-100">
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.sub}</p>
                  </div>
                  <div className="ml-4">
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={(e) => setEmailSettings({...emailSettings, [item.id]: e.target.checked})}
                      className="h-5 w-5 rounded-lg border-2 border-slate-300 text-green-600 focus:ring-green-500 transition-all cursor-pointer" 
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Push Notifications */}
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-500" />
              Real-time Alerts
            </h3>
            <div className="space-y-4">
              {[
                { id: 'orders', label: 'Order Pushes', sub: 'Instant desktop alerts for new sales', checked: pushSettings.orders },
                { id: 'payments', label: 'Payment Alerts', sub: 'Instant alerts for successful transactions', checked: pushSettings.payments }
              ].map((item) => (
                <label key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-all border-2 border-transparent hover:border-slate-100">
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{item.label}</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.sub}</p>
                  </div>
                  <div className="ml-4">
                    <input 
                      type="checkbox" 
                      checked={item.checked} 
                      onChange={(e) => setPushSettings({...pushSettings, [item.id]: e.target.checked})}
                      className="h-5 w-5 rounded-lg border-2 border-slate-300 text-green-600 focus:ring-green-500 transition-all cursor-pointer" 
                    />
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}