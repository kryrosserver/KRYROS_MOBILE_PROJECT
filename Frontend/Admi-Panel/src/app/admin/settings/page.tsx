"use client";

import { useState, useEffect } from "react";
import { 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Clock, 
  CreditCard, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Upload,
  Check,
  Plus,
  Trash2,
  Edit2,
  X
} from "lucide-react";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";

type ShippingMethod = {
  id: string;
  name: string;
  description?: string;
  fee: number;
  minThreshold: number;
  estimatedDays?: string;
  isActive: boolean;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Shipping Methods State
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);
  const [methodForm, setMethodForm] = useState({
    name: "",
    description: "",
    fee: 0,
    minThreshold: 0,
    estimatedDays: "",
    isActive: true
  });

  const { 
    companyName, setCompanyName, 
    logoDataUrl, setLogoDataUrl,
    accentColor, setAccentColor,
    theme, setTheme,
    emailSettings, setEmailSettings,
    pushSettings, setPushSettings
  } = useAdminSettings();

  useEffect(() => {
    if (activeTab === "shipping") {
      loadShippingMethods();
    }
  }, [activeTab]);

  async function loadShippingMethods() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/shipping");
      if (res.ok) {
        const data = await res.json();
        setShippingMethods(data);
      }
    } catch (e) {
      console.error("Failed to load shipping methods", e);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenModal = (method?: ShippingMethod) => {
    if (method) {
      setEditingMethod(method);
      setMethodForm({
        name: method.name,
        description: method.description || "",
        fee: Number(method.fee),
        minThreshold: Number(method.minThreshold),
        estimatedDays: method.estimatedDays || "",
        isActive: method.isActive
      });
    } else {
      setEditingMethod(null);
      setMethodForm({
        name: "",
        description: "",
        fee: 0,
        minThreshold: 0,
        estimatedDays: "",
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const url = editingMethod ? `/api/admin/shipping/${editingMethod.id}` : "/api/admin/shipping";
      const method = editingMethod ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(methodForm),
      });

      if (res.ok) {
        setIsModalOpen(false);
        loadShippingMethods();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json();
        alert(`Failed to save: ${data.error || res.statusText}`);
      }
    } catch (e: any) {
      console.error("Failed to save shipping method", e);
      alert(`Error: ${e.message || "An unknown error occurred"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMethod = async (id: string) => {
    if (!confirm("Are you sure you want to delete this shipping method?")) return;
    try {
      const res = await fetch(`/api/admin/shipping/${id}`, { method: "DELETE" });
      if (res.ok) loadShippingMethods();
    } catch (e) {
      console.error("Failed to delete shipping method", e);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Logic is handled by provider's useEffect on state changes, 
    // but we show a success state here for UX
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  const tabs = [
    { id: "company", label: "Company", icon: Building },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  const companySettings = {
    email: "kryrosmobile@gmail.com",
    phone: "+260966423719",
    address: " Lusaka, Zambia",
    website: "https://kryrosmobile.com",
    timezone: "Africa/Lusaka",
    currency: "USD",
    language: "English"
  };

  const paymentSettings = {
    paystackKey: "pk_test_****",
    flutterwaveKey: "flw_test_****",
    bankName: "Stanbic Bank Zambia",
    accountNumber: "********1234",
    accountName: "KRYROS MOBILE TECH LIMITED"
  };

  const securitySettings = {
    twoFactor: false,
    sessionTimeout: 30,
    ipWhitelist: false
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="mt-1 text-slate-600">Manage global configuration and preferences</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            saved 
              ? "bg-green-500 text-white" 
              : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {isSaving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        {activeTab === "company" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Company Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e)=> setCompanyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    defaultValue={companySettings.email}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    defaultValue={companySettings.phone}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="url"
                    defaultValue={companySettings.website}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    defaultValue={companySettings.address}
                    rows={2}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Timezone</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <select
                    defaultValue={companySettings.timezone}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                  >
                    <option value="Africa/Lusaka">Africa/Lusaka (GMT+2)</option>
                    <option value="Africa/Johannesburg">Africa/Johannesburg (GMT+2)</option>
                    <option value="Africa/Nairobi">Africa/Nairobi (GMT+3)</option>
                    <option value="UTC">UTC (GMT+0)</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Currency</label>
                <select
                  defaultValue={companySettings.currency}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="ZMW">ZMW - Zambian Kwacha</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Company Logo</h3>
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 overflow-hidden flex items-center justify-center bg-slate-100">
                  {logoDataUrl ? <img src={logoDataUrl} alt="logo" className="h-20 w-20 object-cover" /> : <span className="text-2xl font-bold text-slate-400">{(companyName || "K")[0]}</span>}
                </div>
                <div>
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer">
                    <Upload className="h-4 w-4" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
                          const url = URL.createObjectURL(f);
                          const i = new Image();
                          i.onload = () => resolve(i);
                          i.onerror = reject;
                          i.src = url;
                        });
                        const canvas = document.createElement("canvas");
                        const size = 200;
                        canvas.width = size;
                        canvas.height = size;
                        const ctx = canvas.getContext("2d")!;
                        ctx.fillStyle = "#fff";
                        ctx.fillRect(0,0,size,size);
                        const scale = Math.min(size / img.width, size / img.height);
                        const w = Math.round(img.width * scale);
                        const h = Math.round(img.height * scale);
                        const x = Math.round((size - w) / 2);
                        const y = Math.round((size - h) / 2);
                        ctx.drawImage(img, x, y, w, h);
                        const data = canvas.toDataURL("image/png", 0.9);
                        setLogoDataUrl(data);
                      }}
                    />
                  </label>
                  <p className="mt-2 text-sm text-slate-500">PNG, JPG up to 2MB. Recommended 200x200px</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Order Notifications</span>
                    <p className="text-sm text-slate-500">Receive emails for new orders</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailSettings.orders} 
                    onChange={(e) => setEmailSettings({...emailSettings, orders: e.target.checked})}
                    className="h-5 w-5 rounded text-green-500" 
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Payment Notifications</span>
                    <p className="text-sm text-slate-500">Receive emails for payments</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailSettings.payments} 
                    onChange={(e) => setEmailSettings({...emailSettings, payments: e.target.checked})}
                    className="h-5 w-5 rounded text-green-500" 
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Credit System</span>
                    <p className="text-sm text-slate-500">Receive emails for credit updates</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={emailSettings.credit} 
                    onChange={(e) => setEmailSettings({...emailSettings, credit: e.target.checked})}
                    className="h-5 w-5 rounded text-green-500" 
                  />
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Push Notifications</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Order Notifications</span>
                    <p className="text-sm text-slate-500">Push notifications for new orders</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={pushSettings.orders} 
                    onChange={(e) => setPushSettings({...pushSettings, orders: e.target.checked})}
                    className="h-5 w-5 rounded text-green-500" 
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Payment Notifications</span>
                    <p className="text-sm text-slate-500">Push notifications for payments</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={pushSettings.payments} 
                    onChange={(e) => setPushSettings({...pushSettings, payments: e.target.checked})}
                    className="h-5 w-5 rounded text-green-500" 
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "payment" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Payment Gateways</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold">P</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Paystack</h4>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-600">Public Key</label>
                      <input type="password" defaultValue={paymentSettings.paystackKey} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Secret Key</label>
                      <input type="password" defaultValue="sk_test_****" className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg" />
                    </div>
                  </div>
                </div>
                <div className="p-4 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold">F</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Flutterwave</h4>
                      <span className="text-xs text-green-600">Active</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-slate-600">Public Key</label>
                      <input type="password" defaultValue={paymentSettings.flutterwaveKey} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600">Secret Key</label>
                      <input type="password" defaultValue="flw_test_****" className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Bank Transfer Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-slate-700">Bank Name</label>
                  <input type="text" defaultValue={paymentSettings.bankName} className="w-full mt-1 px-4 py-2.5 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Account Number</label>
                  <input type="text" defaultValue={paymentSettings.accountNumber} className="w-full mt-1 px-4 py-2.5 border border-slate-300 rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Account Name</label>
                  <input type="text" defaultValue={paymentSettings.accountName} className="w-full mt-1 px-4 py-2.5 border border-slate-300 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Authentication</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Two-Factor Authentication</span>
                    <p className="text-sm text-slate-500">Require 2FA for all admin logins</p>
                  </div>
                  <input type="checkbox" defaultChecked={securitySettings.twoFactor} className="h-5 w-5 rounded text-green-500" />
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Session Settings</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Session Timeout (minutes)</label>
                <input 
                  type="number" 
                  defaultValue={securitySettings.sessionTimeout}
                  className="w-full max-w-xs px-4 py-2.5 border border-slate-300 rounded-lg"
                />
                <p className="text-sm text-slate-500">Admin will be logged out after this period of inactivity</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">IP Security</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">IP Whitelist</span>
                    <p className="text-sm text-slate-500">Restrict admin access to specific IPs</p>
                  </div>
                  <input type="checkbox" defaultChecked={securitySettings.ipWhitelist} className="h-5 w-5 rounded text-green-500" />
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                {["light", "dark", "system"].map((t) => (
                  <label key={t} className="cursor-pointer">
                    <input 
                      type="radio" 
                      name="theme" 
                      value={t} 
                      checked={theme === t} 
                      onChange={() => setTheme(t as any)}
                      className="peer sr-only" 
                    />
                    <div className="p-4 border-2 border-slate-200 rounded-xl peer-checked:border-green-500 peer-checked:bg-green-50 transition-all">
                      <div className={`h-20 rounded-lg mb-2 ${
                        t === 'light' ? 'bg-white border border-slate-200' : 
                        t === 'dark' ? 'bg-slate-900 border border-slate-700' : 
                        'bg-gradient-to-r from-white to-slate-900 border border-slate-200'
                      }`}></div>
                      <span className="text-sm font-medium text-slate-900 capitalize">{t}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Accent Color</h3>
              <div className="flex flex-wrap gap-4">
                {["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6", "#0f172a"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={`h-12 w-12 rounded-full border-4 transition-all hover:scale-110 flex items-center justify-center ${
                      accentColor === color ? "border-slate-900 shadow-lg" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {accentColor === color && <Check className="h-5 w-5 text-white" />}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm text-slate-500">
                Current Accent: <span className="font-mono font-bold uppercase" style={{ color: accentColor }}>{accentColor}</span>
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Sidebar</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Collapsed by Default</span>
                    <p className="text-sm text-slate-500">Start with collapsed sidebar</p>
                  </div>
                  <input type="checkbox" className="h-5 w-5 rounded text-green-500" />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
