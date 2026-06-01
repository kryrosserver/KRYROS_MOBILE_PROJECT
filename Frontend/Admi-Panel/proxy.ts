import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ALLOWED_ORIGINS = [
  "https://codewords.agemo.ai",
  "https://codewords-staging.agemo.ai",
  "http://localhost:3001",
];

const FRAME_ANCESTORS =
  "'self' *.agemo.ai *.codewords.run *.codewords.click *.ngrok.app *.ngrok.dev localhost:3001";

const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".ngrok.app")) return true;
  if (origin.endsWith(".ngrok.dev")) return true;
  if (origin.endsWith(".codewords.run")) return true;
  if (origin.endsWith(".codewords.click")) return true;
  return false;
};

const SKIP_PATHS = ["/_next", "/favicon.ico", "/health", "/api/health", "/api/cw-auth"];

const CODEWORDS_APP_URL =
  process.env.CODEWORDS_APP_URL || "https://codewords.agemo.ai";

const AUTH_HANDSHAKE_HTML = `<!DOCTYPE html>
<html><head><title>Authenticating...</title></head>
<body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui;color:#666">
<div style="text-align:center">
<p>Authenticating...</p>
<script>
(function() {
  var projectId = '${process.env.CODEWORDS_PROJECT_ID || ""}' || location.hostname.split('.')[0];
  window.parent.postMessage({ type: 'cw-auth-request', projectId: projectId }, '*');
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'cw-auth-token' && e.data.otk) {
      var url = new URL(location.href);
      url.searchParams.set('cw_otk', e.data.otk);
      location.href = url.toString();
    }
  });
  setTimeout(function() {
    location.href = '${CODEWORDS_APP_URL}/api/auth/preview-grant?project_id=' + projectId + '&redirect=' + encodeURIComponent(location.href);
  }, 3000);
})();
</script>
</div></body></html>`;

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (SKIP_PATHS.some((p) => pathname.startsWith(p))) {
    return addSecurityHeaders(NextResponse.next(), request);
  }

  // ── KRYROS Admin Route Protection ────────────────────────────────────────
  // Pages outside /login and /api/* require a valid admin token.
  // Runs server-side at the edge — no client-side flash possible.
  const ADMIN_PUBLIC = ['/login', '/api/', '/_next', '/favicon'];
  const needsAdminAuth = !ADMIN_PUBLIC.some((p) => pathname.startsWith(p));
  if (needsAdminAuth) {
    const adminToken = request.cookies.get('kryros_admin_token')?.value;
    if (!adminToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Handle preflight
  const origin = request.headers.get("origin");
  if (request.method === "OPTIONS" && origin && isAllowedOrigin(origin)) {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods":
          "GET, HEAD, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const previewAuth = process.env.CODEWORDS_PREVIEW_AUTH;

  // No preview auth configured → sandbox token check or public access
  if (!previewAuth) {
    const accessToken = process.env.CODEWORDS_ACCESS_TOKEN;

    // No access token configured → production deployment (Render/custom host)
    if (!accessToken) {
      // ── Phase 3: Inject Authorization header from httpOnly token cookie ─────
      // The browser sends the httpOnly 'kryros_token' cookie automatically.
      // proxy.ts reads it server-side and injects Authorization: Bearer for all
      // backend-proxied requests. JavaScript can NEVER read this cookie.
      // Falls back to legacy 'kryros_admin_token' for sessions that predate Phase 3.
      const httpOnlyToken  = request.cookies.get("kryros_token")?.value;
      const legacyToken    = request.cookies.get("kryros_admin_token")?.value;
      const bearerToken    = httpOnlyToken || legacyToken;

      const newHeaders = new Headers(request.headers);
      if (bearerToken && !newHeaders.get("Authorization")) {
        newHeaders.set("Authorization", `Bearer ${bearerToken}`);
      }

      return addSecurityHeaders(
        NextResponse.next({ request: { headers: newHeaders } }),
        request
      );
    }

    // Access token IS configured (sandbox) → require valid token
    const queryToken = searchParams.get("cw_token");
    if (queryToken === accessToken) {
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.searchParams.delete("cw_token");
      const response = NextResponse.redirect(cleanUrl);
      response.cookies.set("cw_access", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      return addSecurityHeaders(response, request);
    }

    const cookieToken = request.cookies.get("cw_access")?.value;
    if (cookieToken === accessToken) {
      return addSecurityHeaders(NextResponse.next(), request);
    }

    // No valid token → block access
    return addSecurityHeaders(
      new NextResponse("Unauthorized", { status: 401 }),
      request
    );
  }

  // === Preview auth flow ===

  // 1. Check cw_preview cookie
  const previewCookie = request.cookies.get("cw_preview")?.value;
  if (previewCookie === "1") {
    return addSecurityHeaders(NextResponse.next(), request);
  }

  // 2. Check cw_token (sandbox dev access from Cody's canvas_preview)
  const accessToken = process.env.CODEWORDS_ACCESS_TOKEN;
  if (accessToken) {
    const queryToken = searchParams.get("cw_token");
    if (queryToken === accessToken) {
      const cleanUrl = request.nextUrl.clone();
      cleanUrl.searchParams.delete("cw_token");
      const response = NextResponse.redirect(cleanUrl);
      response.cookies.set("cw_access", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      return addSecurityHeaders(response, request);
    }

    const cookieToken = request.cookies.get("cw_access")?.value;
    if (cookieToken === accessToken) {
      return addSecurityHeaders(NextResponse.next(), request);
    }
  }

  // 3. Check cw_otk (one-time key from preview-grant redirect)
  const otk = searchParams.get("cw_otk");
  if (otk) {
    // Validate OTK via ui-builder through runtime
    const runtimeUri = process.env.CODEWORDS_RUNTIME_URI;
    const projectId = process.env.CODEWORDS_PROJECT_ID || request.nextUrl.hostname.split(".")[0];

    if (runtimeUri) {
      const verifyRedirect = new URL("/api/cw-auth", request.nextUrl.origin);
      verifyRedirect.searchParams.set("otk", otk);
      verifyRedirect.searchParams.set("project_id", projectId);
      verifyRedirect.searchParams.set(
        "redirect",
        (() => {
          const cleanUrl = request.nextUrl.clone();
          cleanUrl.searchParams.delete("cw_otk");
          return cleanUrl.toString();
        })()
      );
      return NextResponse.redirect(verifyRedirect);
    }
  }

  // 4. No auth — serve handshake page for iframes, redirect for browsers
  const accept = request.headers.get("accept") || "";
  const isIframe = request.headers.get("sec-fetch-dest") === "iframe";

  if (isIframe) {
    return addSecurityHeaders(
      new NextResponse(AUTH_HANDSHAKE_HTML, {
        status: 200,
        headers: { "Content-Type": "text/html" },
      }),
      request
    );
  }

  if (!accept.includes("text/html")) {
    return addSecurityHeaders(
      new NextResponse("Unauthorized", { status: 401 }),
      request
    );
  }

  // Browser direct access → redirect to CodeWords login
  const projectId = process.env.CODEWORDS_PROJECT_ID || request.nextUrl.hostname.split(".")[0];
  const grantUrl = new URL(
    "/api/auth/preview-grant",
    CODEWORDS_APP_URL
  );
  grantUrl.searchParams.set("project_id", projectId);
  grantUrl.searchParams.set("redirect", request.nextUrl.toString());
  return NextResponse.redirect(grantUrl.toString());
}

function addSecurityHeaders(
  response: NextResponse,
  request: NextRequest
): NextResponse {
  const origin = request.headers.get("origin");

  if (origin && isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, HEAD, POST, PUT, DELETE, OPTIONS"
    );
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
  }

  response.headers.set(
    "Content-Security-Policy",
    `frame-ancestors ${FRAME_ANCESTORS}`
  );

  return response;
}

export const config = {
  matcher: "/:path*",
};
