"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    const bootstrap = async () => {
      if (storedToken) {
        const me = await authApi.getMe();
        if (me?.data) {
          setUser(me.data);
          localStorage.setItem('user', JSON.stringify(me.data));
        }
      }
      setIsLoading(false);
    };
    bootstrap();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await authApi.login(email, password);
    setIsLoading(false);

    if (response.error) {
      return { success: false, error: response.error };
    }

    if (response.data) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setToken(response.data.accessToken);
      setUser(response.data.user);
      return { success: true };
    }

    return { success: false, error: 'Login failed' };
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    setIsLoading(true);
    const response = await authApi.register(data);
    setIsLoading(false);

    if (response.error) {
      return { success: false, error: response.error };
    }

    if (response.data) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setToken(response.data.accessToken);
      setUser(response.data.user);
      return { success: true };
    }

    return { success: false, error: 'Registration failed' };
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
