const RAW_API = process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend-d68q.onrender.com";
export const API_URL = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api`;
export const API_BASE = API_URL;

export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "https://kryrosweb.onrender.com";

export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || "https://kryrosadminpanel-03la.onrender.com";
