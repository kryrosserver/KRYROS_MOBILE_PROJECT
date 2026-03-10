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
  notifications: NotificationItem[];
  unseenCount: number;
  setCompanyName: (s: string) => void;
  setLogoDataUrl: (d: string | null) => void;
  addNotifications: (items: NotificationItem[]) => void;
  markAllRead: () => void;
};

const Ctx = createContext<AdminSettingsState | null>(null);
const LS_KEY = "kryros_admin_settings";
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
  const init = readLS(LS_KEY, { companyName: "KRYROS", logoDataUrl: null as string | null });
  const [companyName, setCompanyName] = useState<string>(init.companyName);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(init.logoDataUrl);

  const initNotifs = readLS<NotificationItem[]>(LS_NOTIFS, []);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initNotifs);

  useEffect(() => {
    writeLS(LS_KEY, { companyName, logoDataUrl });
  }, [companyName, logoDataUrl]);

  useEffect(() => {
    writeLS(LS_NOTIFS, notifications);
  }, [notifications]);

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
    notifications,
    unseenCount,
    setCompanyName,
    setLogoDataUrl,
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
