"use client";

import { useState } from "react";
import { Plus, Search, Mail, MapPin, Edit2, Trash2, Users, MoreVertical } from "lucide-react";
import { useInvoiceStore, Client } from "@/providers/InvoiceStore";

export default function ContactsPage() {
  const { clients, addClient } = useInvoiceStore();
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newClient, setNewClient] = useState<Omit<Client, "id">>({ name: "", email: "", address: "" });

  const handleAdd = () => {
    if (!newClient.name) return;
    addClient(newClient);
    setNewClient({ name: "", email: "", address: "" });
    setShowAdd(false);
  };

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20" style={{ color: "var(--text-primary)" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Client / Supplier</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Manage your business contacts and partners
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Contact
        </button>
      </div>

      {/* Add Contact Form */}
      {showAdd && (
        <div className="admin-card space-y-4">
          <h3 className="font-bold" style={{ color: "var(--text-primary)" }}>Add New Contact</h3>
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
            <button onClick={() => setShowAdd(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleAdd} className="btn-primary">Save Contact</button>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        />
        <input
          placeholder="Search contacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="admin-input pl-10 w-full"
        />
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length > 0 ? (
          filtered.map((c) => (
            <div
              key={c.id}
              className="admin-card group transition-all duration-200"
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ""; }}
            >
              <div className="flex items-start justify-between">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg uppercase"
                  style={{ background: "var(--icon-bg)", color: "var(--text-secondary)" }}
                >
                  {c.name.slice(0, 2)}
                </div>
                <button
                  className="p-1 rounded-lg transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4">
                <h3 className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>{c.name}</h3>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <Mail className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                    {c.email || "No email provided"}
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                    <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: "var(--text-muted)" }} />
                    {c.address || "No address provided"}
                  </div>
                </div>
              </div>
              <div
                className="mt-4 flex items-center gap-2 pt-4"
                style={{ borderTop: "1px solid var(--card-border)" }}
              >
                <button
                  className="flex-1 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  style={{ color: "var(--text-secondary)", border: "1px solid var(--card-border)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--hover-bg)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <Edit2 className="h-3 w-3" /> Edit
                </button>
                <button
                  className="flex-1 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  style={{ color: "#EF4444", border: "1px solid rgba(239,68,68,0.2)" }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <Trash2 className="h-3 w-3" /> Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            className="col-span-full py-20 rounded-xl flex flex-col items-center justify-center gap-3"
            style={{
              border: "2px dashed var(--card-border)",
              background: "var(--hover-bg)"
            }}
          >
            <Users className="h-12 w-12 opacity-20" style={{ color: "var(--text-muted)" }} />
            <p className="font-semibold text-sm" style={{ color: "var(--text-muted)" }}>
              No contacts yet
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Add your first client or supplier to get started
            </p>
            <button onClick={() => setShowAdd(true)} className="btn-primary mt-2 flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Contact
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
