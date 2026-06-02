import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side route protection middleware.
 *
 * How auth works in this app:
 *   - On login, the BFF (/api/bff/login) sets two cookies:
 *       1. kryros_access  — httpOnly, Secure, SameSite=Strict (the actual JWT — JS cannot read it)
 *       2. kryros_logged_in — NOT httpOnly, Secure, SameSite=Strict (presence flag for this middleware)
 *   - JavaScript can only see kryros_logged_in.
 *   - This middleware checks kryros_logged_in to protect admin routes server-side,
 *     so unauthenticated users receive a redirect before any HTML is sent.
 *
 * If you haven't implemented the BFF routes yet, the presence check falls back to
 * verifying the kryros_access cookie directly (httpOnly cookies ARE readable in middleware).
 */

// Paths that do NOT require authentication
const PUBLIC_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]);

// Prefixes that are always allowed without auth
const PUBLIC_PREFIXES = [
  "/_next/",        // Next.js internals
  "/api/auth/",     // Auth endpoints
  "/api/bff/",      // BFF endpoints (handle own auth)
  "/api/cw-auth",   // CodeWords auth
  "/favicon.ico",
  "/images/",
  "/icons/",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without any auth check
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for auth indicator cookie (set by BFF on login)
  // Falls back to checking the httpOnly JWT cookie directly
  const isLoggedIn =
    request.cookies.has("kryros_logged_in") ||
    request.cookies.has("kryros_access");

  if (!isLoggedIn) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the original destination for post-login redirect
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except static files and API routes handled above
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
