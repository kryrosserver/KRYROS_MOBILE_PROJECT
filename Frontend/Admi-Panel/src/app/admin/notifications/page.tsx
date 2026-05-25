"use client";

import { useState, useEffect, useRef } from 'react';
import { Bell, Send, Info, Loader2, Calendar, Target, Users, Package, Eye, MessageSquare, Mail, Search, Sun, Moon, Menu, ChevronDown } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";

export default function NotificationsPage() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf: number;
    function applyHeight(nextScale: number) { if (!innerRef.current || !outerRef.current) return; outerRef.current.style.height = "auto"; const naturalH = innerRef.current.scrollHeight; const visualH = naturalH * nextScale; const isMobile = window.innerWidth < 1024; const screenAvail = isMobile ? window.innerHeight - 64 : Infinity; outerRef.current.style.height = `${visualH}px`; }
    function recalc() { if (!innerRef.current || !outerRef.current) return; const vw = outerRef.current.offsetWidth || window.innerWidth; const baseW = vw < 960 ? 750 : 1380; const nextScale = Math.min(1, vw / baseW); innerRef.current.style.width = `${baseW}px`; innerRef.current.style.transform = `scale(${nextScale})`; innerRef.current.style.transformOrigin = "top left"; cancelAnimationFrame(raf); raf = requestAnimationFrame(() => requestAnimationFrame(() => applyHeight(nextScale))); }
    recalc(); const t = setTimeout(recalc, 400); window.addEventListener("resize", recalc); return () => { window.removeEventListener("resize", recalc); cancelAnimationFrame(raf); clearTimeout(t); };
  }, []);
  const [activeTab, setActiveTab] = useState<'PUSH' | 'SMS' | 'EMAIL'>('PUSH');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [targetType, setTargetType] = useState<'BROADCAST' | 'SINGLE' | 'BULK' | 'STATUS_BASED'>('BROADCAST');
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    url: "/",
    userId: "",
    orderIds: "",
    orderStatus: "PENDING",
    scheduledAt: "",
  });

  const [smsFormData, setSmsFormData] = useState({
    message: "",
    phoneNumbers: "",
    scheduledAt: "",
  });

  const [emailFormData, setEmailFormData] = useState({
    email: "",
    subject: "KRYROS Update",
    message: "",
  });

  const handleSendPush = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.body) {
      setMessage({ type: 'error', text: "Please fill in both title and message" });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const payload: any = {
        title: formData.title,
        body: formData.body,
        targetType: targetType === 'BROADCAST' ? 'BULK' : targetType,
        data: { url: formData.url },
      };

      if (formData.scheduledAt) payload.scheduledAt = formData.scheduledAt;
      if (targetType === 'SINGLE') payload.userId = formData.userId;
      if (targetType === 'BULK') payload.orderIds = formData.orderIds.split(',').map(id => id.trim());
      if (targetType === 'STATUS_BASED') payload.orderStatus = formData.orderStatus;

      // Call our local proxy API instead of the backend directly
      const type = targetType === 'BROADCAST' ? 'broadcast' : 'send';
      const res = await fetch(`/api/admin/notifications?type=${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage({ 
          type: 'success', 
          text: formData.scheduledAt 
            ? "Notification scheduled successfully!" 
            : "Notification sent successfully!" 
        });
        setFormData({ ...formData, title: "", body: "", scheduledAt: "" });
        setShowPreview(false);
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: data.message || "Failed to process request" });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "An error occurred" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsFormData.message || !smsFormData.phoneNumbers) {
      setMessage({ type: 'error', text: "Please provide message and phone numbers" });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const numbersArray = smsFormData.phoneNumbers.split(',').map(n => n.trim()).filter(Boolean);
      
      const res = await fetch(`/api/admin/notifications?type=sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: numbersArray[0],
          message: smsFormData.message
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: "SMS sent successfully via Beem Africa!" });
        setSmsFormData({ message: "", phoneNumbers: "", scheduledAt: "" });
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: data.message || "Failed to send SMS" });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "An error occurred while sending SMS" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailFormData.email || !emailFormData.message) {
      setMessage({ type: 'error', text: "Please provide recipient email and message" });
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/notifications?type=email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailFormData),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: "Test email sent successfully via Gmail SMTP!" });
        setEmailFormData({ ...emailFormData, message: "" });
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: data.message || "Failed to send test email" });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "An error occurred while sending email" });
    } finally {
      setLoading(false);
    }
  };

  const { isDark, toggleTheme } = useTheme();

  return (
    <div ref={outerRef} style={{ overflow: "hidden", background: "var(--bg-primary)", margin: "-24px", width: "calc(100% + 48px)" }}>
      <div ref={innerRef} style={{ background: "var(--bg-primary)", color: "var(--text-primary)", display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <header style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--card-border)", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}><Menu style={{ width: 20, height: 20 }} /></button>
            <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap", margin: 0 }}>Notification Center</h1>
          </div>
          <div style={{ flex: 1, maxWidth: 340, position: "relative" }}>
            <Search style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)", width: 15, height: 15 }} />
            <input placeholder="Search..." style={{ width: "100%", background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "8px 40px 8px 36px", color: "var(--text-primary)", fontSize: 13, outline: "none" }} />
            <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: "var(--text-secondary)", background: "var(--icon-bg)", padding: "2px 5px", borderRadius: 4 }}>⌘K</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>
              <Bell style={{ width: 20, height: 20 }} />
              <span style={{ position: "absolute", top: 0, right: 0, background: "#EF4444", borderRadius: "50%", width: 16, height: 16, fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>1</span>
            </button>
            <button onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 4 }}>{isDark ? <Sun style={{ width: 20, height: 20 }} /> : <Moon style={{ width: 20, height: 20 }} />}</button>
            <button style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--card-bg)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "7px 14px", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer", whiteSpace: "nowrap" }}>
              <Calendar style={{ width: 14, height: 14 }} /> May 20 – May 26, 2025 <ChevronDown style={{ width: 13, height: 13 }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#12D6C5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#0B1320" }}>K</div>
              <div><div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1 }}>Admin</div><div style={{ fontSize: 10, color: "var(--text-secondary)", marginTop: 1 }}>Super Admin</div></div>
              <ChevronDown style={{ width: 14, height: 14, color: "var(--text-secondary)" }} />
            </div>
          </div>
        </header>
        <div className="max-w-5xl mx-auto space-y-6" style={{ padding: "20px", width: "100%" }}>

      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('PUSH')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-widest transition-colors ${
            activeTab === 'PUSH' ? 'text-[#1FA89A] border-b-2 border-[#1FA89A]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Bell className="h-4 w-4" /> Push Notifications
        </button>
        <button
          onClick={() => setActiveTab('SMS')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-widest transition-colors ${
            activeTab === 'SMS' ? 'text-[#1FA89A] border-b-2 border-[#1FA89A]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <MessageSquare className="h-4 w-4" /> SMS (Beem Africa)
        </button>
        <button
          onClick={() => setActiveTab('EMAIL')}
          className={`flex items-center gap-2 px-6 py-3 font-bold text-sm uppercase tracking-widest transition-colors ${
            activeTab === 'EMAIL' ? 'text-[#1FA89A] border-b-2 border-[#1FA89A]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Mail className="h-4 w-4" /> Email (SMTP)
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-100 text-green-700' 
            : 'bg-red-50 border-red-100 text-red-700'
        } flex items-center gap-3 animate-in fade-in slide-in-from-top-2`}>
          <Info className="h-5 w-5 shrink-0" />
          <p className="text-sm font-bold">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8">
          <div className="bg-white border-2 border-slate-100 shadow-sm rounded-[2.5rem] overflow-hidden">
            {activeTab === 'EMAIL' ? (
              <form onSubmit={handleSendEmail} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recipient Email</label>
                  <input 
                    required
                    type="email"
                    placeholder="Enter recipient email address..." 
                    value={emailFormData.email}
                    onChange={(e) => setEmailFormData({...emailFormData, email: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</label>
                  <input 
                    required
                    placeholder="Enter email subject..." 
                    value={emailFormData.subject}
                    onChange={(e) => setEmailFormData({...emailFormData, subject: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-bold"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Message</label>
                  <textarea 
                    required
                    placeholder="Enter the email content..." 
                    rows={6}
                    value={emailFormData.message}
                    onChange={(e) => setEmailFormData({...emailFormData, message: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all resize-none font-medium"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 bg-[#1FA89A] hover:bg-[#168a7e] disabled:bg-slate-200 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#1FA89A]/20 transition-all flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Mail className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  )}
                  {loading ? "Sending..." : "Send Test Email"}
                </button>
              </form>
            ) : activeTab === 'SMS' ? (
              <form onSubmit={handleSendSms} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Phone Numbers</label>
                  <textarea 
                    required
                    placeholder="Enter phone numbers separated by comma (e.g. 255700000001, 255700000011)..." 
                    rows={2}
                    value={smsFormData.phoneNumbers}
                    onChange={(e) => setSmsFormData({...smsFormData, phoneNumbers: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-mono text-sm"
                  />
                  <p className="text-[10px] text-slate-500 font-medium">Use international format without '+' (e.g., 255 for Tanzania, 234 for Nigeria)</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message Body</label>
                  <textarea 
                    required
                    placeholder="Enter the SMS message..." 
                    rows={4}
                    value={smsFormData.message}
                    onChange={(e) => setSmsFormData({...smsFormData, message: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all resize-none font-medium"
                  />
                  <div className="flex justify-end">
                    <span className={`text-xs font-bold ${smsFormData.message.length > 160 ? 'text-red-500' : 'text-slate-400'}`}>
                      {smsFormData.message.length} / 160 chars
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border-2 border-slate-50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> Schedule (Optional)
                    </label>
                    <input 
                      type="datetime-local"
                      value={smsFormData.scheduledAt}
                      onChange={(e) => setSmsFormData({...smsFormData, scheduledAt: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border-2 border-white bg-white focus:border-[#1FA89A] outline-none transition-all font-bold text-sm"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 bg-[#1FA89A] hover:bg-[#168a7e] disabled:bg-slate-200 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#1FA89A]/20 transition-all flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  )}
                  {loading ? "Sending..." : "Send SMS"}
                </button>
              </form>
            ) : showPreview ? (
              <div className="p-12 flex flex-col items-center justify-center space-y-8 bg-slate-50/50 min-h-[400px]">
                <div className="w-full max-w-xs bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                    <div className="h-8 w-8 bg-[#1FA89A] rounded-lg flex items-center justify-center">
                      <span className="text-white font-black text-xs">K</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400">Kryros Mobile</p>
                      <p className="text-[8px] text-slate-400">Now</p>
                    </div>
                  </div>
                  <div className="p-5 space-y-1">
                    <h3 className="font-black text-slate-900 text-sm leading-tight">{formData.title || "Notification Title"}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{formData.body || "This is how your message will appear on customer phones."}</p>
                  </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Simulated Mobile Preview</p>
              </div>
            ) : (
              <form onSubmit={handleSendPush} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Notification Title</label>
                    <input 
                      required
                      placeholder="e.g. Flash Sale: 50% Off!" 
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Redirect Link</label>
                    <input 
                      placeholder="e.g. /shop or /product/slug" 
                      value={formData.url}
                      onChange={(e) => setFormData({...formData, url: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message Body</label>
                  <textarea 
                    required
                    placeholder="Enter the message you want users to see on their phone..." 
                    rows={4}
                    value={formData.body}
                    onChange={(e) => setFormData({...formData, body: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all resize-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border-2 border-slate-50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#1FA89A] flex items-center gap-2">
                      <Target className="h-3 w-3" /> Target Audience
                    </label>
                    <select 
                      value={targetType}
                      onChange={(e) => setTargetType(e.target.value as any)}
                      className="w-full h-12 px-4 rounded-xl border-2 border-white bg-white focus:border-[#1FA89A] outline-none transition-all font-bold text-sm"
                    >
                      <option value="BROADCAST">All App Users (Broadcast)</option>
                      <option value="SINGLE">Specific User ID</option>
                      <option value="BULK">Specific Order IDs (Comma separated)</option>
                      <option value="STATUS_BASED">Users with Orders by Status</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> Schedule (Optional)
                    </label>
                    <input 
                      type="datetime-local"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData({...formData, scheduledAt: e.target.value})}
                      className="w-full h-12 px-4 rounded-xl border-2 border-white bg-white focus:border-[#1FA89A] outline-none transition-all font-bold text-sm"
                    />
                  </div>

                  {targetType === 'SINGLE' && (
                    <div className="col-span-2 space-y-2 animate-in slide-in-from-left-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">User UUID</label>
                      <input 
                        required
                        placeholder="Paste User ID here..." 
                        value={formData.userId}
                        onChange={(e) => setFormData({...formData, userId: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border-2 border-white bg-white focus:border-[#1FA89A] outline-none transition-all font-mono text-xs"
                      />
                    </div>
                  )}

                  {targetType === 'BULK' && (
                    <div className="col-span-2 space-y-2 animate-in slide-in-from-left-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order IDs (Comma Separated)</label>
                      <input 
                        required
                        placeholder="ID1, ID2, ID3..." 
                        value={formData.orderIds}
                        onChange={(e) => setFormData({...formData, orderIds: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border-2 border-white bg-white focus:border-[#1FA89A] outline-none transition-all font-mono text-xs"
                      />
                    </div>
                  )}

                  {targetType === 'STATUS_BASED' && (
                    <div className="col-span-2 space-y-2 animate-in slide-in-from-left-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Order Status</label>
                      <select 
                        value={formData.orderStatus}
                        onChange={(e) => setFormData({...formData, orderStatus: e.target.value})}
                        className="w-full h-12 px-4 rounded-xl border-2 border-white bg-white focus:border-[#1FA89A] outline-none transition-all font-bold text-sm"
                      >
                        <option value="PENDING">Pending Orders</option>
                        <option value="CONFIRMED">Confirmed Orders</option>
                        <option value="PROCESSING">Processing Orders</option>
                        <option value="SHIPPED">Shipped Orders</option>
                      </select>
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 bg-[#1FA89A] hover:bg-[#168a7e] disabled:bg-slate-200 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[#1FA89A]/20 transition-all flex items-center justify-center gap-3 group"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : formData.scheduledAt ? (
                    <Calendar className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  ) : (
                    <Send className="h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  )}
                  {loading ? "Processing..." : formData.scheduledAt ? "Schedule Notification" : "Push Notification Now"}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6">
            <h3 className="font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Info className="h-5 w-5 text-[#1FA89A]" /> Best Practices
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Multi-Device Support</p>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Notifications are automatically sent to all devices owned by the targeted users (Web, Android, iOS).</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Intelligent Cleanup</p>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Our system automatically detects and removes invalid or expired FCM tokens to maintain high delivery rates.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl space-y-1">
                <p className="text-xs font-black text-slate-700 uppercase tracking-tight">Scheduling</p>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Scheduled messages are processed every minute by our automated worker service.</p>
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
