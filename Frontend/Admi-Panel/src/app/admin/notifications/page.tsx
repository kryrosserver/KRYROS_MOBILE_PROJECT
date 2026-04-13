"use client";

import { useState, useEffect } from 'react';
import { Bell, Send, Info, Loader2, Calendar, Target, Users, Package, Eye } from "lucide-react";

export default function NotificationsPage() {
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

  const handleSend = async (e: React.FormEvent) => {
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

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#1FA89A]/10 rounded-2xl">
            <Bell className="h-6 w-6 text-[#1FA89A]" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Notification Center</h1>
            <p className="text-sm text-slate-500 font-medium">Create, target, and schedule push notifications</p>
          </div>
        </div>
        <button 
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
        >
          <Eye className="h-4 w-4" />
          {showPreview ? "Edit Mode" : "Preview Notification"}
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div className="bg-white border-2 border-slate-100 shadow-sm rounded-[2.5rem] overflow-hidden">
            {showPreview ? (
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
              <form onSubmit={handleSend} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border-2 border-slate-50">
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
                    <div className="md:col-span-2 space-y-2 animate-in slide-in-from-left-2">
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
                    <div className="md:col-span-2 space-y-2 animate-in slide-in-from-left-2">
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
                    <div className="md:col-span-2 space-y-2 animate-in slide-in-from-left-2">
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

        <div className="lg:col-span-4 space-y-6">
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
  );
}
