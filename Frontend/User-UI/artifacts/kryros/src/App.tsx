import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

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
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

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
      <Route path="/dashboard">{() => <Layout path="/dashboard"><DashboardPage /></Layout>}</Route>
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
      <Route>{() => <Layout path="/404"><NotFound /></Layout>}</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
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
