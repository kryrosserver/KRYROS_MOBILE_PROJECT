"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Package, 
  CreditCard,
  Wallet,
  Wrench,
  FileText,
  Settings,
  BarChart3,
  Bell,
  ChevronLeft,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminSettingsProvider, useAdminSettings } from "@/providers/AdminSettingsProvider";
import { formatPrice } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users & Roles", href: "/admin/users" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: CreditCard, label: "Credit System", href: "/admin/credit" },
  { icon: Wallet, label: "Wallet & Payments", href: "/admin/wallet" },
  { icon: Wrench, label: "Services", href: "/admin/services" },
  { icon: FileText, label: "KRYROS Invoice", href: "/admin/invoice" },
  { icon: FileText, label: "CMS & Pages", href: "/admin/cms" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { companyName, logoDataUrl, unseenCount, addNotifications, markAllRead } = useAdminSettings();

  // Simple polling to surface order/payment notifications
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
    : <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">{(companyName||"K").slice(0,1)}</span></div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setMobileOpen(true)} className="text-white">
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-white font-bold">{companyName || "KRYROS"} Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button onClick={markAllRead} className="text-white relative">
              <Bell className="h-5 w-5" />
              {!!unseenCount && <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 bg-red-500 rounded-full text-[10px] flex items-center justify-center">{unseenCount}</span>}
            </button>
          </div>
          <div className="h-8 w-8 rounded-full overflow-hidden">
            {logoDataUrl ? <img src={logoDataUrl} className="h-8 w-8 object-cover" alt="Avatar" /> : <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">{(companyName||"K").slice(0,1)}</div>}
          </div>
        </div>
      </div>
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`fixed top-0 left-0 h-full bg-slate-900 z-50 transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link href="/admin" className="flex items-center gap-3">
            {logoNode}
            {sidebarOpen && <span className="text-white font-bold">{companyName || "KRYROS"}</span>}
          </Link>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block text-slate-400 hover:text-white">
            <ChevronLeft className={`h-5 w-5 transition-transform ${!sidebarOpen ? "rotate-180" : ""}`} />
          </button>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive ? "bg-green-500 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <button
            onClick={async () => {
              await fetch("/api/auth/logout", { method: "POST" });
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>
      <main className={`pt-16 lg:pt-0 transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}`}>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSettingsProvider>
      <Shell>{children}</Shell>
    </AdminSettingsProvider>
  );
}
