"use client";

import { useState, useEffect, useRef } from 'react';
import {
  Bell, Send, Info, Loader2, Calendar, Target, Users, Eye,
  MessageSquare, Mail, Search, Sun, Moon, Menu, ChevronDown, ChevronRight,
  Download, MoreHorizontal, BarChart3, CheckCircle,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

const ACCENT = "#12D6C5";

function MiniSparkline({ color = ACCENT, up = true }: { color?: string; up?: boolean }) {
  const data = up
    ? [{ v: 1 }, { v: 2 }, { v: 1.5 }, { v: 3 }, { v: 2.5 }, { v: 4 }, { v: 3.8 }]
    : [{ v: 4 }, { v: 3 }, { v: 3.5 }, { v: 2 }, { v: 2.5 }, { v: 1.5 }, { v: 1.2 }];
  return (
    <ResponsiveContainer width="100%" height={32}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`sgn${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sgn${color.replace("#", "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default function NotificationsPage() {
  const { isDark, toggleTheme } = useTheme();

  const BG = "var(--bg-primary)";
  const CARD = "var(--card-bg)";
  const BORDER = "var(--card-border)";
  const TEXT = "var(--text-primary)";
  const TEXT2 = "var(--text-secondary)";
  const HOVER = "var(--hover-bg)";
  const HEADER_BG = "var(--bg-secondary)";
  const ICON_BG = "var(--icon-bg)";

  useEffect(() => {}, []);

  const [activeTab, setActiveTab] = useState<'PUSH' | 'SMS' | 'EMAIL'>('PUSH');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [targetType, setTargetType] = useState<'BROADCAST' | 'SINGLE' | 'BULK' | 'STATUS_BASED'>('BROADCAST');
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({ title: "", body: "", url: "/", userId: "", orderIds: "", orderStatus: "PENDING", scheduledAt: "" });
  const [smsFormData, setSmsFormData] = useState({ message: "", phoneNumbers: "", scheduledAt: "" });
  const [emailFormData, setEmailFormData] = useState({ email: "", subject: "KRYROS Update", message: "" });

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) { setMessage({ type: 'error', text: "Please fill in both title and message" }); return; }
    setLoading(true); setMessage(null);
    try {
      const payload: any = { title: formData.title, body: formData.body, targetType: targetType === 'BROADCAST' ? 'BULK' : targetType, data: { url: formData.url } };
      if (formData.scheduledAt) payload.scheduledAt = formData.scheduledAt;
      if (targetType === 'SINGLE') payload.userId = formData.userId;
      if (targetType === 'BULK') payload.orderIds = formData.orderIds.split(',').map(id => id.trim());
      if (targetType === 'STATUS_BASED') payload.orderStatus = formData.orderStatus;
      const type = targetType === 'BROADCAST' ? 'broadcast' : 'send';
      const res = await fetch(`/api/admin/notifications?type=${type}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (res.ok) { setMessage({ type: 'success', text: formData.scheduledAt ? "Notification scheduled successfully!" : "Notification sent successfully!" }); setFormData({ ...formData, title: "", body: "", scheduledAt: "" }); setShowPreview(false); }
      else { const data = await res.json().catch(() => ({})); setMessage({ type: 'error', text: data.message || "Failed to process request" }); }
    } catch { setMessage({ type: 'error', text: "An error occurred" }); }
    finally { setLoading(false); }
  };

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsFormData.message || !smsFormData.phoneNumbers) { setMessage({ type: 'error', text: "Please provide message and phone numbers" }); return; }
    setLoading(true); setMessage(null);
    try {
      const numbersArray = smsFormData.phoneNumbers.split(',').map(n => n.trim()).filter(Boolean);
      const res = await fetch(`/api/admin/notifications?type=sms`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phoneNumber: numbersArray[0], message: smsFormData.message }) });
      if (res.ok) { setMessage({ type: 'success', text: "SMS sent successfully via Beem Africa!" }); setSmsFormData({ message: "", phoneNumbers: "", scheduledAt: "" }); }
      else { const data = await res.json().catch(() => ({})); setMessage({ type: 'error', text: data.message || "Failed to send SMS" }); }
    } catch { setMessage({ type: 'error', text: "An error occurred while sending SMS" }); }
    finally { setLoading(false); }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailFormData.email || !emailFormData.message) { setMessage({ type: 'error', text: "Please provide recipient email and message" }); return; }
    setLoading(true); setMessage(null);
    try {
      const res = await fetch(`/api/admin/notifications?type=email`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(emailFormData) });
      if (res.ok) { setMessage({ type: 'success', text: "Test email sent successfully via Gmail SMTP!" }); setEmailFormData({ ...emailFormData, message: "" }); }
      else { const data = await res.json().catch(() => ({})); setMessage({ type: 'error', text: data.message || "Failed to send test email" }); }
    } catch { setMessage({ type: 'error', text: "An error occurred while sending email" }); }
    finally { setLoading(false); }
  };

  const card = { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14 };
  const inputStyle = { width: "100%", background: HOVER, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "10px 14px", color: TEXT, fontSize: 13, outline: "none" };
  const labelStyle = { fontSize: 10, fontWeight: 700, color: TEXT2, textTransform: "uppercase" as const, letterSpacing: "0.08em", display: "block", marginBottom: 6 };

  return (
    <div style={{ overflow: "hidden", background: BG, margin: "-24px", width: "calc(100% + 48px)" }}>
      <div style={{ background: BG, color: TEXT, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── HEADER ── */}
        <header style={{ background: HEADER_BG, borderBottom: `1px solid ${BORDER}`, height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: TEXT, whiteSpace: "nowrap", margin: 0 }}>Notification Center</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT2, width: 15, height: 15 }} />
            <input placeholder="Search..." style={{ width: "100%", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "8px 40px 8px 36px", color: TEXT, fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: TEXT2, background: ICON_BG, padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: TEXT2, padding: 4 }}>{isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}</button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 14px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} /> May 20 – May 26, 2025 <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: ACCENT, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320" }}>K</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: TEXT, lineHeight: 1 }}>Admin</div><div style={{ fontSize: 10, color: TEXT2, marginTop: 1 }}>Super Admin</div></div>
              <ChevronDown style={{ width: 14, height: 14, color: TEXT2 }} />
            </div>
          </div>
        </header>

        {/* ── BODY ── */}
        <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Page title + actions */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: TEXT, margin: 0 }}>Notification Center</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 12, color: TEXT2 }}>
                <span>Home</span><ChevronRight style={{ width: 13, height: 13 }} /><span style={{ color: ACCENT }}>Notifications</span>
              </div>
              <p style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>Send push, SMS, and email notifications to customers</p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button style={{ display: "flex", alignItems: "center", gap: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
                <Download style={{ width: 15, height: 15 }} /> Export Logs
              </button>
              <button style={{ display: "flex", alignItems: "center", justifyContent: "center", background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 12px", color: TEXT2, cursor: "pointer" }}>
                <MoreHorizontal style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>

          {/* Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { label: "Total Sent", value: "0", change: "0.0%", up: true, color: ACCENT, icon: BarChart3 },
              { label: "Push Notifications", value: "0", change: "0.0%", up: true, color: "#3B82F6", icon: Bell },
              { label: "SMS Messages", value: "0", change: "0.0%", up: true, color: "#8B5CF6", icon: MessageSquare },
              { label: "Emails Sent", value: "0", change: "0.0%", up: true, color: "#F59E0B", icon: Mail },
            ].map((s, i) => (
              <div key={i} style={{ ...card, padding: "16px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon style={{ width: 20, height: 20, color: s.color }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: s.up ? "#22C55E" : "#EF4444" }}>
                    {s.up ? "▲" : "▼"} {s.change}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: TEXT, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
                <div style={{ marginTop: 8 }}><MiniSparkline color={s.color} up={s.up} /></div>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <div style={{ borderBottom: `1px solid ${BORDER}` }}>
            <nav style={{ display: "flex", gap: 4 }}>
              {[
                { id: "PUSH" as const, label: "Push Notifications", icon: Bell },
                { id: "SMS" as const, label: "SMS (Beem Africa)", icon: MessageSquare },
                { id: "EMAIL" as const, label: "Email (SMTP)", icon: Mail },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer", background: "transparent", border: "none", borderBottom: activeTab === tab.id ? `2px solid ${ACCENT}` : "2px solid transparent", color: activeTab === tab.id ? ACCENT : TEXT2, whiteSpace: "nowrap", transition: "color 0.15s" }}>
                  <tab.icon style={{ width: 14, height: 14 }} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {message && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", borderRadius: 12, border: `2px solid ${message.type === "success" ? "rgba(22,199,132,0.2)" : "rgba(239,68,68,0.2)"}`, background: message.type === "success" ? "rgba(22,199,132,0.08)" : "rgba(239,68,68,0.08)", fontSize: 13, fontWeight: 700, color: message.type === "success" ? "#16C784" : "#EF4444" }}>
              <Info style={{ width: 18, height: 18, flexShrink: 0 }} />
              {message.text}
            </div>
          )}

          {/* 2-column layout: Form + Tips */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16 }}>

            {/* Form Card */}
            <div style={{ ...card, padding: "24px", overflow: "hidden" }}>
              {/* EMAIL FORM */}
              {activeTab === 'EMAIL' && (
                <form onSubmit={handleSendEmail} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={labelStyle}>Recipient Email</label>
                    <input required type="email" placeholder="Enter recipient email address..." value={emailFormData.email} onChange={e => setEmailFormData({ ...emailFormData, email: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Subject</label>
                    <input required placeholder="Enter email subject..." value={emailFormData.subject} onChange={e => setEmailFormData({ ...emailFormData, subject: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Email Message</label>
                    <textarea required placeholder="Enter the email content..." rows={6} value={emailFormData.message} onChange={e => setEmailFormData({ ...emailFormData, message: e.target.value }) } style={{ ...inputStyle, resize: "none" }} />
                  </div>
                  <button type="submit" disabled={loading} style={{ height: 52, background: ACCENT, border: "none", borderRadius: 12, color: "#0B1320", fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: loading ? 0.7 : 1 }}>
                    {loading ? <Loader2 style={{ width: 20, height: 20 }} /> : <Mail style={{ width: 20, height: 20 }} />}
                    {loading ? "Sending..." : "Send Test Email"}
                  </button>
                </form>
              )}

              {/* SMS FORM */}
              {activeTab === 'SMS' && (
                <form onSubmit={handleSendSms} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div>
                    <label style={labelStyle}>Phone Numbers</label>
                    <textarea required placeholder="Enter phone numbers separated by comma (e.g. 255700000001, 255700000011)..." rows={2} value={smsFormData.phoneNumbers} onChange={e => setSmsFormData({ ...smsFormData, phoneNumbers: e.target.value })} style={{ ...inputStyle, resize: "none", fontFamily: "monospace", fontSize: 12 }} />
                    <p style={{ fontSize: 10, color: TEXT2, marginTop: 4 }}>Use international format without '+' (e.g., 255 for Tanzania, 234 for Nigeria)</p>
                  </div>
                  <div>
                    <label style={labelStyle}>Message Body</label>
                    <textarea required placeholder="Enter the SMS message..." rows={4} value={smsFormData.message} onChange={e => setSmsFormData({ ...smsFormData, message: e.target.value })} style={{ ...inputStyle, resize: "none" }} />
                    <div style={{ textAlign: "right", marginTop: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: smsFormData.message.length > 160 ? "#EF4444" : TEXT2 }}>{smsFormData.message.length} / 160 chars</span>
                    </div>
                  </div>
                  <div style={{ ...card, background: HOVER, padding: "16px", borderRadius: 12 }}>
                    <label style={labelStyle}><Calendar style={{ display: "inline", width: 11, height: 11 }} /> Schedule (Optional)</label>
                    <input type="datetime-local" value={smsFormData.scheduledAt} onChange={e => setSmsFormData({ ...smsFormData, scheduledAt: e.target.value })} style={inputStyle} />
                  </div>
                  <button type="submit" disabled={loading} style={{ height: 52, background: ACCENT, border: "none", borderRadius: 12, color: "#0B1320", fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: loading ? 0.7 : 1 }}>
                    {loading ? <Loader2 style={{ width: 20, height: 20 }} /> : <Send style={{ width: 20, height: 20 }} />}
                    {loading ? "Sending..." : "Send SMS"}
                  </button>
                </form>
              )}

              {/* PUSH FORM */}
              {activeTab === 'PUSH' && (
                showPreview ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, minHeight: 400 }}>
                    <div style={{ width: 280, background: "#fff", borderRadius: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", border: "1px solid #f1f5f9", overflow: "hidden" }}>
                      <div style={{ padding: "14px 16px", background: "#f8fafc", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, background: ACCENT, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, color: "#0B1320" }}>K</div>
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase" }}>Kryros Mobile</div>
                          <div style={{ fontSize: 8, color: "#94a3b8" }}>Now</div>
                        </div>
                      </div>
                      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 4 }}>
                        <h3 style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: 0, lineHeight: 1.3 }}>{formData.title || "Notification Title"}</h3>
                        <p style={{ fontSize: 11, color: "#64748b", margin: 0, lineHeight: 1.6 }}>{formData.body || "This is how your message will appear on customer phones."}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.08em" }}>Simulated Mobile Preview</p>
                    <button onClick={() => setShowPreview(false)} style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "9px 18px", color: TEXT2, fontSize: 13, cursor: "pointer" }}>Back to Form</button>
                  </div>
                ) : (
                  <form onSubmit={handleSendPush} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label style={labelStyle}>Notification Title</label>
                        <input required placeholder="e.g. Flash Sale: 50% Off!" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Redirect Link</label>
                        <input placeholder="e.g. /shop or /product/slug" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} style={inputStyle} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Message Body</label>
                      <textarea required placeholder="Enter the message you want users to see on their phone..." rows={4} value={formData.body} onChange={e => setFormData({ ...formData, body: e.target.value })} style={{ ...inputStyle, resize: "none" }} />
                    </div>
                    <div style={{ background: HOVER, borderRadius: 14, padding: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                      <div>
                        <label style={{ ...labelStyle, color: ACCENT, display: "flex", alignItems: "center", gap: 4 }}><Target style={{ width: 11, height: 11 }} /> Target Audience</label>
                        <select value={targetType} onChange={e => setTargetType(e.target.value as any)} style={{ ...inputStyle, background: CARD, appearance: "none" }}>
                          <option value="BROADCAST">All App Users (Broadcast)</option>
                          <option value="SINGLE">Specific User ID</option>
                          <option value="BULK">Specific Order IDs (Comma separated)</option>
                          <option value="STATUS_BASED">Users with Orders by Status</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ ...labelStyle, display: "flex", alignItems: "center", gap: 4 }}><Calendar style={{ width: 11, height: 11 }} /> Schedule (Optional)</label>
                        <input type="datetime-local" value={formData.scheduledAt} onChange={e => setFormData({ ...formData, scheduledAt: e.target.value })} style={{ ...inputStyle, background: CARD }} />
                      </div>
                      {targetType === 'SINGLE' && (
                        <div style={{ gridColumn: "span 2" }}>
                          <label style={labelStyle}>User UUID</label>
                          <input required placeholder="Paste User ID here..." value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} style={{ ...inputStyle, background: CARD, fontFamily: "monospace", fontSize: 12 }} />
                        </div>
                      )}
                      {targetType === 'BULK' && (
                        <div style={{ gridColumn: "span 2" }}>
                          <label style={labelStyle}>Order IDs (Comma Separated)</label>
                          <input required placeholder="ID1, ID2, ID3..." value={formData.orderIds} onChange={e => setFormData({ ...formData, orderIds: e.target.value })} style={{ ...inputStyle, background: CARD, fontFamily: "monospace", fontSize: 12 }} />
                        </div>
                      )}
                      {targetType === 'STATUS_BASED' && (
                        <div style={{ gridColumn: "span 2" }}>
                          <label style={labelStyle}>Select Order Status</label>
                          <select value={formData.orderStatus} onChange={e => setFormData({ ...formData, orderStatus: e.target.value })} style={{ ...inputStyle, background: CARD, appearance: "none" }}>
                            <option value="PENDING">Pending Orders</option>
                            <option value="CONFIRMED">Confirmed Orders</option>
                            <option value="PROCESSING">Processing Orders</option>
                            <option value="SHIPPED">Shipped Orders</option>
                          </select>
                        </div>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="submit" disabled={loading} style={{ flex: 1, height: 52, background: ACCENT, border: "none", borderRadius: 12, color: "#0B1320", fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.06em", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, opacity: loading ? 0.7 : 1 }}>
                        {loading ? <Loader2 style={{ width: 20, height: 20 }} /> : formData.scheduledAt ? <Calendar style={{ width: 20, height: 20 }} /> : <Send style={{ width: 20, height: 20 }} />}
                        {loading ? "Processing..." : formData.scheduledAt ? "Schedule Notification" : "Push Notification Now"}
                      </button>
                      <button type="button" onClick={() => setShowPreview(true)}
                        style={{ width: 52, height: 52, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 12, color: TEXT2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Eye style={{ width: 18, height: 18 }} />
                      </button>
                    </div>
                  </form>
                )
              )}
            </div>

            {/* Best Practices Sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ ...card, padding: "20px" }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: TEXT, margin: "0 0 16px", display: "flex", alignItems: "center", gap: 8 }}>
                  <Info style={{ width: 16, height: 16, color: ACCENT }} /> Best Practices
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[
                    { title: "Multi-Device Support", body: "Notifications are automatically sent to all devices owned by the targeted users (Web, Android, iOS)." },
                    { title: "Scheduled Sending", body: "Use the Schedule field to time notifications for optimal engagement. Avoid sending at night." },
                    { title: "Personalization", body: "Keep messages short and relevant. Use the customer's name and context whenever possible." },
                    { title: "Opt-out Compliance", body: "Only send to users who have opted in to receive marketing communications." },
                  ].map((tip, i) => (
                    <div key={i} style={{ background: HOVER, borderRadius: 10, padding: "12px 14px" }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: TEXT, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{tip.title}</div>
                      <div style={{ fontSize: 11, color: TEXT2, lineHeight: 1.6 }}>{tip.body}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...card, padding: "20px" }}>
                <h3 style={{ fontSize: 13, fontWeight: 800, color: TEXT, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle style={{ width: 15, height: 15, color: "#22C55E" }} /> Channel Status
                </h3>
                {[
                  { label: "Push (Firebase)", color: "#22C55E", status: "Operational" },
                  { label: "SMS (Beem Africa)", color: "#22C55E", status: "Operational" },
                  { label: "Email (SMTP)", color: "#22C55E", status: "Operational" },
                ].map((ch, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 2 ? `1px solid ${BORDER}` : "none" }}>
                    <span style={{ fontSize: 12, color: TEXT }}>{ch.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: ch.color, background: `${ch.color}15`, padding: "2px 8px", borderRadius: 20 }}>{ch.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}