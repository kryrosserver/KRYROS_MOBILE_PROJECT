"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/lib/api';
import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

interface User {
  id: string;
  email?: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email?: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize Firebase
  useEffect(() => {
    if (typeof window !== 'undefined' && !getApps().length && firebaseConfig.apiKey) {
      const app = initializeApp(firebaseConfig);
      const messaging = getMessaging(app);

      // Handle foreground messages
      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        // You could show a toast here
        if (Notification.permission === 'granted') {
          new Notification(payload.notification?.title || 'New Notification', {
            body: payload.notification?.body,
            icon: '/logo-pwa.png',
          });
        }
      });
    }
  }, []);

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

  // Sync FCM token when user logs in or token is received
  useEffect(() => {
    const syncFCM = (fcmToken: string, platform: string = 'android') => {
      if (token) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ token: fcmToken, platform }),
        }).catch(err => console.error('Error registering FCM token:', err));
      }
    };

    // Request Web Notification Permission and Token
    const requestWebToken = async () => {
      if (typeof window === 'undefined' || !firebaseConfig.apiKey) return;
      
      try {
        const messaging = getMessaging();
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          const currentToken = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          });
          
          if (currentToken) {
            localStorage.setItem('fcm_token_web', currentToken);
            syncFCM(currentToken, 'web');
          }
        }
      } catch (err) {
        console.error('An error occurred while retrieving token. ', err);
      }
    };

    if (token) {
      requestWebToken();
    }

    // Handle FCM Token from Mobile App
    (window as any).setFCMToken = (fcmToken: string) => {
      localStorage.setItem('fcm_token', fcmToken);
      localStorage.setItem('fcm_platform', 'android');
      syncFCM(fcmToken, 'android');
    };

    // Check if we have a token waiting to be synced
    const existingFCM = localStorage.getItem('fcm_token');
    const existingPlatform = localStorage.getItem('fcm_platform') || 'android';
    if (existingFCM && token) {
      syncFCM(existingFCM, existingPlatform);
    }
  }, [token]);

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    const response = await authApi.login(identifier, password);
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

  const register = async (data: { email?: string; password: string; firstName: string; lastName: string; phone?: string }) => {
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
