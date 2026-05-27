"use client";

import { useState, useEffect, useRef } from "react";
import {
  Shield, Lock, RefreshCw, CheckCircle2, AlertCircle,
  ChevronLeft, Save, Clock, UserCheck, Smartphone,
  QrCode, KeyRound, Eye, EyeOff, Copy, Check,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";

type TwoFaStep = "idle" | "loading_setup" | "show_qr" | "verify_enable" | "verify_disable";
type TwoFaStatus = "unknown" | "enabled" | "disabled";

export default function SecuritySettingsPage() {
  useEffect(() => {}, []);

  const [isSaving, setIsSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [twoFaStatus, setTwoFaStatus] = useState<TwoFaStatus>("unknown");
  const [twoFaStep, setTwoFaStep] = useState<TwoFaStep>("idle");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [twoFaMsg, setTwoFaMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setTwoFaStatus(d?.user?.twoFactorEnabled ? "enabled" : "disabled")).catch(() => setTwoFaStatus("disabled"));
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPwMsg(null);
    if (newPassword !== confirmPassword) { setPwMsg({ type: "error", text: "Passwords do not match" }); return; }
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/profile/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ currentPassword, newPassword }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to update password");
      setPwMsg({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: unknown) { setPwMsg({ type: "error", text: err instanceof Error ? err.message : "Something went wrong" }); }
    finally { setIsSaving(false); }
  };

  const handle2FaSetup = async () => {
    setTwoFaStep("loading_setup"); setTwoFaMsg(null);
    try {
      const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Setup failed");
      setQrCode(data.qrCodeUrl); setSecret(data.secret); setTwoFaStep("show_qr");
    } catch (err: unknown) { setTwoFaMsg({ type: "error", text: err instanceof Error ? err.message : "Could not start 2FA setup" }); setTwoFaStep("idle"); }
  };

  const handle2FaEnable = async () => {
    if (!verifyCode.trim()) return; setTwoFaLoading(true); setTwoFaMsg(null);
    try {
      const res = await fetch("/api/auth/2fa/enable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: verifyCode.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Invalid code");
      setTwoFaStatus("enabled"); setTwoFaStep("idle"); setVerifyCode("");
      setTwoFaMsg({ type: "success", text: "Two-factor authentication is now enabled!" });
    } catch (err: unknown) { setTwoFaMsg({ type: "error", text: err instanceof Error ? err.message : "Invalid code" }); }
    finally { setTwoFaLoading(false); }
  };

  const handle2FaDisable = async () => {
    if (!verifyCode.trim()) return; setTwoFaLoading(true); setTwoFaMsg(null);
    try {
      const res = await fetch("/api/auth/2fa/disable", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: verifyCode.trim() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Invalid code");
      setTwoFaStatus("disabled"); setTwoFaStep("idle"); setVerifyCode("");
      setTwoFaMsg({ type: "success", text: "Two-factor authentication has been disabled." });
    } catch (err: unknown) { setTwoFaMsg({ type: "error", text: err instanceof Error ? err.message : "Invalid code" }); }
    finally { setTwoFaLoading(false); }
  };

  const cancelTwoFa = () => { setTwoFaStep("idle"); setTwoFaMsg(null); setVerifyCode(""); setQrCode(""); setSecret(""); };

  const Msg = ({ msg }: { msg: { type: string; text: string } }) => (
    <div className="p-3 rounded-xl flex items-center gap-2 text-xs font-semibold"
      style={msg.type === "success"
        ? { background: "rgba(22,199,132,0.12)", color: "#16C784", border: "1px solid rgba(22,199,132,0.25)" }
        : { background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}>
      {msg.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
      {msg.text}
    </div>
  );

  return (
    <div style={{ background: "#F8F9FA", minHeight: "100vh", padding: "24px" }}>
      <div style={{ background: "#F8F9FA", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "#111827" }}>

          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/settings" style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFFFFF", border: "1px solid var(--card-border)", borderRadius: 8, padding: "5px 12px", color: "#4B5563", fontSize: 12, textDecoration: "none" }}>
                <ArrowLeft style={{ width: 13, height: 13 }} /> Back to Settings
              </Link>
              <div>
                <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                  <Link href="/admin/settings" style={{ color: "var(--text-muted)" }}>Settings</Link>
                  <span>/</span><span>Security</span>
                </div>
                <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "#111827" }}>Security Center</h1>
                <p className="text-sm mt-0.5" style={{ color: "#4B5563" }}>Protect your administrator account and sessions</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Left   Password */}
            <div className="space-y-5">
              <div className="admin-card">
                <p className="text-xs font-bold uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Lock className="h-3.5 w-3.5" /> Change Administrator Password
                </p>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  {pwMsg && <Msg msg={pwMsg} />}
                  {[
                    { label: "Current Password", value: currentPassword, set: setCurrentPassword },
                    { label: "New Password",      value: newPassword,     set: setNewPassword },
                    { label: "Confirm Password",  value: confirmPassword, set: setConfirmPassword },
                  ].map(({ label, value, set }) => (
                    <div key={label}>
                      <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>{label}</label>
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"} required value={value}
                          onChange={e => set(e.target.value)}
                          className="admin-input w-full pr-10"
                          placeholder="••••••••"
                        />
                        <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button type="submit" disabled={isSaving} className="w-full btn-primary h-11 flex items-center justify-center gap-2 disabled:opacity-60">
                    {isSaving ? <><RefreshCw className="h-4 w-4 animate-spin" /> Updating…</> : <><Save className="h-4 w-4" /> Save New Password</>}
                  </button>
                </form>
              </div>

              {/* Session Timeout */}
              <div className="admin-card">
                <p className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Clock className="h-3.5 w-3.5" /> Session Timeout
                </p>
                <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>Automatically sign out after a period of inactivity.</p>
                <div className="flex items-center gap-3">
                  <input type="number" value={sessionTimeout} onChange={e => setSessionTimeout(Math.max(1, Number(e.target.value)))} min={1} max={480}
                    className="admin-input w-24" />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Minutes</span>
                  <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>Current: {sessionTimeout} min</span>
                </div>
              </div>

              {/* IP Whitelist placeholder */}
              <div className="admin-card">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: "#F9FAFB" }}>
                    <UserCheck className="h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "#111827" }}>Login Whitelist</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Restrict access to specific IP addresses</p>
                  </div>
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-lg font-semibold" style={{ background: "#F9FAFB", color: "var(--text-muted)" }}>Coming soon</span>
                </div>
              </div>
            </div>

            {/* Right   2FA */}
            <div className="admin-card">
              <p className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <Shield className="h-3.5 w-3.5" /> Two-Factor Authentication
              </p>
              <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>Require a one-time code from your authenticator app on every login.</p>

              {twoFaMsg && <div className="mb-4"><Msg msg={twoFaMsg} /></div>}

              {/* Status banner */}
              <div className="flex items-center gap-3 p-3 rounded-xl mb-5"
                style={twoFaStatus === "enabled"
                  ? { background: "rgba(22,199,132,0.1)", border: "1px solid rgba(22,199,132,0.25)" }
                  : { background: "#F9FAFB", border: "1px solid var(--card-border)" }}>
                <div className="h-9 w-9 rounded-xl flex items-center justify-center"
                  style={{ background: twoFaStatus === "enabled" ? "rgba(22,199,132,0.2)" : "#F9FAFB" }}>
                  <Smartphone className="h-4 w-4" style={{ color: twoFaStatus === "enabled" ? "#16C784" : "var(--text-muted)" }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold" style={{ color: "#111827" }}>
                    {twoFaStatus === "enabled" ? "2FA Enabled" : twoFaStatus === "disabled" ? "2FA Disabled" : "Checking…"}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {twoFaStatus === "enabled" ? "Your account is protected with an authenticator app." : "Your account is not yet protected by 2FA."}
                  </p>
                </div>
                {twoFaStatus === "enabled" && <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: "#16C784" }} />}
              </div>

              {/* IDLE */}
              {twoFaStep === "idle" && (
                <>
                  {twoFaStatus === "disabled" && (
                    <button onClick={handle2FaSetup} className="w-full btn-primary h-11 flex items-center justify-center gap-2">
                      <QrCode className="h-4 w-4" /> Enable Two-Factor Auth
                    </button>
                  )}
                  {twoFaStatus === "enabled" && (
                    <button onClick={() => { setTwoFaStep("verify_disable"); setTwoFaMsg(null); }}
                      className="w-full h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                      style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.25)" }}>
                      Disable Two-Factor Auth
                    </button>
                  )}
                </>
              )}

              {/* Loading */}
              {twoFaStep === "loading_setup" && (
                <div className="flex items-center justify-center py-6 gap-2" style={{ color: "var(--text-muted)" }}>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <p className="text-sm">Generating your QR code…</p>
                </div>
              )}

              {/* Show QR */}
              {twoFaStep === "show_qr" && (
                <div className="space-y-4">
                  <div className="rounded-2xl p-5 text-center" style={{ background: "#F9FAFB", border: "1px solid var(--card-border)" }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Step 1   Scan with your Authenticator App</p>
                    <div className="flex justify-center mb-3">
                      <img src={qrCode} alt="2FA QR" className="w-36 h-36 rounded-xl p-2 bg-white" />
                    </div>
                    <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Or enter this key manually:</p>
                    <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "#F8F9FA", border: "1px solid var(--card-border)" }}>
                      <code className="text-xs font-bold flex-1 text-left tracking-wider break-all" style={{ color: "#111827" }}>{secret}</code>
                      <button onClick={() => { navigator.clipboard.writeText(secret); setSecretCopied(true); setTimeout(() => setSecretCopied(false), 2000); }}
                        style={{ color: secretCopied ? "#16C784" : "var(--text-muted)" }}>
                        {secretCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Step 2   Enter the 6-digit code</p>
                    <input type="text" maxLength={6} value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000" className="admin-input w-full text-center text-2xl font-black tracking-[0.5em]" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={cancelTwoFa} className="flex-1 btn-secondary h-11">Cancel</button>
                    <button onClick={() => setTwoFaStep("verify_enable")} disabled={verifyCode.length < 6}
                      className="flex-1 btn-primary h-11 flex items-center justify-center gap-2 disabled:opacity-50">
                      <KeyRound className="h-4 w-4" /> Verify & Enable
                    </button>
                  </div>
                </div>
              )}

              {/* Verify enable */}
              {twoFaStep === "verify_enable" && (
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Enter the 6-digit code from your app</p>
                  <input type="text" maxLength={6} value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000" className="admin-input w-full text-center text-2xl font-black tracking-[0.5em]" />
                  <div className="flex gap-3">
                    <button onClick={cancelTwoFa} className="flex-1 btn-secondary h-11">Cancel</button>
                    <button onClick={handle2FaEnable} disabled={twoFaLoading || verifyCode.length < 6}
                      className="flex-1 btn-primary h-11 flex items-center justify-center gap-2 disabled:opacity-50">
                      {twoFaLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Confirm
                    </button>
                  </div>
                </div>
              )}

              {/* Verify disable */}
              {twoFaStep === "verify_disable" && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl text-xs font-semibold" style={{ background: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}>
                    Enter your current authenticator code to disable 2FA
                  </div>
                  <input type="text" maxLength={6} value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000" className="admin-input w-full text-center text-2xl font-black tracking-[0.5em]" />
                  <div className="flex gap-3">
                    <button onClick={cancelTwoFa} className="flex-1 btn-secondary h-11">Cancel</button>
                    <button onClick={handle2FaDisable} disabled={twoFaLoading || verifyCode.length < 6}
                      className="flex-1 h-11 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: "#EF4444", color: "#fff" }}>
                      {twoFaLoading && <RefreshCw className="h-4 w-4 animate-spin" />} Disable 2FA
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}