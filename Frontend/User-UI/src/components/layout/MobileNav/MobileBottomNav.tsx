"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, ShoppingCart, User } from "lucide-react";
import { useCart } from "@/providers/CartProvider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { getItemCount } = useCart();
  const cartCount = getItemCount();

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Store", icon: ShoppingBag, href: "/shop" },
    { label: "Cart", icon: ShoppingCart, href: "/cart", badge: cartCount },
    { label: "Account", icon: User, href: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-slate-200 md:hidden flex items-center justify-around px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1 w-full h-full transition-colors ${
              isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <div className="relative">
              <item.icon className={`h-6 w-6 ${isActive ? "fill-blue-600/10" : ""}`} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium uppercase tracking-tight">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
