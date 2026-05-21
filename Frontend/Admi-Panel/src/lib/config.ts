const RAW_API = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
export const API_URL = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api`;
export const API_BASE = API_URL;

export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:5000";

export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3000";
