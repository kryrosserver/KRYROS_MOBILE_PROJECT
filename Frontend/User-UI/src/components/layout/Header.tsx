"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
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
  MessageCircle,
} from "lucide-react"
import { Logo } from "./Logo"
import { AuthButtons } from "./AuthButtons"
import { useCart } from "@/providers/CartProvider"
import { useCurrency } from "@/providers/CurrencyProvider"
import { wishlistApi, settingsApi, categoriesApi } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import { megaMenuCategories as staticMegaMenuCategories } from "@/lib/store-data"

export function TopBar() {
  const [shippingConfig, setShippingConfig] = useState({ fee: 50, threshold: 5000 });
  const { countries, selectedCountry, setCountry, isLoading } = useCurrency();

  useEffect(() => {
    settingsApi.getShippingConfig().then(res => {
      if (res.data) setShippingConfig(res.data);
    });
  }, []);

  return (
    <div className="bg-kryros-dark text-primary-foreground md:block hidden">
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
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-kryros-green font-bold">
              <Truck className="h-3 w-3" />
              Free Shipping Over {formatPrice(shippingConfig.threshold)}
            </span>
          </div>

          {/* Country Selector */}
          <div className="relative group">
            <button className="flex items-center gap-2 hover:text-kryros-green transition-colors font-medium border-l border-white/10 pl-6 py-1">
              <span>{selectedCountry?.flag || "🏳️"}</span>
              <span className="uppercase text-white group-hover:text-kryros-green">{selectedCountry?.currencyCode || "USD"}</span>
              <ChevronDown className="h-3 w-3 text-white group-hover:text-kryros-green" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-56 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 transition-all duration-200 z-[100]">
              <div className="p-3 space-y-1">
                <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">Select Currency</p>
                <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                  {countries.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCountry(c.code)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                        selectedCountry?.code === c.code 
                          ? "bg-kryros-green/10 text-kryros-green shadow-sm" 
                          : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl filter drop-shadow-sm">{c.flag || "🏳️"}</span>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold leading-tight">{c.name}</span>
                          <span className="text-[10px] font-medium opacity-60 uppercase">{c.currencyCode}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">{c.currencySymbol}</span>
                        {selectedCountry?.code === c.code && (
                          <div className="h-1.5 w-1.5 rounded-full bg-kryros-green animate-pulse" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [wishlistCount, setWishlistCount] = useState<number>(0)
  const [shippingConfig, setShippingConfig] = useState({ fee: 50, threshold: 5000 });
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [mobileActiveTab, setMobileActiveTab] = useState<"menu" | "categories">("menu");
  const [mobileCurrencyOpen, setMobileCurrencyOpen] = useState(false);
  
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const categoryPickerRef = useRef<HTMLDivElement>(null)
  const { getItemCount } = useCart()
  const { countries, selectedCountry, setCountry } = useCurrency()

  useEffect(() => {
    // Fetch categories with their brands for the dynamic Mega Menu
    categoriesApi.getAll().then(res => {
      if (res.data) {
        // We need to ensure the backend returns brands linked to categories
        setCategories(res.data.filter((c: any) => c.isActive !== false))
      }
    })
  }, [])

  useEffect(() => {
    settingsApi.getShippingConfig().then(res => {
      if (res.data) setShippingConfig(res.data);
    });
  }, []);

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
      if (categoryPickerRef.current && !categoryPickerRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    let active = true
    const refresh = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      if (!token) { setWishlistCount(0); return }
      wishlistApi.getMine()
        .then(res => {
          if (!active) return
          if (res?.error) { setWishlistCount(0); return }
          setWishlistCount(Array.isArray(res.data) ? res.data.length : 0)
        })
        .catch(() => { if (active) setWishlistCount(0) })
    }
    refresh()
    const handler = () => refresh()
    window.addEventListener('wishlist:changed', handler as any)
    return () => { active = false; window.removeEventListener('wishlist:changed', handler as any) }
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    };
  }, [mobileMenuOpen]);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      const params = new URLSearchParams();
      params.set("q", query);
      if (selectedCategory) {
        params.set("category", selectedCategory);
      }
      window.location.href = `/shop?${params.toString()}`;
    }
  };

  const suggestions = [
    "iPhone 16 Pro Max",
    "Samsung Galaxy S24 Ultra",
    "MacBook Pro M3",
    "iPad Pro M4",
    "AirPods Pro 2",
  ].filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <header
      className={`sticky top-0 transition-all duration-300 ${
        mobileMenuOpen ? "z-[100]" : "z-50"
      } ${
        isScrolled
          ? "bg-background/80 shadow-lg backdrop-blur-lg border-b border-border/40"
          : "bg-background border-b border-slate-100"
      }`}
    >
      {/* Mobile Promo Bar - Sticky with Header */}
      <div className="bg-kryros-dark text-kryros-green py-2 px-4 text-center text-[11px] font-bold md:hidden border-b border-white/5">
        <div className="flex items-center justify-center gap-1.5">
          <Truck className="h-3.5 w-3.5" />
          <span>Free Shipping on Orders Over {formatPrice(shippingConfig.threshold)}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Logo size={isScrolled ? 32 : 38} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            <Link
              href="/"
              prefetch={true}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Home
            </Link>
            <div ref={megaMenuRef} className="relative">
              <button
                onMouseEnter={() => setMegaMenuOpen(true)}
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
              >
                Categories
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${megaMenuOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {megaMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    onMouseLeave={() => setMegaMenuOpen(false)}
                    className="absolute left-1/2 top-full mt-2 w-[640px] -translate-x-1/2 rounded-xl border border-border bg-card p-6 shadow-xl"
                  >
                    <div className="grid grid-cols-4 gap-6">
                      {/* Dynamically render columns based on categories from DB */}
                      {categories.filter(c => c.brands?.length > 0 || c.showOnHome).slice(0, 4).map((cat) => (
                        <div key={cat.id}>
                          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {cat.name}
                          </h4>
                          <ul className="flex flex-col gap-2">
                            {/* Render brands linked to this category */}
                            {cat.brands?.slice(0, 6).map((brand: any) => (
                              <li key={brand.id}>
                                <Link
                                  href={`/shop?category=${cat.slug}&brand=${brand.slug}#brand-${brand.slug}`}
                                  prefetch={true}
                                  onClick={() => setMegaMenuOpen(false)}
                                  className="text-sm text-foreground transition-colors hover:text-kryros-green capitalize"
                                >
                                  {brand.name}
                                </Link>
                              </li>
                            ))}
                            {/* If no brands, show link to category shop */}
                            {(!cat.brands || cat.brands.length === 0) && (
                              <li>
                                <Link
                                  href={`/shop?category=${cat.slug}`}
                                  prefetch={true}
                                  onClick={() => setMegaMenuOpen(false)}
                                  className="text-sm text-muted-foreground italic hover:text-kryros-green"
                                >
                                  View all {cat.name}
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 flex items-center gap-3 rounded-lg bg-kryros-green/10 p-4">
                      <CreditCard className="h-5 w-5 text-kryros-green" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          Buy Now, Pay Later
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Flexible installment plans on all products over {formatPrice(100)}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/shop"
              prefetch={true}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Shop
            </Link>
            <Link
              href="/credit"
              prefetch={true}
              className="rounded-md px-3 py-2 text-sm font-medium text-kryros-green transition-colors hover:bg-kryros-green/10"
            >
              Credit Plans
            </Link>
            <Link
              href="/wholesale"
              prefetch={true}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Wholesale
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div className="relative hidden flex-1 lg:block lg:max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="w-full rounded-lg border border-border bg-secondary py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-kryros-green focus:outline-none focus:ring-1 focus:ring-kryros-green"
              />
            </div>
            <AnimatePresence>
              {searchOpen && searchQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  className="absolute left-0 right-0 top-full mt-2 rounded-lg border border-border bg-card p-2 shadow-lg"
                >
                  {suggestions.length > 0 ? (
                    suggestions.map((s) => (
                      <Link
                        key={s}
                        href={`/shop?q=${encodeURIComponent(s)}`}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground hover:bg-secondary"
                      >
                        <Search className="h-3.5 w-3.5 text-muted-foreground" />
                        {s}
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-2 text-sm text-muted-foreground">
                      No results found
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link
              href="/wishlist"
              className="relative rounded-md p-2 text-foreground transition-colors hover:bg-secondary"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-kryros-green text-[10px] font-bold text-accent-foreground">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              className="relative rounded-md p-2 text-foreground transition-colors hover:bg-secondary"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-kryros-orange text-[10px] font-bold text-accent-foreground">
                {getItemCount()}
              </span>
            </Link>
            <div className="hidden lg:block ml-2">
              <AuthButtons />
            </div>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-2 text-foreground transition-colors hover:bg-secondary lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar - Always Visible on Mobile */}
        <div className="pb-4 lg:hidden">
          <div className="flex items-stretch overflow-visible rounded-lg border border-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all bg-white shadow-sm h-11">
            <input
              type="text"
              placeholder="Search for products"
              className="flex-1 bg-white px-4 py-0 text-sm focus:outline-none min-w-0 h-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
            />
            
            <div className="flex items-center border-l border-slate-100 h-full relative" ref={categoryPickerRef}>
              <button 
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-2 px-4 h-full bg-slate-50/50 hover:bg-slate-100 transition-colors"
              >
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider whitespace-nowrap">
                  {selectedCategory ? categories.find(c => c.slug === selectedCategory)?.name || "ALL" : "ALL"}
                </span>
                <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {categoryDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-[calc(100%+8px)] w-56 bg-white rounded-xl shadow-2xl border border-slate-100 z-[100] overflow-hidden"
                  >
                    <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                      <button
                        onClick={() => {
                          setSelectedCategory("");
                          setCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                          selectedCategory === "" ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        ALL
                        {selectedCategory === "" && <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.slug);
                            setCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                            selectedCategory === cat.slug ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {cat.name}
                          {selectedCategory === cat.slug && <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              className="bg-blue-600 px-5 text-white flex items-center justify-center transition-colors hover:bg-blue-700 active:scale-95 h-full"
              onClick={() => handleSearch(searchQuery)}
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Toggled by Search Icon (Removed as it is now always visible) */}

      {/* Services bar */}
      <div className="hidden border-t border-border lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-2">
          {[
            { icon: Truck, text: `Free Shipping Over ${formatPrice(shippingConfig.threshold)}` },
            { icon: CreditCard, text: "Flexible Credit Plans" },
            { icon: Headset, text: "24/7 Support" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5 text-kryros-green" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-[150] h-[100dvh] w-screen overflow-hidden flex">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative h-full w-80 max-w-[85vw] flex flex-col bg-white shadow-xl overflow-hidden"
            >
              {/* Custom Header with Tabs and Close */}
              <div className="flex items-center justify-between bg-white shrink-0 border-b border-slate-100">
                <div className="flex-1 flex bg-slate-50">
                  <button
                    onClick={() => setMobileActiveTab("menu")}
                    className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider transition-all ${
                      mobileActiveTab === "menu"
                        ? "text-blue-600 bg-white"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    MENU
                  </button>
                  <button
                    onClick={() => setMobileActiveTab("categories")}
                    className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider transition-all ${
                      mobileActiveTab === "categories"
                        ? "text-blue-600 bg-white"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    CATEGORIES
                  </button>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="bg-[#00155a] p-4 text-white shrink-0"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Currency Selector */}
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Currency</span>
                  <div className="relative">
                    <button
                      onClick={() => setMobileCurrencyOpen(!mobileCurrencyOpen)}
                      className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none shadow-sm hover:bg-slate-50 transition-colors"
                    >
                      <span>{selectedCountry?.flag}</span>
                      <span>{selectedCountry?.currencyCode}</span>
                      <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${mobileCurrencyOpen ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                      {mobileCurrencyOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-[160] overflow-hidden"
                        >
                          <div className="p-1 max-h-[250px] overflow-y-auto custom-scrollbar">
                            {countries.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => {
                                  setCountry(c.code);
                                  setMobileCurrencyOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all ${
                                  selectedCountry?.code === c.code 
                                    ? "bg-blue-50 text-blue-600" 
                                    : "hover:bg-slate-50 text-slate-600"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-sm">{c.flag}</span>
                                  <span className="text-xs font-bold uppercase">{c.currencyCode}</span>
                                </div>
                                {selectedCountry?.code === c.code && (
                                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <nav className="flex-1 overflow-y-auto overscroll-contain custom-scrollbar bg-white">
                <AnimatePresence mode="wait">
                  {mobileActiveTab === "menu" ? (
                    <motion.div
                      key="menu-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col divide-y divide-slate-100"
                    >
                      {[
                        { name: "Home", href: "/" },
                        { name: "Shop", href: "/shop" },
                        { name: "Credit Plans", href: "/credit" },
                        { name: "Wholesale", href: "/wholesale" },
                      ].map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="px-6 py-5 text-sm font-bold text-slate-800 transition-colors hover:bg-slate-50 flex items-center justify-between"
                        >
                          {item.name}
                          <ChevronDown className="h-4 w-4 -rotate-90 text-slate-400" />
                        </Link>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="categories-tab"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col divide-y divide-slate-100"
                    >
                      {categories.map((cat) => {
                        const isExpanded = expandedCategories.includes(cat.id);
                        const hasBrands = cat.brands?.length > 0;
                        
                        const toggleExpand = (e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setExpandedCategories(prev => 
                            isExpanded ? prev.filter(id => id !== cat.id) : [...prev, cat.id]
                          );
                        };

                        return (
                          <div key={cat.id} className="flex flex-col">
                            <div className="flex items-center justify-between group border-b border-slate-50">
                              <Link
                                href={`/shop?category=${cat.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex-1 flex items-center gap-5 px-6 py-4 transition-all hover:bg-slate-50"
                              >
                                <div className="relative h-10 w-10 shrink-0 flex items-center justify-center">
                                  {cat.image ? (
                                    <Image 
                                      src={cat.image} 
                                      alt={cat.name}
                                      fill
                                      className="object-contain"
                                    />
                                  ) : (
                                    <span className="text-xl">📦</span>
                                  )}
                                </div>
                                <span className="text-[15px] font-semibold text-slate-900">
                                  {cat.name}
                                </span>
                              </Link>
                              
                              <button
                                onClick={hasBrands ? toggleExpand : undefined}
                                className={`px-6 py-5 text-slate-400 ${!hasBrands ? 'cursor-default opacity-40' : 'hover:text-slate-600'}`}
                                disabled={!hasBrands}
                              >
                                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                              </button>
                            </div>

                            <AnimatePresence>
                              {hasBrands && isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-slate-50/50"
                                >
                                  <div className="flex flex-col divide-y divide-slate-100/50 pl-14">
                                    {cat.brands.map((brand: any) => (
                                      <Link
                                        key={brand.id}
                                        href={`/shop?category=${cat.slug}&brand=${brand.slug}#brand-${brand.slug}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="py-3 pr-6 text-xs font-bold text-slate-500 hover:text-blue-600 capitalize transition-colors"
                                      >
                                        {brand.name}
                                      </Link>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </nav>

              {/* Fixed Sidebar Footer */}
              <div className="p-6 pb-10 bg-slate-50 border-t border-slate-100 shrink-0">
                <a
                  href={`https://wa.me/260966423719?text=${encodeURIComponent("Hello! I need assistance with my order.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-md active:scale-95"
                >
                  <MessageCircle className="h-5 w-5" />
                  Chat on WhatsApp
                </a>
                <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
                  24/7 Customer Support
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  )
}
