"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import {
  getToken, getUser, setToken, setUser, removeToken,
  setRefreshToken, getRefreshToken, removeRefreshToken,
  AdminUser
} from "@/lib/auth";
import { adminLogin } from "@/lib/api";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface LoginResult {
  success: boolean;
  requiresTwoFactor?: boolean;
  twoFactorToken?: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  completeTwoFactor: (code: string, twoFactorToken: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => ({ success: false }),
  completeTwoFactor: async () => false,
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<AdminUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    }
    setLoading(false);
  }, []);

  const buildUserObj = (adminUser: any, emailFallback: string): AdminUser => ({
    id: adminUser?.id || adminUser?._id || "1",
    name: [adminUser?.firstName, adminUser?.lastName].filter(Boolean).join(" ") ||
          adminUser?.name || adminUser?.fullName || emailFallback.split("@")[0],
    email: adminUser?.email || emailFallback,
    role: (adminUser?.role || "SUPER_ADMIN").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
    avatar: adminUser?.avatar || adminUser?.profileImage,
  });

  // ── Helpers to store tokens returned by the backend ────────────────────────
  function storeAuthTokens(data: any) {
    const accessToken = data.accessToken || data.token || data.jwt;
    const refreshToken = data.refreshToken;
    if (accessToken) setToken(accessToken);
    if (refreshToken) setRefreshToken(refreshToken);
    return accessToken;
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  const login = async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await adminLogin(email, password);
      const data = res.data;

      // 2FA is required — return pending token to caller without storing tokens yet
      if (data.requiresTwoFactor && data.twoFactorToken) {
        return { success: false, requiresTwoFactor: true, twoFactorToken: data.twoFactorToken };
      }

      const authToken = storeAuthTokens(data);
      const adminUser = data.user || data.admin || data;
      if (authToken) {
        const userObj = buildUserObj(adminUser, email);
        setUser(userObj);
        setTokenState(authToken);
        setUserState(userObj);
        toast.success("Welcome back!");
        return { success: true };
      }
      toast.error("Login failed");
      return { success: false };
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Invalid credentials");
      return { success: false };
    }
  };

  // ── Complete 2FA ───────────────────────────────────────────────────────────
  const completeTwoFactor = async (code: string, twoFactorToken: string): Promise<boolean> => {
    try {
      const res = await api.post("/api/auth/2fa/validate", { code, twoFactorToken });
      const data = res.data;
      const authToken = storeAuthTokens(data);
      const adminUser = data.user || data.admin || data;
      if (authToken) {
        const userObj = buildUserObj(adminUser, adminUser?.email || "");
        setUser(userObj);
        setTokenState(authToken);
        setUserState(userObj);
        toast.success("Welcome back!");
        return true;
      }
      return false;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Invalid 2FA code");
      return false;
    }
  };

  // ── Logout — revoke server-side refresh token, then clear client state ─────
  const logout = async () => {
    // Best-effort server revocation — fire-and-forget, don't block UI
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      axios.post("/api/auth/logout", { refreshToken }).catch(() => {
        // Ignore errors — client state is cleared regardless
      });
    }

    removeToken();      // clears access token + refresh token + user from storage
    setTokenState(null);
    setUserState(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, completeTwoFactor, logout,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
