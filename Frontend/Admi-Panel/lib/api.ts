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

// Auth
export const adminLogin = (identifier: string, password: string) =>
  api.post("/api/auth/login", { identifier, password });

// Dashboard data
export const getRecentOrders = (limit = 5) =>
  api.get(`/api/orders?limit=${limit}&skip=0`);
export const getTopProducts = (limit = 5) =>
  api.get(`/api/products?limit=${limit}`);
export const getRecentCustomers = (limit = 5) =>
  api.get(`/api/users?limit=${limit}&role=CUSTOMER`);

// Orders
export const getOrders = (params?: Record<string, unknown>) =>
  api.get("/api/orders", { params });
export const getOrder = (id: string) =>
  api.get(`/api/orders/${id}`);
export const updateOrder = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/orders/${id}`, data);

// Products
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

// Users
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

// Categories
export const getCategories = (params?: Record<string, unknown>) =>
  api.get("/api/categories", { params });
export const createCategory = (data: Record<string, unknown>) =>
  api.post("/api/categories", data);
export const updateCategory = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/categories/${id}`, data);
export const deleteCategory = (id: string) =>
  api.delete(`/api/categories/${id}`);

// Brands
export const getBrands = (params?: Record<string, unknown>) =>
  api.get("/api/brands", { params });
export const createBrand = (data: Record<string, unknown>) =>
  api.post("/api/brands", data);
export const updateBrand = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/brands/${id}`, data);
export const deleteBrand = (id: string) =>
  api.delete(`/api/brands/${id}`);

// Reviews
export const getReviews = (params?: Record<string, unknown>) =>
  api.get("/api/reviews", { params });
export const updateReview = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/reviews/${id}`, data);
export const deleteReview = (id: string) =>
  api.delete(`/api/reviews/${id}`);

// Services
export const getServices = (params?: Record<string, unknown>) =>
  api.get("/api/services", { params });
export const createService = (data: Record<string, unknown>) =>
  api.post("/api/services", data);
export const updateService = (id: string, data: Record<string, unknown>) =>
  api.put(`/api/services/${id}`, data);
export const deleteService = (id: string) =>
  api.delete(`/api/services/${id}`);
