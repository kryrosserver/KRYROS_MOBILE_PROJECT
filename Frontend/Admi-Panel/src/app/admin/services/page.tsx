"use client";

import { useEffect, useState } from "react";
import { 
  Wrench, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Clock,
  DollarSign,
  Users,
  Star,
  Calendar,
  MapPin,
  Phone,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

type Service = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category: string;
  duration: string;
  image?: string;
  features?: string[];
  isActive: boolean;
};

const emptyForm: Partial<Service> = {
  name: "",
  slug: "",
  price: 0,
  category: "",
  duration: "",
  isActive: true,
};

const bookingsData = [
  { id: "BK001", service: "Phone Repair", customer: "John Chanda", date: "2024-01-15", time: "10:00 AM", status: "confirmed", technician: "Mike" },
  { id: "BK002", service: "iOS Setup", customer: "Mary Phiri", date: "2024-01-15", time: "11:30 AM", status: "pending", technician: null },
  { id: "BK003", service: "Laptop Repair", customer: "Peter Mwansa", date: "2024-01-15", time: "02:00 PM", status: "confirmed", technician: "John" },
  { id: "BK004", service: "Home Network Setup", customer: "Sarah Banda", date: "2024-01-16", time: "09:00 AM", status: "pending", technician: null },
  { id: "BK005", service: "Software Support", customer: "James Kunda", date: "2024-01-14", time: "03:30 PM", status: "completed", technician: "Mike" },
];

const categories = ["All", "Repairs", "Installation", "Support", "Trade-in", "Services"];
const statuses = ["All", "active", "inactive", "pending", "confirmed", "completed"];

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Service>>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/internal/admin/services", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed to load");
      setServices(Array.isArray(body) ? body : body?.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (service.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || (service.isActive ? "active" : "inactive") === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const tabs = [
    { id: "services", label: "Services", icon: Wrench, count: servicesData.length },
    { id: "bookings", label: "Bookings", icon: Calendar, count: bookingsData.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Services Management</h1>
          <p className="mt-1 text-slate-600">Configure service offerings and bookings</p>
        </div>
        <button
          onClick={() => setForm(emptyForm)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Services Tab */}
      {activeTab === "services" && (
        <>
          {/* Quick Create */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-slate-50 border border-slate-200 rounded-lg p-4">
            <input placeholder="Name" className="admin-input" value={form.name || ""} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
            <input placeholder="Slug" className="admin-input" value={form.slug || ""} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} />
            <input placeholder="Category" className="admin-input" value={form.category || ""} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
            <input placeholder="Duration" className="admin-input" value={form.duration || ""} onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))} />
            <input placeholder="Price" type="number" className="admin-input" value={form.price ?? 0} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
            <button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  const res = await fetch("/internal/admin/services", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name: form.name, slug: form.slug, category: form.category, duration: form.duration, price: form.price ?? 0, isActive: true
                    }),
                  });
                  const body = await res.json().catch(() => ({}));
                  if (!res.ok) throw new Error(body?.error || "Failed to create");
                  await load();
                  setForm(emptyForm);
                } catch (e) {
                  alert(e instanceof Error ? e.message : "Failed to create");
                } finally {
                  setSaving(false);
                }
              }}
              className="btn-primary"
            >
              {saving ? "Saving..." : "Create"}
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
              ))}
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white"
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status === "All" ? "All Status" : status}</option>
              ))}
            </select>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Wrench className="h-6 w-6 text-green-600" />
                  </div>
                  <label className="text-xs flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={service.isActive}
                      onChange={async (e) => {
                        const isActive = e.target.checked;
                        await fetch(`/internal/admin/services/${service.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ isActive }),
                        });
                        setServices(prev => prev.map(s => s.id === service.id ? { ...s, isActive } : s));
                      }}
                    />
                    <span className={service.isActive ? "text-green-600" : "text-slate-600"}>
                      {service.isActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                </div>
                
                <h3 className="font-semibold text-slate-900 mb-1">{service.name}</h3>
                <p className="text-sm text-slate-500 mb-4">{service.description || "—"}</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {Number(service.price) > 0 ? `K ${Number(service.price).toLocaleString()}` : "Free"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.duration}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div />
                </div>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={async () => {
                      if (!confirm("Delete this service?")) return;
                      const res = await fetch(`/internal/admin/services/${service.id}`, { method: "DELETE" });
                      if (res.ok) setServices(prev => prev.filter(s => s.id !== service.id));
                    }}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {loading && <div className="p-4 text-sm text-slate-500">Loading...</div>}
        </>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Booking ID</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Service</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Customer</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Date & Time</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Technician</th>
                <th className="text-left px-6 py-3 text-sm font-medium text-slate-600">Status</th>
                <th className="text-right px-6 py-3 text-sm font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bookingsData.map((booking) => (
                <tr key={booking.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">{booking.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-900">{booking.service}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-600">{booking.customer}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4" />
                      {booking.date} at {booking.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {booking.technician ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-green-600">{booking.technician[0]}</span>
                        </div>
                        <span className="text-slate-600">{booking.technician}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      booking.status === "confirmed" 
                        ? "bg-blue-100 text-blue-700"
                        : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : booking.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {booking.status === "confirmed" && <CheckCircle className="h-3 w-3" />}
                      {booking.status === "pending" && <AlertCircle className="h-3 w-3" />}
                      {booking.status === "completed" && <CheckCircle className="h-3 w-3" />}
                      {booking.status === "cancelled" && <XCircle className="h-3 w-3" />}
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Eye className="h-4 w-4 text-slate-600" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <Edit className="h-4 w-4 text-slate-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Wrench className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Services</p>
            <p className="text-xl font-bold text-slate-900">{services.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Today's Bookings</p>
            <p className="text-xl font-bold text-slate-900">12</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Active Technicians</p>
            <p className="text-xl font-bold text-slate-900">8</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4">
          <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <DollarSign className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Revenue (This Month)</p>
            <p className="text-xl font-bold text-slate-900">K 45,600</p>
          </div>
        </div>
      </div>
    </div>
  );
}
