import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("admin_token")?.value;
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = token ? "/admin" : "/login";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/admin")) {
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/login" && token) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/", "/admin/:path*", "/login"],
};
