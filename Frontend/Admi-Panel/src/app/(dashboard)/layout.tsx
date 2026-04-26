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
  X,
  MessageSquare
} from "lucide-react";
import { useState } from "react";
import { MobilePreviewToggle } from "@/components/MobilePreviewToggle";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users & Roles", href: "/admin/users" },
  { icon: ShoppingBag, label: "Orders", href: "/admin/orders" },
  { icon: Package, label: "Products", href: "/admin/products" },
  { icon: MessageSquare, label: "Reviews", href: "/admin/reviews" },
  { icon: Users, label: "Wholesale", href: "/admin/wholesale" },
  { icon: CreditCard, label: "Credit System", href: "/admin/credit" },
  { icon: Wallet, label: "Wallet & Payments", href: "/admin/wallet" },
  { icon: Wrench, label: "Services", href: "/admin/services" },
  { icon: FileText, label: "CMS & Pages", href: "/admin/cms" },
  { icon: BarChart3, label: "Reports", href: "/admin/reports" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 z-40 flex items-center justify-between px-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileOpen(true)} 
            className="text-white p-2 -ml-2 hover:bg-slate-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-white font-bold text-lg">KRYROS</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="text-white relative p-2 hover:bg-slate-800 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center">3</span>
          </button>
          <div className="h-9 w-9 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" 
          onClick={() => setMobileOpen(false)} 
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed top-0 left-0 h-full bg-slate-900 z-50 transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-64" : "w-20"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          flex flex-col
        `}
        aria-label="Sidebar navigation"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">K</span>
            </div>
            {sidebarOpen && <span className="text-white font-bold text-lg">KRYROS</span>}
          </Link>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="hidden lg:block text-slate-400 hover:text-white p-2 -mr-2 rounded-lg hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${!sidebarOpen ? "rotate-180" : ""}`} />
          </button>
          <button 
            onClick={() => setMobileOpen(false)} 
            className="lg:hidden text-slate-400 hover:text-white p-2 -mr-2 rounded-lg hover:bg-slate-800 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg transition-all
                  min-h-[44px]
                  ${isActive 
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <button className="flex items-center gap-3 px-3 py-3 w-full rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors min-h-[44px]">
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`
        pt-16 lg:pt-0 transition-all duration-300 ease-in-out
        ${sidebarOpen ? "lg:ml-64" : "lg:ml-20"}
      `}>
        <div className="p-4 md:p-6">
          {children}
        </div>
      </main>
      <MobilePreviewToggle />
    </div>
  );
}
