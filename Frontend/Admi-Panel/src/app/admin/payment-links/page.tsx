"use client";

import { useState } from "react";
import { Plus, Link as LinkIcon, Copy, Check, Trash2, ExternalLink, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";

interface PaymentLink {
  id: string;
  amount: number;
  description: string;
  createdAt: string;
  status: "ACTIVE" | "PAID" | "EXPIRED";
}

export default function PaymentLinksPage() {
  const [links, setLinks] = useState<PaymentLink[]>([
    { id: "PAY-123", amount: 500, description: "Consultation Fee", createdAt: new Date().toISOString(), status: "ACTIVE" },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [newLink, setNewLink] = useState({ amount: "", description: "" });
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = () => {
    const link: PaymentLink = {
      id: `PAY-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      amount: parseFloat(newLink.amount),
      description: newLink.description,
      createdAt: new Date().toISOString(),
      status: "ACTIVE",
    };
    setLinks([link, ...links]);
    setNewLink({ amount: "", description: "" });
    setIsCreating(false);
  };

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin.replace("admin.", "")}/pay/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payment Links</h1>
          <p className="text-slate-500">Generate secure, locked-amount payment links for clients</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="bg-[#1e293b] text-white flex items-center gap-2">
          <Plus className="h-4 w-4" /> Create Link
        </Button>
      </div>

      {isCreating && (
        <div className="bg-white p-8 rounded-2xl border-2 border-primary/20 shadow-xl animate-in fade-in slide-in-from-top-4">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Generate New Payment Link</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Locked Amount (ZMW)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  type="number" 
                  placeholder="0.00" 
                  value={newLink.amount}
                  onChange={(e) => setNewLink({...newLink, amount: e.target.value})}
                  className="pl-10 h-12 rounded-xl"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400">Description / Purpose</label>
              <Input 
                placeholder="e.g. Custom Order #552" 
                value={newLink.description}
                onChange={(e) => setNewLink({...newLink, description: e.target.value})}
                className="h-12 rounded-xl"
              />
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <Button onClick={handleCreate} disabled={!newLink.amount} className="bg-primary flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-xs">
              Generate Link
            </Button>
            <Button variant="outline" onClick={() => setIsCreating(false)} className="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-xs border-slate-200">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Reference</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Created</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{link.id}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{link.description}</td>
                  <td className="px-6 py-4 font-black text-primary">{formatPrice(link.amount)}</td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{new Date(link.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      link.status === "ACTIVE" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"
                    }`}>
                      {link.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => copyToClipboard(link.id)}
                        className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${
                          copiedId === link.id ? "bg-green-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {copiedId === link.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        {copiedId === link.id ? "Copied" : "Copy Link"}
                      </button>
                      <button className="p-2 bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500 rounded-lg transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
