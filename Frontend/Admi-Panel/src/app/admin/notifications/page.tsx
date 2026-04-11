"use client";

import { useState } from 'react';
import { Bell, Send, Info, Loader2 } from "lucide-react";

export default function NotificationsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    url: "",
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
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title,
          body: formData.body,
          data: {
            url: formData.url || "/",
          }
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: "Notification sent successfully to all users!" });
        setFormData({ title: "", body: "", url: "" });
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ type: 'error', text: data.message || "Failed to send notification" });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "An error occurred while sending" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-[#1FA89A]/10 rounded-2xl">
          <Bell className="h-6 w-6 text-[#1FA89A]" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Push Notifications</h1>
          <p className="text-sm text-slate-500 font-medium">Send promotional messages to all app users</p>
        </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white border-2 border-slate-100 shadow-sm rounded-[2rem] overflow-hidden">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Send className="h-5 w-5" /> New Broadcast
              </h2>
              <p className="text-sm text-slate-500">This will be sent to every user who has the KRYROS app installed.</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleSend} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Notification Title</label>
                  <input 
                    placeholder="e.g. Flash Sale: 50% Off!" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Message Body</label>
                  <textarea 
                    placeholder="Enter the message you want users to see on their phone..." 
                    rows={4}
                    value={formData.body}
                    onChange={(e) => setFormData({...formData, body: e.target.value})}
                    className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Redirect URL (Optional)</label>
                  <input 
                    placeholder="e.g. /shop or /product/slug" 
                    value={formData.url}
                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-100 focus:border-[#1FA89A] outline-none transition-all"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 bg-[#1FA89A] hover:bg-[#168a7e] disabled:bg-slate-200 text-white font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[#1FA89A]/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  {loading ? "Sending..." : "Send Notification"}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info className="h-4 w-4 text-[#1FA89A]" /> Tips
            </h3>
            <ul className="space-y-3">
              <li className="text-xs text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700 block mb-1">Short & Sweet</span>
                Keep titles under 50 characters for the best display on mobile screens.
              </li>
              <li className="text-xs text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700 block mb-1">Action Oriented</span>
                Use a clear URL to redirect users directly to a product or category.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
