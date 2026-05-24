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
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

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

type Booking = {
  id: string;
  user?: { id: string; firstName?: string | null; lastName?: string | null; email?: string | null };
  service?: { id: string; name: string };
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  notes?: string | null;
};

const categories = ["All", "Repairs", "Installation", "Support", "Trade-in", "Services"];
const statuses = ["All", "active", "inactive", "pending", "confirmed", "completed"];

const bookingStatusClass = (status: string) => {
  switch (status) {
    case "CONFIRMED":  return "badge-info";
    case "PENDING":    return "badge-warning";
    case "COMPLETED":  return "badge-success";
    case "CANCELLED":  return "badge-danger";
    default:           return "";
  }
};

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState("services");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Partial<Service>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [todaysBookings, setTodaysBookings] = useState(0);
  const [activeTechs, setActiveTechs] = useState(0);
  const [monthRevenue, setMonthRevenue] = useState(0);

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

  const loadBookings = async () => {
    try {
      const res = await fetch("/internal/admin/services/bookings", { cache: "no-store" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || "Failed to load bookings");
      setBookings(Array.isArray(body) ? body : body?.data || body?.items || []);
    } catch {
      setBookings([]);
    }
  };

  useEffect(() => { load(); loadBookings(); }, []);

  useEffect(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const count = bookings.filter(b => {
      const d = new Date(b.scheduledDate).toISOString().slice(0, 10);
      return d === todayIso && b.status !== "CANCELLED";
    }).length;
    setTodaysBookings(count);
  }, [bookings]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const usersRes = await fetch("/internal/admin/users", { cache: "no-store" });
        const usersBody = await usersRes.json().catch(() => ({}));
        const users = Array.isArray(usersBody) ? usersBody : usersBody?.users || usersBody?.data || [];
        if (alive) {
          setActiveTechs(users.filter((u: any) => u.isActive !== false && String(u.role || "").toLowerCase().includes("tech")).length);
        }
      } catch { if (alive) setActiveTechs(0); }
      try {
        const r = await fetch("/internal/admin/reports/summary?range=month", { cache: "no-store" });
        const body = await r.json().catch(() => ({}));
        if (alive) setMonthRevenue(Number(body?.stats?.totalRevenue || 0));
      } catch { if (alive) setMonthRevenue(0); }
    })();
    return () => { alive = false; };
  }, []);

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.description || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || service.category === selectedCategory;
    const matchesStatus = selectedStatus === "All" || (service.isActive ? "active" : "inactive") === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const tabs = [
    { id: "services", label: "Services", icon: Wrench, count: services.length },
    { id: "bookings", label: "Bookings", icon: Calendar, count: bookings.length },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Services Management</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Configure service offerings and bookings</p>
        </div>
        <button onClick={() => setForm(emptyForm)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Services", value: services.length, icon: Wrench, color: "bg-teal-50 text-[#12D6C5]" },
          { label: "Today's Bookings", value: todaysBookings, icon: Calendar, color: "bg-blue-50 text-blue-600" },
          { label: "Active Technicians", value: activeTechs, icon: Users, color: "bg-purple-50 text-purple-600" },
          { label: "Revenue (Month)", value: formatPrice(monthRevenue), icon: DollarSign, color: "bg-amber-50 text-amber-600" },
        ].map((s, i) => (
          <div key={i} className="admin-card !p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{s.label}</p>
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 border-b-2 transition-colors whitespace-nowrap text-sm font-medium ${
                activeTab === tab.id
                  ? "border-[#12D6C5] text-[#12D6C5]"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className="ml-1 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Services Tab */}
      {activeTab === "services" && (
        <div className="space-y-5">
          {/* Quick Create */}
          <div className="admin-card bg-slate-50/50">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Create Service</p>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <input placeholder="Name" className="admin-input" value={form.name || ""} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              <input placeholder="Slug" className="admin-input" value={form.slug || ""} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} />
              <input placeholder="Category" className="admin-input" value={form.category || ""} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
              <input placeholder="Duration (e.g. 1h)" className="admin-input" value={form.duration || ""} onChange={(e) => setForm(f => ({ ...f, duration: e.target.value }))} />
              <input placeholder="Price" type="number" className="admin-input" value={form.price ?? 0} onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))} />
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    const res = await fetch("/internal/admin/services", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ name: form.name, slug: form.slug, category: form.category, duration: form.duration, price: form.price ?? 0, isActive: true }),
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
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="admin-input pl-10" />
            </div>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="admin-input !w-auto">
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
              ))}
            </select>
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="admin-input !w-auto">
              {statuses.map(status => (
                <option key={status} value={status}>{status === "All" ? "All Status" : status}</option>
              ))}
            </select>
          </div>

          {/* Services Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="admin-card h-48 animate-pulse" />)}
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="admin-card flex flex-col items-center justify-center py-16 text-slate-400">
              <Wrench className="h-12 w-12 text-slate-100 mb-3" />
              <p className="text-sm font-semibold">No services found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <div key={service.id} className="admin-card hover:shadow-lg hover:border-[#12D6C5]/30 transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-11 w-11 bg-teal-50 rounded-xl flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-[#12D6C5]" />
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={service.isActive}
                        className="accent-[#12D6C5] h-4 w-4"
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
                      <span className={`text-xs font-semibold ${service.isActive ? "text-[#12D6C5]" : "text-slate-400"}`}>
                        {service.isActive ? "Active" : "Inactive"}
                      </span>
                    </label>
                  </div>

                  <h3 className="font-bold text-slate-900 mb-1">{service.name}</h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">{service.description || "No description"}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {Number(service.price) > 0 ? formatPrice(Number(service.price)) : "Free"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {service.duration}
                    </span>
                    <span className="badge badge-info text-[10px] capitalize">{service.category}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={async () => {
                        const name = prompt("Name", service.name) || service.name;
                        const price = Number(prompt("Price", String(service.price)) || service.price);
                        const duration = prompt("Duration", service.duration) || service.duration;
                        const category = prompt("Category", service.category) || service.category;
                        const res = await fetch(`/internal/admin/services/${service.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ name, price, duration, category }),
                        });
                        if (res.ok) await load();
                      }}
                      className="btn-secondary !h-8 !px-3 flex items-center gap-1 !text-xs"
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm("Delete this service?")) return;
                        const res = await fetch(`/internal/admin/services/${service.id}`, { method: "DELETE" });
                        if (res.ok) setServices(prev => prev.filter(s => s.id !== service.id));
                      }}
                      className="h-8 w-8 rounded-lg border border-red-100 bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all ml-auto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="admin-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Service</th>
                  <th>Customer</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400">No bookings found.</td>
                  </tr>
                ) : bookings.map((booking) => {
                  const customer =
                    (booking.user?.firstName || booking.user?.lastName)
                      ? `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim()
                      : booking.user?.email || "Unknown";
                  const dateStr = new Date(booking.scheduledDate).toISOString().slice(0, 10);
                  return (
                    <tr key={booking.id}>
                      <td>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {booking.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td><span className="text-slate-900">{booking.service?.name || "—"}</span></td>
                      <td><span className="text-slate-600">{customer}</span></td>
                      <td>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {dateStr} at {booking.scheduledTime}
                        </div>
                      </td>
                      <td>
                        <span className={`badge inline-flex items-center gap-1 ${bookingStatusClass(booking.status)}`}>
                          {booking.status === "CONFIRMED" && <CheckCircle className="h-3 w-3" />}
                          {booking.status === "PENDING" && <AlertCircle className="h-3 w-3" />}
                          {booking.status === "COMPLETED" && <CheckCircle className="h-3 w-3" />}
                          {booking.status === "CANCELLED" && <XCircle className="h-3 w-3" />}
                          {booking.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <Eye className="h-4 w-4 text-slate-500" />
                          </button>
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                            <Edit className="h-4 w-4 text-slate-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
