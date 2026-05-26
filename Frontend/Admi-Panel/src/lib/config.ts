const RAW_API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

// If NEXT_PUBLIC_API_URL is not set, server-side fetch() calls will fail because
// Node.js cannot resolve relative URLs like "/api". Always require a full URL.
// The fallback keeps client-side code from crashing but server routes must have it set.
export const API_URL = RAW_API
  ? (RAW_API.endsWith("/api") ? RAW_API : `${RAW_API}/api`)
  : "/api";
export const API_BASE = API_URL;

/** Returns true when API_BASE is a valid absolute URL (i.e. env var is configured). */
export function isApiConfigured(): boolean {
  return RAW_API.startsWith("http");
}

export const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "https://kryros-interface.onrender.com";

export const ADMIN_URL =
  process.env.NEXT_PUBLIC_ADMIN_URL || "https://kryrosadmin-iqcj.onrender.com";
