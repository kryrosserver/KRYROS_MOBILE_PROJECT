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
  Facebook,
  Instagram,
  Twitter,
  Trash2,
  Tag,
} from "lucide-react"
import { cmsApi, productsApi, categoriesApi, settingsApi, wishlistApi } from "@/lib/api"
import { useCart } from "@/providers/CartProvider"
import { useCurrency } from "@/providers/CurrencyProvider"
import { Logo } from "@/components/layout/Logo"
import { AuthButtons } from "@/components/layout/AuthButtons"
import { formatPrice } from "@/lib/utils"

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [config, setConfig] = useState<any>(null);

  useEffect(() => {
    // Fetch announcement bar config from admin
    cmsApi.getFooterConfig().then(res => {
      if (res.data && res.data.announcementBarEnabled) {
        // Check session storage to see if closed in current session
        const isClosed = sessionStorage.getItem("announcement_closed");
        if (!isClosed) {
          setConfig(res.data);
          setIsVisible(true);
        }
      }
    });
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem("announcement_closed", "true");
  };

  if (!isVisible || !config) return null;

  return (
    <div className={`${config.announcementBarBgColor || 'bg-kryros-dark'} ${config.announcementBarTextColor || 'text-kryros-green'} py-2 px-4 relative overflow-hidden transition-colors duration-300`}>
      <div className="container-custom flex items-center justify-center min-h-[24px]">
        {config.announcementBarLink ? (
          <Link href={config.announcementBarLink} className="text-[11px] md:text-sm font-bold tracking-wide text-center px-8 uppercase hover:underline">
            {config.announcementBarText}
          </Link>
        ) : (
          <p className="text-[11px] md:text-sm font-bold tracking-wide text-center px-8 uppercase">
            {config.announcementBarText?.toUpperCase()}
          </p>
        )}
        <button 
          onClick={handleClose}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="h-3.5 w-3.5 md:h-4 md:w-4" />
        </button>
      </div>
    </div>
  );
}

