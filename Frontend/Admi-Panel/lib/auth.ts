import Cookies from "js-cookie";

const TOKEN_KEY = "kryros_admin_token";
const USER_KEY = "kryros_admin_user";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export function setToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, { expires: 7, sameSite: "lax" });
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
  }
}

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
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

