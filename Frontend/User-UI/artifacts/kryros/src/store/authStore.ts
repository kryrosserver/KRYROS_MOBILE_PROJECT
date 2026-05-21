import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified?: boolean;
  isActive?: boolean;
  avatar?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  getMe: () => Promise<void>;
  clearError: () => void;
}

export function isAuthenticated(state: Pick<AuthState, 'token' | 'user'>): boolean {
  return !!(state.token && state.user);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      user: null,
      isLoading: false,
      error: null,

      login: async (identifier, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            const msg =
              Array.isArray(data.message)
                ? data.message.join(', ')
                : data.message || 'Invalid credentials. Please try again.';
            set({ isLoading: false, error: msg });
            return { success: false, error: msg };
          }
          set({
            token: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
            isLoading: false,
            error: null,
          });
          return { success: true };
        } catch {
          const msg = 'Network error. Please check your connection.';
          set({ isLoading: false, error: msg });
          return { success: false, error: msg };
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: data.email,
              password: data.password,
              firstName: data.firstName,
              lastName: data.lastName,
              ...(data.phone ? { phone: data.phone } : {}),
            }),
          });
          const json = await res.json().catch(() => ({}));
          if (!res.ok) {
            const msg =
              Array.isArray(json.message)
                ? json.message.join(', ')
                : json.message || 'Registration failed. Please try again.';
            set({ isLoading: false, error: msg });
            return { success: false, error: msg };
          }
          set({ isLoading: false, error: null });
          return get().login(data.email, data.password);
        } catch {
          const msg = 'Network error. Please check your connection.';
          set({ isLoading: false, error: msg });
          return { success: false, error: msg };
        }
      },

      logout: async () => {
        const { token, refreshToken } = get();
        if (token) {
          try {
            await fetch('/api/auth/logout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ refreshToken }),
            });
          } catch {
            /* ignore logout errors */
          }
        }
        set({ token: null, refreshToken: null, user: null, error: null });
      },

      getMe: async () => {
        const { token } = get();
        if (!token) return;
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            set({ token: null, refreshToken: null, user: null });
            return;
          }
          const user = await res.json();
          set({ user });
        } catch {
          /* silent */
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'kryros-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    }
  )
);
