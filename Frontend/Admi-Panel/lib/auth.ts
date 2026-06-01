import Cookies from "js-cookie";

const TOKEN_KEY = "kryros_admin_token";
const USER_KEY = "kryros_admin_user";
const REFRESH_KEY = "kryros_admin_refresh";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// ── Access Token ──────────────────────────────────────────────────────────────
export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, {
    expires: 1, // 1-day cookie lifespan; actual JWT expires in 15 min (self-enforced)
    sameSite: "strict",
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
  });
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  const cookie = Cookies.get(TOKEN_KEY);
  if (cookie) return cookie;
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function removeToken(): void {
  Cookies.remove(TOKEN_KEY);
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    removeRefreshToken(); // always clear refresh token together with access token
  }
}

// ── Refresh Token (long-lived, stored in localStorage) ───────────────────────
// NOTE: Refresh tokens are only ever sent to /api/auth/refresh — never to other
// endpoints. Storing in localStorage is acceptable here since we isolate usage.
export function setRefreshToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(REFRESH_KEY, token);
  }
}

export function getRefreshToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem(REFRESH_KEY);
  }
  return null;
}

export function removeRefreshToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(REFRESH_KEY);
  }
}

// ── User ──────────────────────────────────────────────────────────────────────
export function setUser(user: AdminUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getUser(): AdminUser | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
  }
  return null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function logout(): void {
  removeToken(); // clears access token, user, AND refresh token
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}
