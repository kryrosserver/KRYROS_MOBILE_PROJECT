import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify, errors as joseErrors } from "jose";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

async function verifyAndExtractRole(token: string): Promise<{ role: string | null; expired: boolean }> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not configured — all admin sessions will be rejected");
      return { role: null, expired: false };
    }
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    const role = payload.role as string | undefined;
    return { role: role ?? null, expired: false };
  } catch (err) {
    if (err instanceof joseErrors.JWTExpired) {
      return { role: null, expired: true };
    }
    return { role: null, expired: false };
  }
}

function isAdminRole(role: string | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER";
}

async function attemptTokenRefresh(
  request: NextRequest,
  refreshToken: string
): Promise<{ accessToken: string; role: string | null } | null> {
  try {
    const refreshUrl = new URL("/api/auth/refresh", request.url);
    const res = await fetch(refreshUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `admin_refresh_token=${refreshToken}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json() as { success?: boolean; accessToken?: string };
    if (!data.success || !data.accessToken) return null;

    const { role } = await verifyAndExtractRole(data.accessToken);
    return { accessToken: data.accessToken, role };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const refreshToken = request.cookies.get("admin_refresh_token")?.value;
  const { pathname } = request.nextUrl;

  // ── Session inactivity timeout ─────────────────────────────────────────────
  const lastActivity = request.cookies.get("admin_last_activity")?.value;
  const now = Date.now();

  if (token && lastActivity) {
    const lastActiveAt = parseInt(lastActivity, 10);
    if (!isNaN(lastActiveAt) && now - lastActiveAt > INACTIVITY_TIMEOUT_MS) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("reason", "timeout");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.set("admin_token", "", { path: "/", maxAge: 0 });
      response.cookies.set("admin_refresh_token", "", { path: "/", maxAge: 0 });
      response.cookies.set("admin_last_activity", "", { path: "/", maxAge: 0 });
      return response;
    }
  }

  // Skip token verification for the refresh API route to avoid infinite loops
  if (pathname === "/api/auth/refresh") {
    return NextResponse.next();
  }

  let role: string | null = null;
  let refreshedToken: string | null = null;

  if (token) {
    const result = await verifyAndExtractRole(token);
    if (result.role) {
      role = result.role;
    } else if (result.expired && refreshToken) {
      // Access token expired — try silent refresh using the refresh token
      const refreshed = await attemptTokenRefresh(request, refreshToken);
      if (refreshed && isAdminRole(refreshed.role)) {
        role = refreshed.role;
        refreshedToken = refreshed.accessToken;
      }
    }
  }

  const isAdmin = isAdminRole(role);

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin" : "/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/internal")) {
    if (!isAdmin) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/login" && isAdmin) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // ── Update cookies and last activity on every authenticated request ────────
  const response = NextResponse.next();
  if (isAdmin) {
    if (refreshedToken) {
      response.cookies.set("admin_token", refreshedToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 15,
      });
    }
    response.cookies.set("admin_last_activity", String(now), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }
  return response;
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/internal/:path*",
    "/login",
    "/forgot-password",
    "/reset-password",
    "/api/auth/refresh",
  ],
  unstable_allowDynamic: ["**/node_modules/**"],
};
