"use client";

import { useState } from "react";
import { 
  Shield, Lock, RefreshCw, CheckCircle2, AlertCircle, 
  ChevronLeft, Save, Check, Clock, UserCheck
} from "lucide-react";
import Link from "next/link";

export default function SecuritySettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: "Passwords do not match" });
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to update password");
      setPasswordMessage({ type: 'success', text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || "Something went wrong" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ChevronLeft className="h-6 w-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Security Center</h1>
            <p className="text-slate-500 text-sm">Protect your administrative account and sessions</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* Change Password */}
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-500" />
              Change Administrator Password
            </h3>
            
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              {passwordMessage && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                  passwordMessage.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {passwordMessage.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                  <p className="text-[10px] font-black uppercase tracking-tight">{passwordMessage.text}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full btn-primary h-12 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <><RefreshCw className="h-4 w-4 animate-spin" /> Updating...</>
                ) : (
                  <><Save className="h-4 w-4" /> Save New Password</>
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          {/* Advanced Security */}
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Advanced Protections
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100/80 transition-all border-2 border-transparent hover:border-slate-100">
                <div className="flex-1">
                  <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Two-Factor Auth</p>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Require OTP for all admin sessions</p>
                </div>
                <div className="ml-4">
                  <input type="checkbox" className="h-5 w-5 rounded-lg border-2 border-slate-300 text-green-600 focus:ring-green-500 cursor-pointer" />
                </div>
              </label>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-4 border-2 border-slate-50">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Session Timeout</p>
                    <div className="flex items-center gap-2 mt-1">
                      <input type="number" defaultValue={30} className="w-20 px-3 py-1 bg-white border-2 border-slate-100 rounded-lg text-sm font-bold" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minutes</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl space-y-4 border-2 border-slate-50">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-5 w-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Login Whitelist</p>
                    <p className="text-[10px] text-slate-500 font-medium mt-1">Restrict access to specific IP addresses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}