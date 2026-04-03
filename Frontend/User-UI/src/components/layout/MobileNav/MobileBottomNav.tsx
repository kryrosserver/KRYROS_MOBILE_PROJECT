"use client"

import { Home, Store, ShoppingBag, User, Search, ArrowLeftCircle } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCart } from "@/providers/CartProvider"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { getItemCount } = useCart()
  const cartCount = getItemCount()

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Shop", icon: Store, href: "/shop" },
    { label: "Cart", icon: ShoppingBag, href: "/cart", badge: cartCount },
    { label: "Account", icon: User, href: "/dashboard" },
    { label: "Search", icon: Search, href: "/shop?search=true" },
  ] as const;

  return (
    // "Clear" design - matches client request
    <div className="fixed bottom-0 left-0 right-0 z-[100] h-16 bg-white/95 backdrop-blur-sm md:hidden flex items-center justify-around px-2 pb-safe transition-all duration-300">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        const badge = "badge" in item ? item.badge : 0;

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`relative flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all ${
              isActive ? "text-primary scale-110" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className="relative">
              <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
              {badge > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white border-2 border-white">
                  {badge}
                </span>
              )}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? "opacity-100" : "opacity-60"}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
