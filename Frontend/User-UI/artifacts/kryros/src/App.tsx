import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductPage from "@/pages/ProductPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import GetNowPage from "@/pages/GetNowPage";
import TrackOrderPage from "@/pages/TrackOrderPage";
import PickupStationsPage from "@/pages/PickupStationsPage";
import WholesalePage from "@/pages/WholesalePage";
import DashboardPage from "@/pages/DashboardPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import RefundPage from "@/pages/RefundPage";
import HelpPage from "@/pages/HelpPage";
import FaqPage from "@/pages/FaqPage";
import ReturnsPage from "@/pages/ReturnsPage";
import ShippingPage from "@/pages/ShippingPage";
import SecurityPage from "@/pages/SecurityPage";
import PayPage from "@/pages/PayPage";
import WishlistPage from "@/pages/WishlistPage";
import NotFound from "@/pages/not-found";

import { useAuthStore } from "@/store/authStore";
import { useCurrencyStore } from "@/store/currencyStore";

const queryClient = new QueryClient();

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
        <div className="bg-white dark:bg-zinc-900 text-foreground text-xs font-semibold px-3 py-2 rounded-2xl shadow-lg border border-border whitespace-nowrap animate-in fade-in slide-in-from-right-2 duration-150">
          Chat with us on WhatsApp
        </div>
      )}
      <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95"
        style={{ background: "linear-gradient(135deg, #1FA89A 60%, #178a7e 100%)" }}>
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </div>
    </a>
  );
}

const NO_LAYOUT_ROUTES = ["/login", "/register", "/dashboard", "/track", "/cart", "/checkout", "/pay"];

function Layout({ children, path }: { children: React.ReactNode; path: string }) {
  const noLayout = NO_LAYOUT_ROUTES.some((r) => path.startsWith(r));
  if (noLayout) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [location] = useLocation();

  if (!token || !user) {
    return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  }
  return <>{children}</>;
}

function AppInit() {
  const getMe = useAuthStore((s) => s.getMe);
  const token = useAuthStore((s) => s.token);
  const fetchCurrencies = useCurrencyStore((s) => s.fetchCurrencies);

  useEffect(() => {
    fetchCurrencies();
    if (token) getMe();
  }, []);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/">{() => <Layout path="/"><HomePage /></Layout>}</Route>
      <Route path="/shop">{() => <Layout path="/shop"><ShopPage /></Layout>}</Route>
      <Route path="/product/:id">{() => <Layout path="/product"><ProductPage /></Layout>}</Route>
      <Route path="/cart">{() => <Layout path="/cart"><CartPage /></Layout>}</Route>
      <Route path="/checkout">{() => <Layout path="/checkout"><CheckoutPage /></Layout>}</Route>
      <Route path="/get-now">{() => <Layout path="/get-now"><GetNowPage /></Layout>}</Route>
      <Route path="/track">{() => <Layout path="/track"><TrackOrderPage /></Layout>}</Route>
      <Route path="/pickup-stations">{() => <Layout path="/pickup-stations"><PickupStationsPage /></Layout>}</Route>
      <Route path="/wholesale">{() => <Layout path="/wholesale"><WholesalePage /></Layout>}</Route>
      <Route path="/dashboard">
        {() => (
          <Layout path="/dashboard">
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </Layout>
        )}
      </Route>
      <Route path="/login">{() => <Layout path="/login"><LoginPage /></Layout>}</Route>
      <Route path="/register">{() => <Layout path="/register"><RegisterPage /></Layout>}</Route>
      <Route path="/about">{() => <Layout path="/about"><AboutPage /></Layout>}</Route>
      <Route path="/contact">{() => <Layout path="/contact"><ContactPage /></Layout>}</Route>
      <Route path="/privacy">{() => <Layout path="/privacy"><PrivacyPage /></Layout>}</Route>
      <Route path="/terms">{() => <Layout path="/terms"><TermsPage /></Layout>}</Route>
      <Route path="/refund">{() => <Layout path="/refund"><RefundPage /></Layout>}</Route>
      <Route path="/help">{() => <Layout path="/help"><HelpPage /></Layout>}</Route>
      <Route path="/faq">{() => <Layout path="/faq"><FaqPage /></Layout>}</Route>
      <Route path="/returns">{() => <Layout path="/returns"><ReturnsPage /></Layout>}</Route>
      <Route path="/shipping">{() => <Layout path="/shipping"><ShippingPage /></Layout>}</Route>
      <Route path="/security">{() => <Layout path="/security"><SecurityPage /></Layout>}</Route>
      <Route path="/pay">{() => <Layout path="/pay"><PayPage /></Layout>}</Route>
      <Route path="/wishlist">{() => <Layout path="/wishlist"><WishlistPage /></Layout>}</Route>
      <Route>{() => <Layout path="/404"><NotFound /></Layout>}</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppInit />
          <Router />
          <WhatsAppFloatingButton />
        </WouterRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
              borderRadius: "14px",
            },
          }}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
