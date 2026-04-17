const RAW_API = process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend-y1c1.onrender.com";
export const API_URL = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api`;
export const API_BASE = API_URL;

export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "https://kryros.com";

export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || "https://admin.kryros.com";
