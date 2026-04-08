"use client";

import { useState } from "react";
import { Lock, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const onUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: "Passwords do not match" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to update password");
      
      setMessage({ type: 'success', text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || "Something went wrong" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 max-w-4xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">Security Settings</h1>
        <p className="text-slate-500 text-sm">Manage your account security and password</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-100/30">
              <ShieldCheck className="h-10 w-10" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Account Security</p>
              <p className="text-xs text-slate-500 mt-1">Ensure your password is strong and changed regularly.</p>
            </div>
          </div>
          
          <div className="bg-slate-900 p-6 rounded-2xl text-white space-y-3">
            <p className="text-sm font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-400" />
              Password Tips
            </p>
            <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4">
              <li>Use at least 8 characters</li>
              <li>Include numbers and symbols</li>
              <li>Avoid using personal information</li>
            </ul>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="h-5 w-5 text-green-500" />
                Change Password
              </h2>
            </div>
            
            <form onSubmit={onUpdatePassword} className="p-6 space-y-6">
              {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
                  message.type === 'success' ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {message.type === 'success' ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                  <p className="text-sm font-medium">{message.text}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="admin-input w-full min-h-[44px]"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New password"
                      className="admin-input w-full min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="admin-input w-full min-h-[44px]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary min-h-[44px] px-8 flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
