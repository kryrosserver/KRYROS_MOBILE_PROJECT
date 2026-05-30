import axios from "axios";
import { getToken, logout } from "./auth";

const api = axios.create({
  baseURL: "",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      logout();
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────
export const adminLogin = (identifier: string, password: string) =>
  api.post("/api/auth/login", { identifier, password });

// ── Reports / Dashboard ───────────────────────────────────
export const getReportsSummary = (range = "year") =>
  api.get(`/api/reports/summary?range=${range}`);

// ── Dashboard helpers ─────────────────────────────────────
export const getRecentOrders = (limit = 5) =>
  api.get(`/api/orders?limit=${limit}&skip=0`);
export const getTopProducts = (limit = 5) =>
  api.get(`/api/products?limit=${limit}`);
export const getRecentCustomers = (limit = 5) =>
  api.get(`/api/users?limit=${limit}&role=CUSTOMER`);

// ── Orders ────────────────────────────────────────────────
export const getOrders = (params?: Record<string, unknown>) =>
  api.get("/api/orders", { params });
export const getOrder = (id: string) =>
  api.get(`/api/orders/${id}`);
export const updateOrder = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/orders/${id}`, data);

// ── Products ──────────────────────────────────────────────
export const getProducts = (params?: Record<string, unknown>) =>
  api.get("/api/products", { params });
export const getProduct = (id: string) =>
  api.get(`/api/products/${id}`);
export const createProduct = (data: Record<string, unknown>) =>
  api.post("/api/products", data);
export const updateProduct = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/products/${id}`, data);
export const deleteProduct = (id: string) =>
  api.delete(`/api/products/${id}`);

// ── Users ─────────────────────────────────────────────────
export const getUsers = (params?: Record<string, unknown>) =>
  api.get("/api/users", { params });
export const getUser = (id: string) =>
  api.get(`/api/users/${id}`);
export const createUser = (data: Record<string, unknown>) =>
  api.post("/api/users", data);
export const updateUser = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/users/${id}`, data);
export const deleteUser = (id: string) =>
  api.delete(`/api/users/${id}`);

// ── Categories ────────────────────────────────────────────
export const getCategories = (params?: Record<string, unknown>) =>
  api.get("/api/categories", { params });
export const createCategory = (data: Record<string, unknown>) =>
  api.post("/api/categories", data);
export const updateCategory = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/categories/${id}`, data);
export const deleteCategory = (id: string) =>
  api.delete(`/api/categories/${id}`);

// ── Brands ────────────────────────────────────────────────
export const getBrands = (params?: Record<string, unknown>) =>
  api.get("/api/brands", { params });
export const createBrand = (data: Record<string, unknown>) =>
  api.post("/api/brands", data);
export const updateBrand = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/brands/${id}`, data);
export const deleteBrand = (id: string) =>
  api.delete(`/api/brands/${id}`);

// ── Reviews ───────────────────────────────────────────────
export const getReviews = (params?: Record<string, unknown>) =>
  api.get("/api/reviews", { params });
export const updateReview = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/reviews/${id}`, data);
export const deleteReview = (id: string) =>
  api.delete(`/api/reviews/${id}`);

// ── Services ──────────────────────────────────────────────
export const getServices = (params?: Record<string, unknown>) =>
  api.get("/api/services", { params });
export const createService = (data: Record<string, unknown>) =>
  api.post("/api/services", data);
export const updateService = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/services/${id}`, data);
export const deleteService = (id: string) =>
  api.delete(`/api/services/${id}`);

// ── CMS — Banners ─────────────────────────────────────────
export const getCmsBanners = () =>
  api.get("/api/cms/banners/manage");
export const createCmsBanner = (data: Record<string, unknown>) =>
  api.post("/api/cms/banners", data);
export const updateCmsBanner = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/cms/banners/${id}`, data);
export const deleteCmsBanner = (id: string) =>
  api.delete(`/api/cms/banners/${id}`);

// ── CMS — Pages ───────────────────────────────────────────
export const getCmsPages = () =>
  api.get("/api/cms/pages");
export const createCmsPage = (data: Record<string, unknown>) =>
  api.post("/api/cms/pages", data);
export const updateCmsPage = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/cms/pages/${id}`, data);
export const deleteCmsPage = (id: string) =>
  api.delete(`/api/cms/pages/${id}`);
export const seedAllCmsPages = () =>
  api.post("/api/cms/pages/seed-all");

// ── CMS — Sections (per-page) ─────────────────────────────
export const getCmsSections = (pageSlug?: string) =>
  api.get(`/api/cms/sections/manage${pageSlug ? `?pageSlug=${pageSlug}` : ""}`);
export const createCmsSection = (data: Record<string, unknown>) =>
  api.post("/api/cms/sections", data);
export const updateCmsSection = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/cms/sections/${id}`, data);
export const deleteCmsSection = (id: string) =>
  api.delete(`/api/cms/sections/${id}`);
export const seedCmsSections = () =>
  api.post("/api/cms/sections/seed");
export const resetSeedCmsSections = (slug: string) =>
  api.post("/api/cms/sections/reset-seed", { slug });

