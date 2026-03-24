const RAW_API = process.env.NEXT_PUBLIC_API_URL || "https://kryrosbackend-hxfp.onrender.com";
export const API_URL = RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api`;
export const API_BASE = API_URL;

export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "https://kryrosweb-dr6p.onrender.com";

export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || "https://kryrosadmin.onrender.com";
