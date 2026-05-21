import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE } from "@/lib/config";

export async function POST() {
  const jar = await cookies();
  const refreshToken = jar.get("admin_refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  });

  if (!res.ok) {
    const response = NextResponse.json({ error: "Session expired" }, { status: 401 });
    response.cookies.set("admin_token", "", { path: "/", maxAge: 0 });
    response.cookies.set("admin_refresh_token", "", { path: "/", maxAge: 0 });
    return response;
  }

  const data = (await res.json()) as { accessToken: string; refreshToken?: string };

  const response = NextResponse.json({ success: true });
  response.cookies.set("admin_token", data.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 15,
  });

  if (data.refreshToken) {
    response.cookies.set("admin_refresh_token", data.refreshToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return response;
}
