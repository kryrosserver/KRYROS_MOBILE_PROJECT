"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Mail, Check, ChevronLeft, Save, ShoppingCart, CreditCard, Smartphone, Package,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useAdminSettings } from "@/providers/AdminSettingsProvider";

function ToggleRow({ label, sub, icon: Icon, iconColor, iconBg, checked, onChange }: {
  label: string; sub: string; icon: any; iconColor: string; iconBg: string;
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all"
      style={{ background: checked ? `${iconColor}08` : "#F9FAFB", border: `1px solid ${checked ? `${iconColor}25` : "#E5E7EB"}` }}
      onClick={() => onChange(!checked)}
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
          <Icon className="h-4 w-4" style={{ color: iconColor }} />
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#111827" }}>{label}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>
        </div>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onChange(!checked); }}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none shrink-0"
        style={{ background: checked ? "#6366F1" : "#F9FAFB" }}
      >
        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          style={{ transform: checked ? "translateX(1.375rem)" : "translateX(0.25rem)" }} />
      </button>
    </div>
  );
}

export default function NotificationSettingsPage() {
  useEffect(() => {}, []);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { emailSettings, setEmailSettings, pushSettings, setPushSettings } = useAdminSettings();

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => { setIsSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 700);
  };

  const enabledEmail = Object.values(emailSettings).filter(Boolean).length;
  const enabledPush  = Object.values(pushSettings).filter(Boolean).length;

  const stats = [
    { label: "Email Alerts Enabled", value: enabledEmail, total: 3, color: "#6366F1",    bg: "rgba(18,214,197,0.12)", icon: Mail },
    { label: "Push Alerts Enabled",  value: enabledPush,  total: 2, color: "#F59E0B", bg: "rgba(245,158,11,0.12)", icon: Bell },
    { label: "Total Alert Types",    value: 5,            total: 5, color: "#16C784", bg: "rgba(22,199,132,0.12)", icon: Smartphone },
  ];

  const emailRows = [
    { id: "orders",   label: "New Orders",       sub: "Receive emails for every successful purchase",           icon: ShoppingCart, iconColor: "#6366F1",    iconBg: "rgba(18,214,197,0.12)" },
    { id: "payments", label: "Payment Receipts", sub: "Receive copies of customer payment receipts",            icon: CreditCard,   iconColor: "#16C784", iconBg: "rgba(22,199,132,0.12)" },
    { id: "credit",   label: "Credit Updates",   sub: "Alerts for credit applications and repayment changes",   icon: Package,      iconColor: "#F59E0B", iconBg: "rgba(245,158,11,0.12)" },
  ];

  const pushRows = [
    { id: "orders",   label: "Order Pushes",     sub: "Instant desktop alerts for new sales",                  icon: ShoppingCart, iconColor: "#6366F1",    iconBg: "rgba(18,214,197,0.12)" },
    { id: "payments", label: "Payment Alerts",   sub: "Instant alerts for successful transactions",             icon: CreditCard,   iconColor: "#16C784", iconBg: "rgba(22,199,132,0.12)" },
  ];

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
                  <span>/</span><span>Notifications</span>
                </div>
                <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "#111827" }}>Notifications</h1>
                <p className="text-sm mt-0.5" style={{ color: "#4B5563" }}>Control how and when you receive system alerts</p>
              </div>
            </div>
            <button onClick={handleSave} disabled={isSaving}
              className="btn-primary flex items-center gap-2 px-5 h-10 disabled:opacity-60"
              style={saved ? { background: "#16C784" } : {}}>
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving…" : saved ? "Saved!" : "Save Alerts"}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {stats.map(s => (
              <div key={s.label} className="admin-card !p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                    <s.icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                  <span className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{s.value}/{s.total}</span>
                </div>
                <p className="text-sm" style={{ color: "#4B5563", minHeight: "2.5rem" }}>{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Email Notifications */}
            <div className="admin-card space-y-3">
              <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--card-border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Mail className="h-3.5 w-3.5" /> Email Notifications
                </p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(18,214,197,0.1)", color: "#6366F1" }}>
                  {enabledEmail} / {emailRows.length} on
                </span>
              </div>
              {emailRows.map(row => (
                <ToggleRow
                  key={row.id}
                  label={row.label}
                  sub={row.sub}
                  icon={row.icon}
                  iconColor={row.iconColor}
                  iconBg={row.iconBg}
                  checked={!!(emailSettings as any)[row.id]}
                  onChange={v => setEmailSettings({ ...emailSettings, [row.id]: v })}
                />
              ))}
            </div>

            {/* Push Notifications */}
            <div className="admin-card space-y-3">
              <div className="flex items-center justify-between pb-3" style={{ borderBottom: "1px solid var(--card-border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                  <Bell className="h-3.5 w-3.5" /> Real-time Push Alerts
                </p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>
                  {enabledPush} / {pushRows.length} on
                </span>
              </div>
              {pushRows.map(row => (
                <ToggleRow
                  key={row.id}
                  label={row.label}
                  sub={row.sub}
                  icon={row.icon}
                  iconColor={row.iconColor}
                  iconBg={row.iconBg}
                  checked={!!(pushSettings as any)[row.id]}
                  onChange={v => setPushSettings({ ...pushSettings, [row.id]: v })}
                />
              ))}

              {/* Note */}
              <div className="p-4 rounded-2xl mt-2" style={{ background: "#F9FAFB", border: "1px solid var(--card-border)" }}>
                <p className="text-xs font-semibold mb-1" style={{ color: "#111827" }}>Push Notification Setup</p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                  Real-time alerts require a Firebase service account. Configure it in your environment variables as <code className="font-mono" style={{ color: "#6366F1" }}>FIREBASE_SERVICE_ACCOUNT_JSON</code>.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}