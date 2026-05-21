"use client";

import { useState, useEffect } from 'react';
import { Mail, Users, Send, Download, Search, Trash2, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/newsletter?type=list');
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const filteredSubscribers = subscribers.filter(s => 
    s.email.toLowerCase().includes(search.toLowerCase()) && 
    (!activeOnly || s.isActive)
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 rounded-2xl">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Newsletter Hub</h1>
            <p className="text-sm text-slate-500 font-medium">Manage your subscribers and marketing campaigns</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
            onClick={() => {
              const csv = "Email,Status,Joined Date\n" + filteredSubscribers.map(s => `${s.email},${s.isActive ? 'Active' : 'Unsubscribed'},${new Date(s.createdAt).toLocaleDateString()}`).join("\n");
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.setAttribute('hidden', '');
              a.setAttribute('href', url);
              a.setAttribute('download', 'subscribers.csv');
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Subscribers</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">{subscribers.length}</h3>
            <Users className="h-8 w-8 text-slate-100" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-400">Active</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">{subscribers.filter(s => s.isActive).length}</h3>
            <CheckCircle2 className="h-8 w-8 text-green-50" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border-2 border-slate-100 shadow-sm space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400">Unsubscribed</p>
          <div className="flex items-end justify-between">
            <h3 className="text-3xl font-black text-slate-900">{subscribers.filter(s => !s.isActive).length}</h3>
            <XCircle className="h-8 w-8 text-red-50" />
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search emails..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-xl outline-none transition-all font-medium text-sm"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div 
                className={`w-10 h-6 rounded-full relative transition-colors ${activeOnly ? 'bg-green-500' : 'bg-slate-200'}`}
                onClick={() => setActiveOnly(!activeOnly)}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${activeOnly ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Only</span>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Subscriber Email</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Joined Date</th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-slate-200" />
                  </td>
                </tr>
              ) : filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <p className="text-sm font-bold text-slate-400">No subscribers found</p>
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                          {subscriber.email[0].toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {subscriber.isActive ? (
                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest">Active</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-400 text-[10px] font-black uppercase tracking-widest">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-500">{new Date(subscriber.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
