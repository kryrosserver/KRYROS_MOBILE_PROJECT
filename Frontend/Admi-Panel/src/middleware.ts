import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

async function verifyAndExtractRole(token: string): Promise<string | null> {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not configured — all admin sessions will be rejected");
      return null;
    }
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );
    const role = payload.role as string | undefined;
    return role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const { pathname } = request.nextUrl;

  // ── Session inactivity timeout ─────────────────────────────────────────────
  // If the user has a valid token but has been inactive for more than
  // INACTIVITY_TIMEOUT_MS, clear their session and redirect to login.
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

  const role = token ? await verifyAndExtractRole(token) : null;
  const isAdmin =
    !!token &&
    (role === "ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER");

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

  // ── Update last activity timestamp on every authenticated request ─────────
  const response = NextResponse.next();
  if (isAdmin) {
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
  ],
  unstable_allowDynamic: ["**/node_modules/**"],
};
