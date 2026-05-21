import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

export async function POST() {
  const jar = await cookies();
  const refreshToken = jar.get("admin_refresh_token")?.value;

  if (refreshToken) {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
      });
    } catch {
    }
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("admin_token", "", { path: "/", maxAge: 0 });
  res.cookies.set("admin_refresh_token", "", { path: "/", maxAge: 0 });
  return res;
}
