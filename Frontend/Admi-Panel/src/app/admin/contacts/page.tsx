"use client";

import { useState } from "react";
import { Plus, Search, Mail, Phone, MapPin, MoreVertical, Edit2, Trash2, Users } from "lucide-react";
import { useInvoiceStore, Client } from "@/providers/InvoiceStore";

export default function ContactsPage() {
  const { clients, addClient } = useInvoiceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [newClient, setNewClient] = useState<Omit<Client, "id">>({ name: "", email: "", address: "" });

  const handleAdd = () => {
    if (!newClient.name) return;
    addClient(newClient);
    setNewClient({ name: "", email: "", address: "" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Client / Supplier</h1>
          <p className="text-slate-500">Manage your business contacts and partners</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-[#1e293b] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Contact
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900">Add New Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              placeholder="Name" 
              className="admin-input" 
              value={newClient.name} 
              onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} 
            />
            <input 
              placeholder="Email" 
              className="admin-input" 
              value={newClient.email} 
              onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} 
            />
            <input 
              placeholder="Address" 
              className="admin-input" 
              value={newClient.address} 
              onChange={(e) => setNewClient({ ...newClient, address: e.target.value })} 
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 text-slate-500 font-medium">Cancel</button>
            <button onClick={handleAdd} className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold">Save Contact</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.length > 0 ? (
          clients.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-lg uppercase">
                  {c.name.slice(0, 2)}
                </div>
                <button className="p-1 text-slate-300 group-hover:text-slate-500"><MoreVertical className="h-5 w-5" /></button>
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-slate-900 text-lg">{c.name}</h3>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Mail className="h-3.5 w-3.5" /> {c.email || "No email provided"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5" /> {c.address || "No address provided"}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-50">
                <button className="flex-1 text-xs font-bold text-slate-600 py-2 hover:bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center gap-2">
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
                <button className="flex-1 text-xs font-bold text-red-500 py-2 hover:bg-red-50 rounded-lg border border-red-50 flex items-center justify-center gap-2">
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 bg-white rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center gap-3">
            <Users className="h-12 w-12 text-slate-200" />
            <p className="text-slate-500">No contacts found. Add your first client or supplier!</p>
          </div>
        )}
      </div>
    </div>
  );
}
