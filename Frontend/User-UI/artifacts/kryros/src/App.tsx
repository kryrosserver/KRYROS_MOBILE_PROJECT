import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useEffect, useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

// ── Route-based code splitting ─────────────────────────────────────────────────
// Each page is now its own JS chunk — homepage only loads homepage code.
// All 25 pages are lazy-loaded on demand, reducing initial bundle by ~60%.
const HomePage          = lazy(() => import("@/pages/HomePage"));
const ShopPage          = lazy(() => import("@/pages/ShopPage"));
const ProductPage       = lazy(() => import("@/pages/ProductPage"));
const CartPage          = lazy(() => import("@/pages/CartPage"));
const CheckoutPage      = lazy(() => import("@/pages/CheckoutPage"));
const GetNowPage        = lazy(() => import("@/pages/GetNowPage"));
const TrackOrderPage    = lazy(() => import("@/pages/TrackOrderPage"));
const PickupStationsPage = lazy(() => import("@/pages/PickupStationsPage"));
const WholesalePage     = lazy(() => import("@/pages/WholesalePage"));
const DashboardPage     = lazy(() => import("@/pages/DashboardPage"));
const LoginPage         = lazy(() => import("@/pages/LoginPage"));
const RegisterPage      = lazy(() => import("@/pages/RegisterPage"));
const AboutPage         = lazy(() => import("@/pages/AboutPage"));
const ContactPage       = lazy(() => import("@/pages/ContactPage"));
const PrivacyPage       = lazy(() => import("@/pages/PrivacyPage"));
const TermsPage         = lazy(() => import("@/pages/TermsPage"));
const RefundPage        = lazy(() => import("@/pages/RefundPage"));
const HelpPage          = lazy(() => import("@/pages/HelpPage"));
const FaqPage           = lazy(() => import("@/pages/FaqPage"));
const ReturnsPage       = lazy(() => import("@/pages/ReturnsPage"));
const ShippingPage      = lazy(() => import("@/pages/ShippingPage"));
const SecurityPage      = lazy(() => import("@/pages/SecurityPage"));
const PayPage           = lazy(() => import("@/pages/PayPage"));
const WishlistPage      = lazy(() => import("@/pages/WishlistPage"));
const NotFound          = lazy(() => import("@/pages/not-found"));

import { useAuthStore } from "@/store/authStore";
import { useCurrencyStore } from "@/store/currencyStore";

// ── QueryClient — with staleTime so navigating back reuses cached data ────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,          // 60 s — data stays fresh, no refetch on every nav
      gcTime: 5 * 60_000,         // 5 min — keep inactive data in memory
      retry: 1,                   // only 1 retry on failure (was unlimited)
      refetchOnWindowFocus: false, // don't refetch every time user switches tabs
    },
  },
});

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || "260969597029";

function WhatsAppFloatingButton() {
  const [hovered, setHovered] = useState(false);
  const [location] = useLocation();
  const hide = ["/login", "/register", "/pay"].includes(location);
  if (hide) return null;

  const message = encodeURIComponent("Hi KRYROS! I need some help 👋");
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-28 right-4 z-50 flex items-center gap-2.5 group"
      aria-label="Chat on WhatsApp"
    >
      {hovered && (
        <span className="bg-white text-gray-800 text-sm font-medium px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
          Chat on WhatsApp
        </span>
      )}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200"
        style={{
          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          transform: hovered ? "scale(1.1)" : "scale(1)",
        }}
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </div>
    </a>
  );
}

// ── Lightweight page-transition fallback ──────────────────────────────────────
function PageLoader() {
  return (
    <div style={{
      minHeight: "60vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        width: 36,
        height: 36,
        border: "3px solid #e5e7eb",
        borderTop: "3px solid #1FA89A",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AppRoutes() {
  const { getMe } = useAuthStore();
  const { fetchCurrencies } = useCurrencyStore();
  const [location] = useLocation();

  useEffect(() => {
    getMe();
    fetchCurrencies();
  }, []);

  // Pages that show the main shell (header + footer)
  const hideShell = ["/pay"].includes(location);

  return (
    <>
      {!hideShell && <Header />}
      <Suspense fallback={<PageLoader />}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/shop" component={ShopPage} />
          <Route path="/product/:slug" component={ProductPage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/get-now/:slug" component={GetNowPage} />
          <Route path="/track-order" component={TrackOrderPage} />
          <Route path="/pickup-stations" component={PickupStationsPage} />
          <Route path="/wholesale" component={WholesalePage} />
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/contact" component={ContactPage} />
          <Route path="/privacy" component={PrivacyPage} />
          <Route path="/terms" component={TermsPage} />
          <Route path="/refund" component={RefundPage} />
          <Route path="/help" component={HelpPage} />
          <Route path="/faq" component={FaqPage} />
          <Route path="/returns" component={ReturnsPage} />
          <Route path="/shipping" component={ShippingPage} />
          <Route path="/security" component={SecurityPage} />
          <Route path="/pay" component={PayPage} />
          <Route path="/wishlist" component={WishlistPage} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
      {!hideShell && <Footer />}
      {!hideShell && <MobileBottomNav />}
      <WhatsAppFloatingButton />
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter>
          <AppRoutes />
        </WouterRouter>
        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
