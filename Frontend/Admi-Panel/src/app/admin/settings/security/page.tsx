"use client";

import { useState, useEffect } from "react";
import {
  Shield, Lock, RefreshCw, CheckCircle2, AlertCircle,
  ChevronLeft, Save, Clock, UserCheck, Smartphone,
  QrCode, KeyRound, Eye, EyeOff, Copy, Check
} from "lucide-react";
import Link from "next/link";

type TwoFaStep = "idle" | "loading_setup" | "show_qr" | "verify_enable" | "verify_disable";
type TwoFaStatus = "unknown" | "enabled" | "disabled";

export default function SecuritySettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [sessionTimeout, setSessionTimeout] = useState(30);

  const [twoFaStatus, setTwoFaStatus] = useState<TwoFaStatus>("unknown");
  const [twoFaStep, setTwoFaStep] = useState<TwoFaStep>("idle");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [twoFaMessage, setTwoFaMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        setTwoFaStatus(data?.user?.twoFactorEnabled ? "enabled" : "disabled");
      })
      .catch(() => setTwoFaStatus("disabled"));
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Passwords do not match" });
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
      setPasswordMessage({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err.message || "Something went wrong" });
    } finally {
      setIsSaving(false);
    }
  };

  const handle2FaSetup = async () => {
    setTwoFaStep("loading_setup");
    setTwoFaMessage(null);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Setup failed");
      setQrCode(data.qrCodeUrl);
      setSecret(data.secret);
      setTwoFaStep("show_qr");
    } catch (err: any) {
      setTwoFaMessage({ type: "error", text: err.message || "Could not start 2FA setup" });
      setTwoFaStep("idle");
    }
  };

  const handle2FaEnable = async () => {
    if (!verifyCode.trim()) return;
    setTwoFaLoading(true);
    setTwoFaMessage(null);
    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Invalid code");
      setTwoFaStatus("enabled");
      setTwoFaStep("idle");
      setVerifyCode("");
      setTwoFaMessage({ type: "success", text: "Two-factor authentication is now enabled!" });
    } catch (err: any) {
      setTwoFaMessage({ type: "error", text: err.message || "Invalid authenticator code" });
    } finally {
      setTwoFaLoading(false);
    }
  };

  const handle2FaDisable = async () => {
    if (!verifyCode.trim()) return;
    setTwoFaLoading(true);
    setTwoFaMessage(null);
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verifyCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Invalid code");
      setTwoFaStatus("disabled");
      setTwoFaStep("idle");
      setVerifyCode("");
      setTwoFaMessage({ type: "success", text: "Two-factor authentication has been disabled." });
    } catch (err: any) {
      setTwoFaMessage({ type: "error", text: err.message || "Invalid authenticator code" });
    } finally {
      setTwoFaLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setSecretCopied(true);
    setTimeout(() => setSecretCopied(false), 2000);
  };

  const cancelTwoFa = () => {
    setTwoFaStep("idle");
    setTwoFaMessage(null);
    setVerifyCode("");
    setQrCode("");
    setSecret("");
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
        {/* Change Password */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-500" />
              Change Administrator Password
            </h3>

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              {passwordMessage && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${passwordMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                  {passwordMessage.type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                  <p className="text-[10px] font-black uppercase tracking-tight">{passwordMessage.text}</p>
                </div>
              )}

              {[
                { label: "Current Password", value: currentPassword, setter: setCurrentPassword },
                { label: "New Password", value: newPassword, setter: setNewPassword },
                { label: "Confirm Password", value: confirmPassword, setter: setConfirmPassword },
              ].map(({ label, value, setter }) => (
                <div key={label} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      required
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl focus:border-green-500 focus:bg-white outline-none transition-all font-medium pr-11"
                      placeholder="••••••••"
                    />
                    <button type="button" tabIndex={-1} onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}

              <button type="submit" disabled={isSaving} className="w-full btn-primary h-12 flex items-center justify-center gap-2">
                {isSaving ? <><RefreshCw className="h-4 w-4 animate-spin" /> Updating...</> : <><Save className="h-4 w-4" /> Save New Password</>}
              </button>
            </form>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Two-Factor Authentication */}
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Two-Factor Authentication
            </h3>
            <p className="text-[10px] text-slate-500 mb-5">Require a one-time code from your phone on every admin login.</p>

            {twoFaMessage && (
              <div className={`mb-5 p-4 rounded-xl flex items-center gap-3 ${twoFaMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {twoFaMessage.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
                <p className="text-[10px] font-black uppercase tracking-tight">{twoFaMessage.text}</p>
              </div>
            )}

            {/* Status banner */}
            <div className={`flex items-center gap-3 p-3 rounded-xl mb-5 ${twoFaStatus === "enabled" ? "bg-green-50 border border-green-200" : twoFaStatus === "disabled" ? "bg-slate-50 border border-slate-200" : "bg-slate-50 border border-slate-100"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${twoFaStatus === "enabled" ? "bg-green-500" : "bg-slate-300"}`}>
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tight">
                  {twoFaStatus === "enabled" ? "2FA Enabled" : twoFaStatus === "disabled" ? "2FA Disabled" : "Checking..."}
                </p>
                <p className="text-[10px] text-slate-500">
                  {twoFaStatus === "enabled"
                    ? "Your account is protected with an authenticator app."
                    : "Your account is not yet protected by 2FA."}
                </p>
              </div>
              {twoFaStatus === "enabled" && <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />}
            </div>

            {/* IDLE: show enable/disable button */}
            {twoFaStep === "idle" && (
              <>
                {twoFaStatus === "disabled" && (
                  <button
                    onClick={handle2FaSetup}
                    className="w-full h-11 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-tight flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                  >
                    <QrCode className="h-4 w-4" />
                    Enable Two-Factor Auth
                  </button>
                )}
                {twoFaStatus === "enabled" && (
                  <button
                    onClick={() => { setTwoFaStep("verify_disable"); setTwoFaMessage(null); }}
                    className="w-full h-11 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl font-black text-xs uppercase tracking-tight flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                  >
                    Disable Two-Factor Auth
                  </button>
                )}
              </>
            )}

            {/* Loading setup */}
            {twoFaStep === "loading_setup" && (
              <div className="flex items-center justify-center py-6 gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-slate-400" />
                <p className="text-xs text-slate-500">Generating your QR code...</p>
              </div>
            )}

            {/* Show QR */}
            {twoFaStep === "show_qr" && (
              <div className="space-y-5">
                <div className="bg-slate-50 rounded-2xl p-5 text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Step 1 — Scan with your Authenticator App</p>
                  <div className="flex justify-center mb-3">
                    <img src={qrCode} alt="2FA QR Code" className="w-40 h-40 rounded-xl border-4 border-white shadow-lg" />
                  </div>
                  <p className="text-[9px] text-slate-400 mb-2">Or enter this key manually:</p>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2">
                    <code className="text-xs font-bold text-slate-700 flex-1 text-left tracking-wider break-all">{secret}</code>
                    <button onClick={copySecret} className="ml-2 shrink-0 text-slate-400 hover:text-slate-700 transition-colors">
                      {secretCopied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step 2 — Enter the 6-digit code</p>
                  <input
                    type="text"
                    maxLength={6}
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-500 focus:bg-white outline-none text-center text-2xl font-black tracking-[0.5em] transition-all"
                  />
                </div>

                <div className="flex gap-3">
                  <button onClick={cancelTwoFa} className="flex-1 h-11 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-tight hover:bg-slate-200 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={() => setTwoFaStep("verify_enable")}
                    disabled={verifyCode.length < 6}
                    className="flex-2 flex-grow h-11 bg-green-500 text-white rounded-xl font-black text-xs uppercase tracking-tight flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ flexGrow: 2 }}
                  >
                    <KeyRound className="h-4 w-4" /> Verify & Enable
                  </button>
                </div>
              </div>
            )}

            {/* Verify enable */}
            {twoFaStep === "verify_enable" && (
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enter the 6-digit code from your app</p>
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-green-500 focus:bg-white outline-none text-center text-2xl font-black tracking-[0.5em] transition-all"
                />
                <div className="flex gap-3">
                  <button onClick={cancelTwoFa} className="flex-1 h-11 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-tight hover:bg-slate-200 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handle2FaEnable}
                    disabled={twoFaLoading || verifyCode.length < 6}
                    className="flex-1 h-11 bg-green-500 text-white rounded-xl font-black text-xs uppercase tracking-tight flex items-center justify-center gap-2 hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {twoFaLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    Confirm
                  </button>
                </div>
              </div>
            )}

            {/* Verify disable */}
            {twoFaStep === "verify_disable" && (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-[10px] font-black uppercase tracking-tight text-amber-700">
                    Enter your current authenticator code to disable 2FA
                  </p>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={verifyCode}
                  onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-red-400 focus:bg-white outline-none text-center text-2xl font-black tracking-[0.5em] transition-all"
                />
                <div className="flex gap-3">
                  <button onClick={cancelTwoFa} className="flex-1 h-11 bg-slate-100 text-slate-600 rounded-xl font-black text-xs uppercase tracking-tight hover:bg-slate-200 transition-colors">
                    Cancel
                  </button>
                  <button
                    onClick={handle2FaDisable}
                    disabled={twoFaLoading || verifyCode.length < 6}
                    className="flex-1 h-11 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-tight flex items-center justify-center gap-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {twoFaLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : null}
                    Disable 2FA
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Session Timeout */}
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-6 shadow-xl shadow-slate-200/20">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-500" />
              Session Timeout
            </h3>
            <p className="text-[10px] text-slate-500 mb-4">Automatically sign out after a period of inactivity.</p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(Math.max(1, Number(e.target.value)))}
                min={1}
                max={480}
                className="w-24 px-3 py-2 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-green-400 outline-none"
              />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Minutes</span>
              <span className="ml-auto text-[9px] text-slate-400 font-medium">Currently: {sessionTimeout} min</span>
            </div>
          </div>

          {/* IP Whitelist */}
          <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-6 shadow-xl shadow-slate-200/20">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Login Whitelist</p>
                <p className="text-[10px] text-slate-500 font-medium mt-0.5">Restrict access to specific IP addresses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
