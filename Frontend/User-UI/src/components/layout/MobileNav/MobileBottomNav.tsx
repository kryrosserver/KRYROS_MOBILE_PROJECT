"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, ShoppingBag, User, Search } from "lucide-react";
import { useCart } from "@/providers/CartProvider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Shop", icon: Store, href: "/shop" },
    { label: "Cart", icon: ShoppingBag, href: "/cart", badge: cartCount },
    { label: "Account", icon: User, href: "/dashboard" },
    { label: "Search", icon: Search, href: "/shop" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 md:hidden flex items-center justify-around px-2 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-300 ${
              isActive ? "text-blue-600 scale-110" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className="relative">
              <item.icon className={`h-5.5 w-5.5 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider transition-all ${isActive ? "opacity-100" : "opacity-70"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
