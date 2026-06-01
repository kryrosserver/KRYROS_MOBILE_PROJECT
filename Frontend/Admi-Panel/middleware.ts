import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/favicon.ico', '/_next', '/api'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths through without a token check
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Read the token from the cookie (set by lib/auth.ts on login)
  const token = req.cookies.get('kryros_admin_token')?.value;

  if (!token) {
    // No token — redirect to login, preserving where the user was going
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Apply to all routes EXCEPT static assets and Next internals
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
