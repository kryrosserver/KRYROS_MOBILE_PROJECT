"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, getUser, setToken, setUser, removeToken, AdminUser } from "@/lib/auth";
import { adminLogin } from "@/lib/api";
import toast from "react-hot-toast";

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => false,
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await adminLogin(email, password);
      const data = res.data;
      const authToken = data.accessToken || data.token || data.jwt;
      const adminUser = data.user || data.admin || data;
      if (authToken) {
        setToken(authToken);
        const userObj: AdminUser = {
          id: adminUser?.id || adminUser?._id || "1",
          name: [adminUser?.firstName, adminUser?.lastName].filter(Boolean).join(" ") || 
                adminUser?.name || adminUser?.fullName || email.split("@")[0],
          email: adminUser?.email || email,
          role: (adminUser?.role || "SUPER_ADMIN").replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
          avatar: adminUser?.avatar || adminUser?.profileImage,
        };
        setUser(userObj);
        setTokenState(authToken);
        setUserState(userObj);
        toast.success("Welcome back!");
        return true;
      }
      toast.error("Login failed");
      return false;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Invalid credentials");
      return false;
    }
  };

  const logout = () => {
    removeToken();
    setTokenState(null);
    setUserState(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, login, logout,
      isAuthenticated: !!token,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

