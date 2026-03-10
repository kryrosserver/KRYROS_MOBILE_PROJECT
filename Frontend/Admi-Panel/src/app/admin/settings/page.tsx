"use client";

import { useState } from "react";
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
  Check
} from "lucide-react";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";

const settings = {
  company: {
    name: "KRYROS MOBILE TECH LIMITED",
    email: "kryrosmobile@gmail.com",
    phone: "+260966423719",
    address: " Lusaka, Zambia",
    website: "https://kryrosmobile.com",
    timezone: "Africa/Lusaka",
    currency: "ZMW",
    language: "English"
  },
  notifications: {
    emailOrders: true,
    emailPayments: true,
    emailCredit: true,
    pushOrders: true,
    pushPayments: true,
    pushCredit: false
  },
  payment: {
    paystackKey: "pk_test_****",
    flutterwaveKey: "flw_test_****",
    bankName: "Stanbic Bank Zambia",
    accountNumber: "********1234",
    accountName: "KRYROS MOBILE TECH LIMITED"
  },
  security: {
    twoFactor: false,
    sessionTimeout: 30,
    ipWhitelist: false
  }
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { companyName, setCompanyName, logoDataUrl, setLogoDataUrl } = useAdminSettings();

  const handleSave = () => {
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
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

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
                    defaultValue={companyName || settings.company.name}
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
                    defaultValue={settings.company.email}
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
                    defaultValue={settings.company.phone}
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
                    defaultValue={settings.company.website}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    defaultValue={settings.company.address}
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
                    defaultValue={settings.company.timezone}
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
                  defaultValue={settings.company.currency}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 appearance-none bg-white"
                >
                  <option value="ZMW">ZMW - Zambian Kwacha</option>
                  <option value="USD">USD - US Dollar</option>
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
                  <input type="checkbox" defaultChecked={settings.notifications.emailOrders} className="h-5 w-5 rounded text-green-500" />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Payment Notifications</span>
                    <p className="text-sm text-slate-500">Receive emails for payments</p>
                  </div>
                  <input type="checkbox" defaultChecked={settings.notifications.emailPayments} className="h-5 w-5 rounded text-green-500" />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Credit System</span>
                    <p className="text-sm text-slate-500">Receive emails for credit updates</p>
                  </div>
                  <input type="checkbox" defaultChecked={settings.notifications.emailCredit} className="h-5 w-5 rounded text-green-500" />
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
                  <input type="checkbox" defaultChecked={settings.notifications.pushOrders} className="h-5 w-5 rounded text-green-500" />
                </label>
                <label className="flex items-center justify-between p-4 bg-slate-50 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-slate-900">Payment Notifications</span>
                    <p className="text-sm text-slate-500">Push notifications for payments</p>
                  </div>
                  <input type="checkbox" defaultChecked={settings.notifications.pushPayments} className="h-5 w-5 rounded text-green-500" />
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
                      <input type="password" defaultValue={settings.payment.paystackKey} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg" />
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
                      <input type="password" defaultValue={settings.payment.flutterwaveKey} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-lg" />
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
                  <input type="text" defaultValue={settings.payment.bankName} className="w-full mt-1 px-4 py-2.5 border border-slate-300 rounded-lg" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Account Number</label>
                  <input type="text" defaultValue={settings.payment.accountNumber} className="w-full mt-1 px-4 py-2.5 border border-slate-300 rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Account Name</label>
                  <input type="text" defaultValue={settings.payment.accountName} className="w-full mt-1 px-4 py-2.5 border border-slate-300 rounded-lg" />
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
                  <input type="checkbox" defaultChecked={settings.security.twoFactor} className="h-5 w-5 rounded text-green-500" />
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Session Settings</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Session Timeout (minutes)</label>
                <input 
                  type="number" 
                  defaultValue={settings.security.sessionTimeout}
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
                  <input type="checkbox" defaultChecked={settings.security.ipWhitelist} className="h-5 w-5 rounded text-green-500" />
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
