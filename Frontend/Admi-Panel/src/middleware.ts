import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function extractRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const { pathname } = request.nextUrl;

  const role = token ? extractRoleFromToken(token) : null;
  const isAdmin = !!token && (role === "ADMIN" || role === "SUPER_ADMIN" || role === "MANAGER");

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = isAdmin ? "/admin" : "/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
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
  matcher: ["/", "/admin/:path*", "/login", "/forgot-password", "/reset-password"],
  unstable_allowDynamic: ["**/node_modules/**"],
};
