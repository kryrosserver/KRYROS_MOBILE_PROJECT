"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Truck,
  CreditCard,
  Headset,
} from "lucide-react"
import { Logo } from "./Logo"
import { AuthButtons } from "./AuthButtons"
import { useCart } from "@/providers/CartProvider"
import { wishlistApi } from "@/lib/api"
import { megaMenuCategories } from "@/lib/store-data"

export function TopBar() {
  return (
    <div className="bg-slate-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 text-xs">
        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1">
            <Phone className="h-3 w-3" />
            +260 966 423 719
          </span>
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            kryrosmobile@gmail.com
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Lusaka, Zambia
          </span>
        </div>
        <div className="flex w-full items-center justify-center gap-4 md:w-auto md:justify-end">
          <span className="flex items-center gap-1 text-green-500">
            <Truck className="h-3 w-3" />
            Free Shipping on Orders Over K 5,000
          </span>
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const accountRef = useRef<HTMLDivElement>(null)
  const { getItemCount } = useCart()
  const [wishlistCount, setWishlistCount] = useState<number>(0)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false)
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    let active = true
    wishlistApi.getMine().then(res => {
      if (!active) return
      setWishlistCount(Array.isArray(res.data) ? res.data.length : 0)
    }).catch(() => {}).finally(() => {})
    return () => { active = false }
  }, [])

  const suggestions = [
    "iPhone 15 Pro Max",
    "Samsung Galaxy S24",
    "MacBook Pro",
    "iPad Pro",
    "AirPods Pro",
  ].filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 shadow-lg backdrop-blur-md"
          : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Logo size={40} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Home
            </Link>
            <div ref={megaMenuRef} className="relative">
              <button
                onMouseEnter={() => setMegaMenuOpen(true)}
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
              >
                Categories
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${megaMenuOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {megaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    onMouseLeave={() => setMegaMenuOpen(false)}
                    className="absolute left-1/2 top-full mt-2 w-[640px] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
                  >
                    <div className="grid grid-cols-4 gap-6">
                      {megaMenuCategories.map((cat) => (
                        <div key={cat.title}>
                          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                            {cat.title}
                          </h4>
                          <ul className="flex flex-col gap-2">
                            {cat.items.map((item) => (
                              <li key={item.name}>
                                <Link
                                  href={item.href}
                                  onClick={() => setMegaMenuOpen(false)}
                                  className="text-sm text-slate-900 transition-colors hover:text-green-600"
                                >
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center gap-3 rounded-lg bg-green-50 p-4">
                      <CreditCard className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Buy Now, Pay Later</p>
                        <p className="text-xs text-slate-600">Flexible installment plans on all products over K 2,000</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/shop"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Shop
            </Link>
            <Link
              href="/credit"
              className="rounded-md px-3 py-2 text-sm font-medium text-green-500 transition-colors hover:bg-green-50"
            >
              Credit Plans
            </Link>
            <Link
              href="/wholesale"
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
            >
              Wholesale
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="relative hidden flex-1 lg:block lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
              />
            </div>
            <AnimatePresence>
              {searchOpen && searchQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-slate-200 bg-white p-2 shadow-lg"
                >
                  {suggestions.length > 0 ? (
                    suggestions.map((s) => (
                      <Link
                        key={s}
                        href={`/shop?q=${encodeURIComponent(s)}`}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-900 hover:bg-slate-100"
                      >
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                        {s}
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-slate-500">
                      No results found
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-md p-2 text-slate-900 transition-colors hover:bg-slate-100 lg:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/wishlist"
              className="relative rounded-md p-2 text-slate-900 transition-colors hover:bg-slate-100"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            </Link>
            <Link
              href="/cart"
              className="relative rounded-md p-2 text-slate-900 transition-colors hover:bg-slate-100"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                {getItemCount()}
              </span>
            </Link>
            <div className="hidden lg:block">
              <AuthButtons />
            </div>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-2 text-slate-900 transition-colors hover:bg-slate-100 lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Services bar */}
      <div className="hidden border-t border-slate-200 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-2">
          {[
            { icon: Truck, text: "Free Shipping Over K 5,000" },
            { icon: CreditCard, text: "Flexible Credit Plans" },
            { icon: Headset, text: "24/7 Support" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-slate-500">
              <Icon className="h-3.5 w-3.5 text-green-500" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-900/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl"
            >
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
                  <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500">
                      <span className="text-sm font-bold text-white">K</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">KRYROS</span>
                  </Link>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md p-1 text-slate-900 hover:bg-slate-100"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Search */}
                <div className="border-b border-slate-200 px-4 py-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-green-500 focus:outline-none"
                    />
                  </div>
                </div>

                <nav className="flex-1 overflow-y-auto px-4 py-4">
                  <div className="flex flex-col gap-1">
                    {["Home", "Shop", "Credit Plans", "Wholesale"].map((item) => (
                      <Link
                        key={item}
                        href={item === "Home" ? "/" : `/${item.toLowerCase().replace(" ", "-")}`}
                        onClick={() => setMobileMenuOpen(false)}
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-100"
                      >
                        {item}
                      </Link>
                    ))}
                    <hr className="my-2 border-slate-200" />
                    <p className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Categories</p>
                    {megaMenuCategories.map((cat) =>
                      cat.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="rounded-md px-3 py-2 text-sm text-slate-900 transition-colors hover:bg-slate-100"
                        >
                          {item.name}
                        </Link>
                      ))
                    )}
                  </div>
                </nav>

                <div className="border-t border-slate-200 px-4 py-4">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-600"
                  >
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