export function TopBar() {
  const { countries, selectedCountry, setCountry } = useCurrency();
  const [selectedLang, setSelectedLang] = useState({ name: "English", code: "en" });

  return (
    <div className="bg-[#f8fafc] border-b border-slate-200/60 py-1.5 md:py-2">
      <div className="container-custom flex items-center justify-between gap-4">
        {/* Left Side: Navigation Links */}
        <div className="flex items-center gap-4 md:gap-8 overflow-x-auto scrollbar-hide no-scrollbar flex-1 min-w-0 py-0.5 text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] text-slate-600">
          {/* Languages */}
          <div className="relative group cursor-pointer flex items-center gap-1.5 hover:text-primary transition-all shrink-0 bg-white px-2.5 py-1 rounded-full border border-slate-200/50 shadow-sm">
            <span className="whitespace-nowrap flex items-center gap-1.5">
              <span className="text-slate-400 font-bold">EN</span>
              {selectedLang.name}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-primary transition-colors" />
            <div className="absolute top-[calc(100%+6px)] left-0 w-36 bg-white shadow-2xl border border-slate-100 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[150] p-1.5 overflow-hidden">
              {["English", "French"].map(l => (
                <div 
                  key={l} 
                  onClick={() => setSelectedLang({ name: l, code: l === "English" ? "en" : "fr" })}
                  className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-wider"
                >
                  {l}
                </div>
              ))}
            </div>
          </div>

          {/* Country/Currency */}
          <div className="relative group cursor-pointer flex items-center gap-1.5 hover:text-primary transition-all shrink-0 bg-white px-2.5 py-1 rounded-full border border-slate-200/50 shadow-sm">
            <span className="whitespace-nowrap flex items-center gap-1.5">
              <span className="text-slate-400 font-bold">SHIP:</span>
              {selectedCountry?.flag} {selectedCountry?.currencyCode}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-primary transition-colors" />
            <div className="absolute top-[calc(100%+6px)] left-0 w-52 bg-white shadow-2xl border border-slate-100 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[150] p-1.5 overflow-hidden">
              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                {countries.map(c => (
                  <div 
                    key={c.id} 
                    onClick={() => setCountry(c.code)}
                    className="px-3 py-2 hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-between text-[10px] font-black text-slate-500 hover:text-primary uppercase tracking-wider"
                  >
                    <span className="flex items-center gap-2">{c.flag} {c.currencyCode}</span>
                    {selectedCountry?.code === c.code && <div className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(249,115,22,0.4)]" />}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Help Dropdown */}
          <div className="relative group cursor-pointer flex items-center gap-1.5 hover:text-primary transition-all shrink-0 bg-white px-2.5 py-1 rounded-full border border-slate-200/50 shadow-sm uppercase tracking-wider">
            <span>Quick Help</span>
            <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-primary transition-colors" />
            
            {/* Dropdown Container - White with shadow to match reference image */}
            <div className="absolute top-[calc(100%+6px)] right-0 md:left-0 w-48 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[150] p-2 overflow-hidden">
              {[
                { name: "Order Tracking", href: "/orders/track" },
                { name: "Contact", href: "/support" },
                { name: "FAQ", href: "/support#faq" },
                { name: "Find Us", href: "/support#find-us" },
              ].map(item => (
                <Link 
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 hover:bg-slate-50 rounded-lg transition-all text-[11px] font-bold text-slate-700 hover:text-primary uppercase tracking-widest border-b border-slate-50 last:border-0"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Social Icons */}
        <div className="hidden sm:flex items-center gap-3 text-slate-400 shrink-0">
          <a href="#" className="hover:text-primary transition-all transform hover:scale-110"><Facebook className="h-3.5 w-3.5" /></a>
          <a href="#" className="hover:text-primary transition-all transform hover:scale-110"><Instagram className="h-3.5 w-3.5" /></a>
          <a href="#" className="hover:text-primary transition-all transform hover:scale-110"><Twitter className="h-3.5 w-3.5" /></a>
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
  const [mobileLanguageOpen, setMobileLanguageOpen] = useState(false);
  const [mobileSupportOpen, setMobileSupportOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState({ name: "English", code: "en", flag: "🇺🇸" });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const categoryPickerRef = useRef<HTMLDivElement>(null)
  const { items, getItemCount, getSubtotal, removeItem } = useCart()
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

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        productsApi.getAll({ search: searchQuery, take: 5 })
          .then(res => {
            if (res.data?.data) {
              setSearchResults(res.data.data);
            }
          })
          .finally(() => setIsSearching(false));
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

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
      <div className="mx-auto max-w-7xl px-3 md:px-4">
        {/* Mobile Search Bar - Now on top (Matches Reference Image) */}
        <div className="pt-3 pb-1 lg:hidden relative">
          <div className="flex items-stretch overflow-visible rounded-lg border border-slate-200 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all bg-white shadow-sm h-11">
            <input
              type="text"
              placeholder="Search for products"
              className="flex-1 bg-white px-4 py-0 text-sm focus:outline-none min-w-0 h-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
              onFocus={() => setSearchOpen(true)}
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
                          selectedCategory === "" ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        ALL
                        {selectedCategory === "" && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory(cat.slug);
                            setCategoryDropdownOpen(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-between ${
                            selectedCategory === cat.slug ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {cat.name}
                          {selectedCategory === cat.slug && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              className="bg-primary px-5 text-white flex items-center justify-center transition-colors hover:bg-primary/90 active:scale-95 h-full"
              onClick={() => handleSearch(searchQuery)}
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
          
          {/* Live Search Results Dropdown - Mobile */}
          <AnimatePresence>
            {searchOpen && searchQuery.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-[110] overflow-hidden max-h-[70vh] flex flex-col"
              >
                <div className="overflow-y-auto custom-scrollbar p-2">
                  {isSearching ? (
                    <div className="p-8 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Searching...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Results for "{searchQuery}"</p>
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                          >
                            <Link
                              href={`/product/${product.slug || product.id}`}
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className="flex items-center gap-4 flex-1 min-w-0"
                            >
                              <div className="relative h-16 w-16 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                                <Image
                                  src={
                                    typeof product.images?.[0] === 'string' 
                                      ? product.images[0] 
                                      : product.images?.[0]?.url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop"
                                  }
                                  alt={product.name}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{product.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-sm font-black text-red-600">{formatPrice(product.price)}</span>
                                  {product.discountPercentage && product.discountPercentage > 0 && (
                                    <span className="text-xs text-slate-400 line-through font-medium">
                                      {formatPrice(product.price / (1 - product.discountPercentage / 100))}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5 mt-1">
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${product.stockCurrent > 0 ? "text-green-600" : "text-red-600"}`}>
                                    IN STOCK: {product.stockCurrent || 0}
                                  </span>
                                  <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{product.sku || "N/A"}</span>
                                </div>
                              </div>
                            </Link>
                            <button 
                              className="px-4 py-2 text-xs font-bold text-slate-900 hover:text-primary transition-colors"
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery("");
                              }}
                            >
                              Add to cart
                            </button>
                          </div>
                        ))}
                        <Link 
                          href={`/shop?q=${searchQuery}`}
                          onClick={() => setSearchOpen(false)}
                          className="p-3 text-center text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/10 transition-colors border-t border-slate-50 mt-1"
                        >
                          View all results
                        </Link>
                      </div>
                  ) : (
                    <div className="p-12 text-center">
                      <Search className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No products found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex h-14 md:h-16 items-center justify-between gap-2 lg:h-20">
          {/* Mobile Menu & Logo Together - (Matches Reference Image) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-md p-2 text-slate-700 transition-colors hover:bg-secondary lg:hidden"
              aria-label="Menu"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2 lg:mr-4">
              <Logo size={isScrolled ? 26 : 30} />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex flex-1">
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
              {searchOpen && searchQuery.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-slate-100 z-[110] overflow-hidden max-h-[70vh] flex flex-col w-[500px]"
                >
                  <div className="overflow-y-auto custom-scrollbar p-2">
                    {isSearching ? (
                      <div className="p-8 text-center">
                        <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        <p className="mt-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">Results for "{searchQuery}"</p>
                        {searchResults.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group"
                          >
                            <Link
                              href={`/product/${product.slug || product.id}`}
                              onClick={() => {
                                setSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className="flex items-center gap-4 flex-1 min-w-0"
                            >
                              <div className="relative h-16 w-16 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                                <Image
                                  src={
                                    typeof product.images?.[0] === 'string' 
                                      ? product.images[0] 
                                      : product.images?.[0]?.url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=200&fit=crop"
                                  }
                                  alt={product.name}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-primary transition-colors">{product.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-sm font-black text-red-600">{formatPrice(product.price)}</span>
                                  {product.discountPercentage && product.discountPercentage > 0 && (
                                    <span className="text-xs text-slate-400 line-through font-medium">
                                      {formatPrice(product.price / (1 - product.discountPercentage / 100))}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-col gap-0.5 mt-1">
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${product.stockCurrent > 0 ? "text-green-600" : "text-red-600"}`}>
                                    IN STOCK: {product.stockCurrent || 0}
                                  </span>
                                  <span className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{product.sku || "N/A"}</span>
                                </div>
                              </div>
                            </Link>
                            <button 
                              className="px-4 py-2 text-xs font-bold text-slate-900 hover:text-primary transition-colors"
                              onClick={() => {
                                // Add to cart logic would go here
                                setSearchOpen(false);
                                setSearchQuery("");
                              }}
                            >
                              Add to cart
                            </button>
                          </div>
                        ))}
                        <Link 
                          href={`/shop?q=${searchQuery}`}
                          onClick={() => setSearchOpen(false)}
                          className="p-3 text-center text-xs font-black text-primary uppercase tracking-widest hover:bg-primary/10 transition-colors border-t border-slate-50 mt-1"
                        >
                          View all results
                        </Link>
                      </div>
                    ) : (
                      <div className="p-12 text-center">
                        <Search className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No products found</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {/* User Account - Mobile Only (Matches Reference Image) */}
            <Link
              href="/dashboard"
              className="lg:hidden flex items-center justify-center rounded-lg p-2 text-slate-700 transition-all hover:bg-secondary hover:text-primary"
              aria-label="Account"
            >
              <User className="h-5.5 w-5.5" />
            </Link>

            <Link
              href="/wishlist"
              className="group/wish relative flex items-center justify-center rounded-lg p-2 text-slate-700 transition-all hover:bg-secondary hover:text-kryros-green"
              aria-label="Wishlist"
            >
              <div className="relative">
                <Heart className="h-5 w-5 md:h-6 md:w-6" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-[16px] min-w-[16px] px-1 items-center justify-center rounded-full bg-kryros-green text-[8px] font-black text-white shadow-[0_2px_4px_rgba(34,197,94,0.3)] border-2 border-white ring-1 ring-kryros-green/10">
                    {wishlistCount}
                  </span>
                )}
              </div>
            </Link>
            
            {/* Cart with Dropdown */}
            <div className="relative group/cart">
              <Link
                href="/cart"
                className="group/cart-link relative flex items-center justify-center rounded-lg p-2 text-slate-700 transition-all hover:bg-secondary hover:text-primary"
                aria-label="Shopping Cart"
              >
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                  <span className="absolute -top-2 -right-2 flex h-[16px] min-w-[16px] px-1 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white shadow-[0_2px_4px_rgba(249,115,22,0.3)] border-2 border-white ring-1 ring-primary/10">
                    {getItemCount()}
                  </span>
                </div>
              </Link>

              {/* Cart Dropdown - Desktop Only */}
              <div className="absolute right-0 top-[calc(100%+8px)] w-[340px] bg-white rounded-xl shadow-2xl border border-slate-100 z-[120] overflow-hidden opacity-0 invisible group-hover/cart:opacity-100 group-hover/cart:visible transition-all duration-200 pointer-events-none group-hover/cart:pointer-events-auto">
                {/* Arrow */}
                <div className="absolute -top-2 right-4 w-4 h-4 bg-white border-l border-t border-slate-100 rotate-45 z-10" />
                
                <div className="p-4 relative bg-white z-20">
                  {items.length > 0 ? (
                    <>
                      <div className="max-h-[350px] overflow-y-auto custom-scrollbar space-y-4 pr-1">
                        {items.map((item) => (
                          <div key={item.product.id + (item.variant?.id || '')} className="flex gap-3 relative group/item">
                            <div className="relative h-16 w-16 bg-slate-50 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                              <Image
                                src={
                                  typeof item.product.images?.[0] === 'string'
                                    ? item.product.images[0]
                                    : item.product.images?.[0]?.url || "/placeholder.jpg"
                                }
                                alt={item.product.name}
                                fill
                                className="object-contain p-1"
                              />
                            </div>
                            <div className="flex-1 min-w-0 pr-6">
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">{item.product.name}</h4>
                              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                                {item.variant?.value ? `${item.variant.value}` : ""}
                              </p>
                              <p className="text-xs font-black text-red-600 mt-1">
                                {formatPrice(item.variant?.price || item.product.price)} <span className="text-slate-400 font-bold">x {item.quantity}</span>
                              </p>
                            </div>
                            <button 
                              onClick={() => removeItem(item.product.id, item.variant?.id)}
                              className="absolute top-0 right-0 p-1 text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-500 uppercase tracking-widest text-[10px]">Subtotal:</span>
                          <span className="font-black text-red-600">{formatPrice(getSubtotal())}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-bold text-slate-900 uppercase tracking-widest text-[10px]">Total:</span>
                          <span className="font-black text-red-600 text-base">{formatPrice(getSubtotal())}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <Link 
                            href="/cart"
                            className="flex items-center justify-center h-10 rounded-lg bg-slate-100 text-slate-900 text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                          >
                            View Cart
                          </Link>
                          <Link 
                            href="/checkout"
                            className="flex items-center justify-center h-10 rounded-lg bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                          >
                            Checkout
                          </Link>
                        </div>

                        <button className="w-full flex items-center justify-center gap-2 h-12 mt-2 border border-slate-200 rounded-lg text-slate-600 text-[11px] font-bold uppercase tracking-widest hover:bg-slate-50 transition-all">
                          <Tag className="h-4 w-4" />
                          Coupons
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <ShoppingCart className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your cart is empty</p>
                      <Link 
                        href="/shop"
                        className="inline-block mt-4 text-xs font-black text-primary uppercase tracking-widest hover:underline"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden lg:block ml-2">
              <AuthButtons />
            </div>
          </div>
        </div>
      </div>

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
            
              {/* Sidebar Content */}
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="relative h-[100dvh] w-80 max-w-[85vw] grid grid-rows-[auto_1fr_auto] bg-white shadow-xl overflow-hidden"
              >
                {/* Custom Header with Tabs and Close - Fixed at Top */}
                <div className="bg-white border-b border-slate-100 flex items-center justify-between z-10 shrink-0">
                  <div className="flex-1 flex bg-slate-50">
                    <button
                      onClick={() => setMobileActiveTab("menu")}
                      className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider transition-all ${
                        mobileActiveTab === "menu"
                          ? "text-primary bg-white"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      MENU
                    </button>
                    <button
                      onClick={() => setMobileActiveTab("categories")}
                      className={`flex-1 py-4 text-[11px] font-bold uppercase tracking-wider transition-all ${
                        mobileActiveTab === "categories"
                          ? "text-primary bg-white"
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

                {/* Scrollable Content Area */}
                <nav className="overflow-y-auto overscroll-contain custom-scrollbar bg-white py-2">
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
                            className="px-5 py-4 text-[13px] font-bold text-slate-800 transition-colors hover:bg-slate-50 flex items-center justify-between"
                          >
                            {item.name}
                            <ChevronDown className="h-4 w-4 -rotate-90 text-slate-400" />
                          </Link>
                        ))}

                        {/* Currency Selector - Added back per user request */}
                        <div className="relative border-t border-slate-100">
                          <button
                            onClick={() => setMobileCurrencyOpen(!mobileCurrencyOpen)}
                            className="w-full px-5 py-4 text-[13px] font-bold text-slate-800 transition-colors hover:bg-slate-50 flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2">Currency / Ship To</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 font-medium">{selectedCountry?.flag} {selectedCountry?.currencyCode}</span>
                              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileCurrencyOpen ? 'rotate-180' : '-rotate-90'}`} />
                            </div>
                          </button>
                          <AnimatePresence>
                            {mobileCurrencyOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-slate-50"
                              >
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                  {countries.map((c) => (
                                    <button
                                      key={c.id}
                                      onClick={() => {
                                        setCountry(c.code);
                                        setMobileCurrencyOpen(false);
                                      }}
                                      className="w-full px-10 py-3 text-xs font-bold text-slate-600 hover:text-primary flex items-center justify-between"
                                    >
                                      <span className="flex items-center gap-2">
                                        <span>{c.flag}</span>
                                        {c.name} ({c.currencyCode})
                                      </span>
                                      {selectedCountry?.code === c.code && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                    </button>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Language Selector */}
                        <div className="relative border-t border-slate-100">
                          <button
                            onClick={() => setMobileLanguageOpen(!mobileLanguageOpen)}
                            className="w-full px-5 py-4 text-[13px] font-bold text-slate-800 transition-colors hover:bg-slate-50 flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2">Language</span>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 font-medium">{selectedLanguage.name}</span>
                              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileLanguageOpen ? 'rotate-180' : '-rotate-90'}`} />
                            </div>
                          </button>
                          <AnimatePresence>
                            {mobileLanguageOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden bg-slate-50"
                              >
                                {[
                                  { name: "English", code: "en", flag: "🇺🇸" },
                                  { name: "French", code: "fr", flag: "🇫🇷" },
                                ].map((lang) => (
                                  <button
                                    key={lang.code}
                                    onClick={() => {
                                      setSelectedLanguage(lang);
                                      setMobileLanguageOpen(false);
                                    }}
                                    className="w-full px-10 py-3 text-xs font-bold text-slate-600 hover:text-primary flex items-center justify-between"
                                  >
                                    <span className="flex items-center gap-2">
                                      <span>{lang.flag}</span>
                                      {lang.name}
                                    </span>
                                    {selectedLanguage.code === lang.code && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
                                  </button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="categories-tab"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col divide-y divide-slate-100"
                      >
                        {categories.map((cat) => (
                          <div key={cat.id}>
                            <div className="flex items-center justify-between px-5 py-4">
                              <Link
                                href={`/shop?category=${cat.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-4 flex-1"
                              >
                                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center">
                                  <Image
                                    src={cat.image || "/placeholder.jpg"}
                                    alt={cat.name}
                                    fill
                                    className="object-contain p-1"
                                  />
                                </div>
                                <span className="text-[13px] font-bold text-slate-800">
                                  {cat.name}
                                </span>
                              </Link>
                              <button
                                onClick={() => {
                                  if (expandedCategories.includes(cat.id)) {
                                    setExpandedCategories(expandedCategories.filter(id => id !== cat.id));
                                  } else {
                                    setExpandedCategories([...expandedCategories, cat.id]);
                                  }
                                }}
                                className="p-2"
                              >
                                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${expandedCategories.includes(cat.id) ? 'rotate-180' : '-rotate-90'}`} />
                              </button>
                            </div>
                            <AnimatePresence>
                              {expandedCategories.includes(cat.id) && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden bg-slate-50 px-8 py-2 flex flex-col gap-3"
                                >
                                  {cat.brands?.map((brand: any) => (
                                    <Link
                                      key={brand.id}
                                      href={`/shop?category=${cat.slug}&brand=${brand.slug}`}
                                      onClick={() => setMobileMenuOpen(false)}
                                      className="text-xs font-bold text-slate-600 hover:text-primary capitalize"
                                    >
                                      {brand.name}
                                    </Link>
                                  ))}
                                  <Link
                                    href={`/shop?category=${cat.slug}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="text-xs font-black text-primary uppercase tracking-widest mt-1"
                                  >
                                    View all {cat.name}
                                  </Link>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </nav>

                {/* Fixed Footer with Auth/Support - Fixed at Bottom */}
                <div className="p-5 bg-white border-t border-slate-100 shrink-0">
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 h-12 rounded-lg bg-primary text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                    >
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href="tel:+260970000000"
                        className="flex items-center justify-center gap-2 h-11 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call Us
                      </a>
                      <a
                        href="mailto:support@kryros.com"
                        className="flex items-center justify-center gap-2 h-11 rounded-lg border border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  )
}
