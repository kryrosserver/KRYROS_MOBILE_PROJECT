"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
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
  Truck,
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

  const { companyName, setCompanyName, logoDataUrl, setLogoDataUrl } = useAdminSettings();

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
      }
    } catch (e) {
      console.error("Failed to save shipping method", e);
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
    // This is for other tabs if needed
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const tabs = [
    { id: "company", label: "Company", icon: Building },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "payment", label: "Payment", icon: CreditCard },
    { id: "shipping", label: "Shipping", icon: Truck },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  const companySettings = {
    name: "KRYROS MOBILE TECH LIMITED",
    email: "kryrosmobile@gmail.com",
    phone: "+260966423719",
    address: " Lusaka, Zambia",
    website: "https://kryrosmobile.com",
    timezone: "Africa/Lusaka",
    currency: "USD",
    language: "English"
  };

  const notificationSettings = {
    emailOrders: true,
    emailPayments: true,
    emailCredit: true,
    pushOrders: true,
    pushPayments: true,
    pushCredit: false
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
                    defaultValue={companyName || companySettings.name}
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
                  <input type="checkbox" defaultChecked={notificationSettings.emailOrders} className="h-5 w-5 rounded text-green-500" />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Payment Notifications</span>
                    <p className="text-sm text-slate-500">Receive emails for payments</p>
                  </div>
                  <input type="checkbox" defaultChecked={notificationSettings.emailPayments} className="h-5 w-5 rounded text-green-500" />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Credit System</span>
                    <p className="text-sm text-slate-500">Receive emails for credit updates</p>
                  </div>
                  <input type="checkbox" defaultChecked={notificationSettings.emailCredit} className="h-5 w-5 rounded text-green-500" />
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
                  <input type="checkbox" defaultChecked={notificationSettings.pushOrders} className="h-5 w-5 rounded text-green-500" />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Payment Notifications</span>
                    <p className="text-sm text-slate-500">Push notifications for payments</p>
                  </div>
                  <input type="checkbox" defaultChecked={notificationSettings.pushPayments} className="h-5 w-5 rounded text-green-500" />
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

        {activeTab === "shipping" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Shipping Methods</h3>
                <p className="text-sm text-slate-500">Configure different shipping options for your customers.</p>
              </div>
              <button 
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add Method
              </button>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                <div className="h-8 w-8 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
                <p className="text-sm font-medium">Loading shipping methods...</p>
              </div>
            ) : shippingMethods.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-4">
                <div className="p-4 bg-slate-50 rounded-full">
                  <Truck className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-900">No shipping methods found</p>
                  <p className="text-xs">Click "Add Method" to create your first shipping option.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {shippingMethods.map((method) => (
                  <div key={method.id} className={`p-6 rounded-2xl border transition-all ${method.isActive ? "border-slate-200 bg-white hover:border-green-500/50 hover:shadow-xl hover:shadow-green-500/5" : "border-slate-100 bg-slate-50 opacity-75"}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-slate-100 rounded-xl text-slate-600">
                        <Truck className="h-5 w-5" />
                      </div>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => handleOpenModal(method)}
                          className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteMethod(method.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1 mb-4">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        {method.name}
                        {!method.isActive && <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded">Disabled</span>}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">{method.description || "No description provided."}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fee</p>
                        <p className="text-lg font-black text-slate-900">${method.fee}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Free From</p>
                        <p className="text-lg font-black text-green-600">${method.minThreshold}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {method.estimatedDays || "Not specified"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add/Edit Modal */}
            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900">{editingMethod ? "Edit Shipping Method" : "Add Shipping Method"}</h3>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <form onSubmit={handleSaveMethod} className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Method Name</label>
                        <input
                          required
                          type="text"
                          value={methodForm.name}
                          onChange={(e) => setMethodForm({...methodForm, name: e.target.value})}
                          placeholder="e.g. Express Shipping"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Description</label>
                        <textarea
                          value={methodForm.description}
                          onChange={(e) => setMethodForm({...methodForm, description: e.target.value})}
                          placeholder="Short description for customers..."
                          rows={2}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Fee (USD)</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                              required
                              type="number"
                              step="0.01"
                              value={methodForm.fee}
                              onChange={(e) => setMethodForm({...methodForm, fee: Number(e.target.value)})}
                              className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Free Threshold</label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                            <input
                              required
                              type="number"
                              step="0.01"
                              value={methodForm.minThreshold}
                              onChange={(e) => setMethodForm({...methodForm, minThreshold: Number(e.target.value)})}
                              className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Estimated Delivery</label>
                        <input
                          type="text"
                          value={methodForm.estimatedDays}
                          onChange={(e) => setMethodForm({...methodForm, estimatedDays: e.target.value})}
                          placeholder="e.g. 2-3 business days"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                        />
                      </div>
                      <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={methodForm.isActive}
                          onChange={(e) => setMethodForm({...methodForm, isActive: e.target.checked})}
                          className="h-5 w-5 rounded border-slate-300 text-green-500 focus:ring-green-500"
                        />
                        <div>
                          <span className="text-sm font-bold text-slate-900">Active</span>
                          <p className="text-xs text-slate-500">Enable this method for customers</p>
                        </div>
                      </label>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : editingMethod ? "Update Method" : "Create Method"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Danger Zone</h3>
              <div className="p-4 border border-red-200 bg-red-50 rounded-xl">
                <h4 className="font-semibold text-red-600">Reset All Settings</h4>
                <p className="text-sm text-red-500 mt-1">This will reset all settings to default values. This action cannot be undone.</p>
                <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Theme</h3>
              <div className="grid grid-cols-3 gap-4">
                <label className="cursor-pointer">
                  <input type="radio" name="theme" value="light" defaultChecked className="peer sr-only" />
                  <div className="p-4 border-2 border-slate-200 rounded-xl peer-checked:border-green-500 peer-checked:bg-green-50 transition-all">
                    <div className="h-20 bg-white border border-slate-200 rounded-lg mb-2"></div>
                    <span className="text-sm font-medium text-slate-900">Light</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="theme" value="dark" className="peer sr-only" />
                  <div className="p-4 border-2 border-slate-200 rounded-xl peer-checked:border-green-500 peer-checked:bg-green-50 transition-all">
                    <div className="h-20 bg-slate-900 border border-slate-700 rounded-lg mb-2"></div>
                    <span className="text-sm font-medium text-slate-900">Dark</span>
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="theme" value="system" className="peer sr-only" />
                  <div className="p-4 border-2 border-slate-200 rounded-xl peer-checked:border-green-500 peer-checked:bg-green-50 transition-all">
                    <div className="h-20 bg-gradient-to-r from-white to-slate-900 border border-slate-200 rounded-lg mb-2"></div>
                    <span className="text-sm font-medium text-slate-900">System</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Accent Color</h3>
              <div className="flex gap-3">
                {["#22c55e", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#ec4899"].map((color) => (
                  <button
                    key={color}
                    className={`h-10 w-10 rounded-full border-2 ${color === "#22c55e" ? "border-slate-900" : "border-transparent"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
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
