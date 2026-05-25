"use client";

import { useState, useRef, useEffect } from "react";
import {
  CreditCard, ShieldCheck, ChevronLeft, Save, Check,
  Building2, FileText, Link2, Link2Off, Wallet
} from "lucide-react";
import Link from "next/link";

const ACCENT = "#12D6C5";

const GATEWAYS = [
  {
    id: "paystack", label: "Paystack", initial: "P",
    color: "#2563eb", bg: "rgba(37,99,235,0.12)",
    key: "pk_test_****", status: "Connected",
  },
  {
    id: "flutterwave", label: "Flutterwave", initial: "F",
    color: "#ea580c", bg: "rgba(234,88,12,0.12)",
    key: "flw_test_****", status: "Connected",
  },
];

export default function PaymentSettingsPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(s: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const h = innerRef.current.scrollHeight * s; const avail = window.innerWidth < 1024 ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${Math.max(h, avail)}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const base = vw < 960 ? 750 : 1380; if (vw <= 599) { innerRef.current.style.width = "750px"; innerRef.current.style.transform = "none"; innerRef.current.style.transformOrigin = "top left"; if (outerRef.current) { outerRef.current.style.overflowX = "auto"; outerRef.current.style.height = "auto"; } return; } if (outerRef.current) outerRef.current.style.overflowX = "hidden"; const s = Math.min(1, vw / base); innerRef.current.style.width = `${base}px`; innerRef.current.style.transform = `scale(${s})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(s))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => { setIsSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000); }, 700);
  };

  const stats = [
    { label: "Online Gateways", value: GATEWAYS.length, color: ACCENT,     bg: "rgba(18,214,197,0.12)", icon: CreditCard },
    { label: "Connected",       value: GATEWAYS.length, color: "#16C784",  bg: "rgba(22,199,132,0.12)", icon: Link2 },
    { label: "Bank Accounts",   value: 1,               color: "#F59E0B",  bg: "rgba(245,158,11,0.12)", icon: Building2 },
  ];

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", padding: "24px" }}>
        <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>

          {/* Header */}
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/settings" className="h-9 w-9 rounded-xl flex items-center justify-center btn-secondary !px-0">
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <div>
                <div className="flex items-center gap-2 text-xs mb-0.5" style={{ color: "var(--text-muted)" }}>
                  <Link href="/admin/settings" style={{ color: "var(--text-muted)" }}>Settings</Link>
                  <span>/</span><span>Payment</span>
                </div>
                <h1 className="text-2xl font-bold whitespace-nowrap" style={{ color: "var(--text-primary)" }}>Payment Gateways</h1>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>Configure how you receive money from customers</p>
              </div>
            </div>
            <button onClick={handleSave} disabled={isSaving}
              className="btn-primary flex items-center gap-2 px-5 h-10 disabled:opacity-60"
              style={saved ? { background: "#16C784" } : {}}>
              {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {isSaving ? "Saving…" : saved ? "Saved!" : "Save Configuration"}
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
                </div>
                <p className="text-sm" style={{ color: "var(--text-secondary)", minHeight: "2.5rem" }}>{s.label}</p>
                <p className="text-2xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Online Gateways */}
            <div className="admin-card space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <ShieldCheck className="h-3.5 w-3.5" /> Online Payment Providers
              </p>

              {GATEWAYS.map(gw => (
                <div key={gw.id} className="rounded-2xl p-5 space-y-4" style={{ background: "var(--hover-bg)", border: "1px solid var(--card-border)" }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white text-sm" style={{ background: gw.color }}>
                        {gw.initial}
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{gw.label}</p>
                        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "#16C784" }}>
                          <Link2 className="h-3 w-3" /> {gw.status}
                        </p>
                      </div>
                    </div>
                    <button className="text-xs font-semibold flex items-center gap-1 px-2 py-1 rounded-lg btn-secondary" style={{ color: "#EF4444" }}>
                      <Link2Off className="h-3 w-3" /> Disconnect
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Public Key</label>
                    <input type="password" defaultValue={gw.key} className="admin-input w-full font-mono text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Secret Key</label>
                    <input type="password" defaultValue="sk_test_****" className="admin-input w-full font-mono text-xs" />
                  </div>
                </div>
              ))}
            </div>

            {/* Bank Transfer */}
            <div className="admin-card space-y-5">
              <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "var(--text-muted)" }}>
                <Building2 className="h-3.5 w-3.5" /> Direct Bank Transfers
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                These details are shown to customers who select "Bank Transfer" at checkout.
              </p>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Bank Name</label>
                <input type="text" defaultValue="Stanbic Bank Global" className="admin-input w-full" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Account Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                  <input type="text" defaultValue="********1234" className="admin-input pl-10 w-full" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Account Name</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                  <input type="text" defaultValue="KRYROS MOBILE TECH LIMITED" className="admin-input pl-10 w-full" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "var(--text-muted)" }}>Branch / Sort Code</label>
                <div className="relative">
                  <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                  <input type="text" placeholder="Optional" className="admin-input pl-10 w-full" />
                </div>
              </div>

              {/* Wallet payment toggle */}
              <div className="pt-4" style={{ borderTop: "1px solid var(--card-border)" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>In-App Wallet</p>
                <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--hover-bg)", border: "1px solid var(--card-border)" }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Wallet Payments</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>Allow customers to pay using their wallet balance</p>
                  </div>
                  <div className="h-6 w-11 rounded-full relative" style={{ background: ACCENT }}>
                    <span className="inline-block h-4 w-4 bg-white rounded-full absolute top-1 right-1" />
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
