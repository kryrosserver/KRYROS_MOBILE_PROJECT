import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

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
