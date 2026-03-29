"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, ShoppingBag, User, Search, ArrowLeftCircle } from "lucide-react";
import { useCart } from "@/providers/CartProvider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Store", icon: Store, href: "/shop" },
    { label: "Cart", icon: ShoppingBag, href: "/cart", badge: cartCount },
    { label: "Account", icon: User, href: "/dashboard" },
    { label: "Search", icon: Search, href: "/shop" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] h-16 bg-white/95 backdrop-blur-sm md:hidden flex items-center justify-around px-2 pb-safe transition-all duration-300">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-all duration-200 ${
              isActive ? "text-slate-900" : "text-slate-400"
            }`}
          >
            <div className="relative">
              <item.icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-2 -left-2 bg-blue-600 text-white text-[8px] font-black h-4 w-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[9px] font-bold uppercase tracking-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