// ── CMS — Homepage Sections ───────────────────────────────
export const getCmsHomepageSections = () =>
  api.get("/api/cms/homepage-sections/manage");
export const createCmsHomepageSection = (data: Record<string, unknown>) =>
  api.post("/api/cms/homepage-sections", data);
export const updateCmsHomepageSection = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/cms/homepage-sections/${id}`, data);
export const deleteCmsHomepageSection = (id: string) =>
  api.delete(`/api/cms/homepage-sections/${id}`);
export const seedCmsHomepageSections = () =>
  api.post("/api/cms/homepage-sections/seed");
export const resetSeedCmsHomepageSections = () =>
  api.post("/api/cms/homepage-sections/reset-seed");

// ── CMS — Footer ──────────────────────────────────────────
export const getCmsFooterConfig = () =>
  api.get("/api/cms/footer/config");
export const updateCmsFooterConfig = (data: Record<string, unknown>) =>
  api.put("/api/cms/footer/config", data);
export const getCmsFooterSections = () =>
  api.get("/api/cms/footer/sections/manage");
export const createCmsFooterSection = (data: Record<string, unknown>) =>
  api.post("/api/cms/footer/sections", data);
export const updateCmsFooterSection = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/cms/footer/sections/${id}`, data);
export const deleteCmsFooterSection = (id: string) =>
  api.delete(`/api/cms/footer/sections/${id}`);
export const createCmsFooterLink = (data: Record<string, unknown>) =>
  api.post("/api/cms/footer/links", data);
export const updateCmsFooterLink = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/cms/footer/links/${id}`, data);
export const deleteCmsFooterLink = (id: string) =>
  api.delete(`/api/cms/footer/links/${id}`);
export const seedCmsFooter = () =>
  api.post("/api/cms/footer/seed");

// ── CMS — Site Config ─────────────────────────────────────
export const getCmsSiteConfigs = () =>
  api.get("/api/cms/site-config");
export const upsertCmsSiteConfig = (key: string, value: unknown) =>
  api.put(`/api/cms/site-config/${key}`, { value });
export const seedCmsSiteConfigs = () =>
  api.post("/api/cms/site-config/seed");

// ── CMS — Brand Banners ───────────────────────────────────
export const getCmsBrandBanners = () =>
  api.get("/api/cms/brand-banners/manage");
export const createCmsBrandBanner = (data: Record<string, unknown>) =>
  api.post("/api/cms/brand-banners", data);
export const updateCmsBrandBanner = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/cms/brand-banners/${id}`, data);
export const deleteCmsBrandBanner = (id: string) =>
  api.delete(`/api/cms/brand-banners/${id}`);

// ── Settings ──────────────────────────────────────────────
export const getSettings = (params?: Record<string, unknown>) =>
  api.get("/api/settings", { params });
export const updateSettings = (data: Record<string, unknown>) =>
  api.put("/api/settings", data);

// ── Shipping ──────────────────────────────────────────────
export const getShippingZones = (params?: Record<string, unknown>) =>
  api.get("/api/shipping-zones", { params });
export const createShippingZone = (data: Record<string, unknown>) =>
  api.post("/api/shipping-zones", data);
export const updateShippingZone = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/shipping-zones/${id}`, data);
export const deleteShippingZone = (id: string) =>
  api.delete(`/api/shipping-zones/${id}`);
export const getShipping = (params?: Record<string, unknown>) =>
  api.get("/api/shipping", { params });

// ── Locations ─────────────────────────────────────────────
export const getCountries = () =>
  api.get("/api/countries");
export const getStates = (countryId?: string) =>
  api.get(`/api/states${countryId ? `?countryId=${countryId}` : ""}`);
export const getCities = (stateId?: string) =>
  api.get(`/api/cities${stateId ? `?stateId=${stateId}` : ""}`);

// ── Credit ────────────────────────────────────────────────
export const getCreditAccounts = (params?: Record<string, unknown>) =>
  api.get("/api/credit", { params });
export const updateCreditAccount = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/credit/${id}`, data);

// ── Wallet ────────────────────────────────────────────────
export const getWalletTransactions = (params?: Record<string, unknown>) =>
  api.get("/api/wallet", { params });

// ── Wholesale ─────────────────────────────────────────────
export const getWholesaleOrders = (params?: Record<string, unknown>) =>
  api.get("/api/wholesale", { params });
export const updateWholesaleOrder = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/wholesale/${id}`, data);

// ── Wishlist ──────────────────────────────────────────────
export const getWishlists = (params?: Record<string, unknown>) =>
  api.get("/api/wishlist", { params });

// ── Notifications ─────────────────────────────────────────
export const getNotifications = (params?: Record<string, unknown>) =>
  api.get("/api/notifications", { params });
export const markNotificationRead = (id: string) =>
  api.put(`/api/notifications/${id}/read`, {});

// ── Newsletter ────────────────────────────────────────────
export const getNewsletterSubscribers = (params?: Record<string, unknown>) =>
  api.get("/api/newsletter", { params });

// ── Payments ──────────────────────────────────────────────
export const getPayments = (params?: Record<string, unknown>) =>
  api.get("/api/payments", { params });
export const getPayment = (id: string) =>
  api.get(`/api/payments/${id}`);
