"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type NotificationItem = {
  id: string;
  type: "order" | "payment" | "credit" | "system";
  title: string;
  message?: string;
  date: string;
  seen?: boolean;
};

type AdminSettingsState = {
  companyName: string;
  logoDataUrl: string | null;
  accentColor: string;
  theme: "light" | "dark" | "system";
  emailSettings: {
    orders: boolean;
    payments: boolean;
    credit: boolean;
  };
  pushSettings: {
    orders: boolean;
    payments: boolean;
  };
  notifications: NotificationItem[];
  unseenCount: number;
  openingTime: string;
  closingTime: string;
  isStoreClosedManual: boolean;
  closedMessage: string;
  scheduledClosures: Array<{ id: string, date: string, reason: string }>;
  setCompanyName: (s: string) => void;
  setLogoDataUrl: (d: string | null) => void;
  setAccentColor: (c: string) => void;
  setTheme: (t: "light" | "dark" | "system") => void;
  setEmailSettings: (s: { orders: boolean; payments: boolean; credit: boolean }) => void;
  setPushSettings: (s: { orders: boolean; payments: boolean }) => void;
  setOpeningTime: (s: string) => void;
  setClosingTime: (s: string) => void;
  setIsStoreClosedManual: (b: boolean) => void;
  setClosedMessage: (s: string) => void;
  setScheduledClosures: (closures: Array<{ id: string, date: string, reason: string }>) => void;
  addNotifications: (items: NotificationItem[]) => void;
  markAllRead: () => void;
};

const Ctx = createContext<AdminSettingsState | null>(null);
const LS_KEY = "kryros_admin_settings_v2";
const LS_NOTIFS = "kryros_admin_notifications";

function readLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeLS<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}

export function AdminSettingsProvider({ children }: { children: React.ReactNode }) {
  const [companyName, setCompanyName] = useState<string>("KRYROS");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState<string>("#22c55e");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [emailSettings, setEmailSettings] = useState({ orders: true, payments: true, credit: true });
  const [pushSettings, setPushSettings] = useState({ orders: true, payments: true });
  const [openingTime, setOpeningTime] = useState<string>("08:00");
  const [closingTime, setClosingTime] = useState<string>("18:00");
  const [isStoreClosedManual, setIsStoreClosedManual] = useState<boolean>(false);
  const [closedMessage, setClosedMessage] = useState<string>("We are currently closed. Please come back later.");
  const [scheduledClosures, setScheduledClosures] = useState<Array<{ id: string, date: string, reason: string }>>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const init = readLS<{
      companyName: string;
      logoDataUrl: string | null;
      accentColor: string;
      theme: "light" | "dark" | "system";
      emailSettings: { orders: boolean; payments: boolean; credit: boolean };
      pushSettings: { orders: boolean; payments: boolean };
      openingTime: string;
      closingTime: string;
      isStoreClosedManual: boolean;
      closedMessage: string;
      scheduledClosures: Array<{ id: string, date: string, reason: string }>;
    }>(LS_KEY, { 
      companyName: "KRYROS", 
      logoDataUrl: null,
      accentColor: "#22c55e",
      theme: "light",
      emailSettings: { orders: true, payments: true, credit: true },
      pushSettings: { orders: true, payments: true },
      openingTime: "08:00",
      closingTime: "18:00",
      isStoreClosedManual: false,
      closedMessage: "We are currently closed. Please come back later.",
      scheduledClosures: []
    });
    setCompanyName(init.companyName);
    setLogoDataUrl(init.logoDataUrl);
    setAccentColor(init.accentColor || "#22c55e");
    if (init.theme === "light" || init.theme === "dark" || init.theme === "system") {
      setTheme(init.theme);
    } else {
      setTheme("light");
    }
    setEmailSettings(init.emailSettings || { orders: true, payments: true, credit: true });
    setPushSettings(init.pushSettings || { orders: true, payments: true });
    setOpeningTime(init.openingTime || "08:00");
    setClosingTime(init.closingTime || "18:00");
    setIsStoreClosedManual(init.isStoreClosedManual || false);
    setClosedMessage(init.closedMessage || "We are currently closed. Please come back later.");
    setScheduledClosures(init.scheduledClosures || []);

    // Sync with backend
    fetch("/api/admin/settings")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const opening = data.find((s: any) => s.key === "opening_time")?.value;
          const closing = data.find((s: any) => s.key === "closing_time")?.value;
          const manual = data.find((s: any) => s.key === "is_store_closed_manual")?.value === "true";
          const message = data.find((s: any) => s.key === "store_closed_message")?.value;
          const scheduled = data.find((s: any) => s.key === "scheduled_closures")?.value;

          if (opening) setOpeningTime(opening);
          if (closing) setClosingTime(closing);
          if (manual !== undefined) setIsStoreClosedManual(manual);
          if (message) setClosedMessage(message);
          if (scheduled) {
            try {
              setScheduledClosures(JSON.parse(scheduled));
            } catch {}
          }
        }
      })
      .catch(() => {});

    const initNotifs = readLS<NotificationItem[]>(LS_NOTIFS, []);
    setNotifications(initNotifs);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    writeLS(LS_KEY, { 
      companyName, 
      logoDataUrl, 
      accentColor, 
      theme, 
      emailSettings, 
      pushSettings,
      openingTime,
      closingTime,
      isStoreClosedManual,
      closedMessage,
      scheduledClosures
    });
    
    // Apply theme to document
    const root = window.document.documentElement;
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Apply accent color as CSS variable
    root.style.setProperty('--accent-color', accentColor);
  }, [companyName, logoDataUrl, accentColor, theme, emailSettings, pushSettings, openingTime, closingTime, isStoreClosedManual, closedMessage, scheduledClosures, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    writeLS(LS_NOTIFS, notifications);
  }, [notifications, isLoaded]);

  const unseenCount = useMemo(() => notifications.filter(n => !n.seen).length, [notifications]);

  const addNotifications = (items: NotificationItem[]) => {
    setNotifications(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const merged = [...items.filter(i => !existingIds.has(i.id)), ...prev];
      return merged.slice(0, 50);
    });
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, seen: true })));
  };

  const value: AdminSettingsState = {
    companyName,
    logoDataUrl,
    accentColor,
    theme,
    emailSettings,
    pushSettings,
    notifications,
    unseenCount,
    openingTime,
    closingTime,
    isStoreClosedManual,
    closedMessage,
    scheduledClosures,
    setCompanyName,
    setLogoDataUrl,
    setAccentColor,
    setTheme,
    setEmailSettings,
    setPushSettings,
    setOpeningTime,
    setClosingTime,
    setIsStoreClosedManual,
    setClosedMessage,
    setScheduledClosures,
    addNotifications,
    markAllRead,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdminSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAdminSettings must be used within AdminSettingsProvider");
  return ctx;
}
