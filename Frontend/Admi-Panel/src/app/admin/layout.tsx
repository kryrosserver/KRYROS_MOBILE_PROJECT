"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Package, 
  CreditCard,
  LayoutGrid,
  Tag,
  Wallet,
  Wrench,
  FileText,
  Settings,
  BarChart3,
  Bell,
  ChevronLeft,
  LogOut,
  Menu,
  X,
  Globe,
  Map as MapIcon,
  Store,
  MessageSquare
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminSettingsProvider, useAdminSettings } from "@/providers/AdminSettingsProvider";
import { formatPrice } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users & Roles", href: "/admin/users" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: LayoutGrid, label: "Categories", href: "/admin/categories" },
  { icon: Tag, label: "Brands", href: "/admin/brands" },
  { icon: MessageSquare, label: "Reviews", href: "/admin/reviews" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: Store, label: "Wholesale", href: "/admin/wholesale" },
  { icon: CreditCard, label: "Credit System", href: "/admin/credit" },
  { icon: Wallet, label: "Wallet & Payments", href: "/admin/wallet" },
  { icon: Globe, label: "Countries / Currencies", href: "/admin/countries" },
  { icon: MapIcon, label: "Locations & Shipping", href: "/admin/locations-shipping" },
  { icon: Wrench, label: "Services", href: "/admin/services" },
  { icon: FileText, label: "Invoicing", href: "/admin/invoice" },
  { icon: FileText, label: "CMS & Pages", href: "/admin/cms" },
  { icon: Bell, label: "Notifications", href: "/admin/notifications" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { companyName, logoDataUrl, unseenCount, addNotifications, markAllRead } = useAdminSettings();

  useEffect(() => {
    let alive = true;
    async function poll() {
      try {
        const [ordersRes, txRes] = await Promise.allSettled([
          fetch("/internal/admin/orders", { cache: "no-store" }),
          fetch("/internal/admin/wallets/transactions", { cache: "no-store" }),
        ]);
        const items: any[] = [];
        if (ordersRes.status === "fulfilled" && ordersRes.value.ok) {
          const data = await ordersRes.value.json().catch(() => []);
          const arr = Array.isArray(data) ? data : data?.data || [];
          arr.slice(0,5).forEach((o: any) => items.push({
            id: `order-${o.id}`,
            type: "order",
            title: `Order ${o.orderNumber || o.id}`,
            message: `${o.status} • ${formatPrice(Number(o.total || 0))}`,
            date: o.createdAt || new Date().toISOString(),
            seen: false,
          }));
        }
        if (txRes.status === "fulfilled" && txRes.value.ok) {
          const data = await txRes.value.json().catch(() => []);
          const arr = Array.isArray(data) ? data : data?.data || data?.items || [];
          arr.slice(0,5).forEach((t: any) => items.push({
            id: `txn-${t.id}`,
            type: "payment",
            title: `Payment ${t.reference || t.id}`,
            message: `${t.status || ""} • ${formatPrice(Number(t.amount || 0))}`,
            date: t.createdAt || new Date().toISOString(),
            seen: false,
          }));
        }
        if (alive && items.length) addNotifications(items as any);
      } catch {}
    }
    poll();
    const int = setInterval(poll, 60000);
    return () => { alive = false; clearInterval(int); };
  }, [addNotifications]);

  const logoNode = logoDataUrl
    ? <img src={logoDataUrl} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
    : (
      <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #12D6C5, #0e9e91)' }}>
        <span className="text-white font-bold text-sm">{(companyName || "K").slice(0, 1)}</span>
      </div>
    );

  return (
    <div className="min-h-screen" style={{ background: '#F7F9FC' }}>
      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 h-16 z-40 flex items-center justify-between px-4"
        style={{ background: '#0B1320', borderBottom: '1px solid #2B3648' }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="transition-colors"
            style={{ color: '#AAB4C5' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#AAB4C5')}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            {logoNode}
            <span className="text-white font-bold text-sm">{companyName || "KRYROS"}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={markAllRead} className="relative" style={{ color: '#AAB4C5' }}>
              <Bell className="h-5 w-5" />
              {!!unseenCount && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white">
                  {unseenCount}
                </span>
              )}
            </button>
          </div>
          <div className="h-8 w-8 rounded-full overflow-hidden">
            {logoDataUrl
              ? <img src={logoDataUrl} className="h-8 w-8 object-cover" alt="Avatar" />
              : (
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#12D6C5' }}>
                  {(companyName || "K").slice(0, 1)}
                </div>
              )
            }
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(11,19,32,0.75)', backdropFilter: 'blur(4px)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: '#0B1320', borderRight: '1px solid #2B3648' }}
      >
        {/* Sidebar header */}
        <div
          className="h-16 flex items-center justify-between px-4 shrink-0"
          style={{ borderBottom: '1px solid #2B3648' }}
        >
          <Link href="/admin" className="flex items-center gap-3 min-w-0">
            {logoNode}
            {sidebarOpen && (
              <div className="min-w-0">
                <span className="text-white font-bold text-sm block truncate">{companyName || "KRYROS"}</span>
                <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#12D6C5' }}>
                  Admin Portal
                </span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex items-center justify-center h-7 w-7 rounded-lg transition-colors shrink-0"
            style={{ color: '#AAB4C5' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#182131'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#AAB4C5'; }}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden flex items-center justify-center h-7 w-7 rounded-lg transition-colors"
            style={{ color: '#AAB4C5' }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative"
                style={{
                  background: isActive ? 'rgba(18,214,197,0.12)' : 'transparent',
                  color: isActive ? '#12D6C5' : '#AAB4C5',
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#182131';
                    e.currentTarget.style.color = '#FFFFFF';
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#AAB4C5';
                  }
                }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                    style={{ background: '#12D6C5' }}
                  />
                )}
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && (
                  <span className="text-sm font-medium truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer — logout */}
        <div className="px-3 pb-4 shrink-0" style={{ borderTop: '1px solid #2B3648', paddingTop: '12px' }}>
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl transition-all"
            style={{ color: '#AAB4C5' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#182131'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#AAB4C5'; }}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`pt-16 lg:pt-0 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

import { InvoiceStoreProvider } from "@/providers/InvoiceStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSettingsProvider>
      <InvoiceStoreProvider>
        <Shell>{children}</Shell>
      </InvoiceStoreProvider>
    </AdminSettingsProvider>
  );
}
