"use client";

import { useEffect } from "react";

const ACCESS_TOKEN_LIFETIME_MS = 14 * 60 * 1000;

export default function TokenRefresher() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    async function doRefresh() {
      try {
        const res = await fetch("/api/auth/refresh", {
          method: "POST",
          cache: "no-store",
        });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (res.ok) {
          timer = setTimeout(doRefresh, ACCESS_TOKEN_LIFETIME_MS);
        }
      } catch {
        timer = setTimeout(doRefresh, 60_000);
      }
    }

    timer = setTimeout(doRefresh, ACCESS_TOKEN_LIFETIME_MS);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
