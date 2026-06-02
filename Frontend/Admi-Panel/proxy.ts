import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── Production vs development origin rules ────────────────────────────────────
// In production, only explicit admin-panel domains are allowed.
// Dev-tunnel domains (ngrok) are restricted to non-production environments only.
const IS_PROD = process.env.NODE_ENV === "production";

const PRODUCTION_ALLOWED_ORIGINS = [
  "https://codewords.agemo.ai",
  "https://codewords-staging.agemo.ai",
];

const DEV_ONLY_SUFFIXES = [".ngrok.app", ".ngrok.dev"];

const isAllowedOrigin = (origin: string | null): boolean => {
  if (!origin) return false;
  if (PRODUCTION_ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith(".codewords.run")) return true;
  if (origin.endsWith(".codewords.click")) return true;
  // Dev-tunnel domains — only allowed outside production
  if (!IS_PROD) {
    if (DEV_ONLY_SUFFIXES.some((s) => origin.endsWith(s))) return true;
    if (origin === "http://localhost:3001") return true;
  }
  return false;
};

// frame-ancestors: ngrok only allowed in dev
const FRAME_ANCESTORS = IS_PROD
  ? "'self' *.agemo.ai *.codewords.run *.codewords.click"
  : "'self' *.agemo.ai *.codewords.run *.codewords.click *.ngrok.app *.ngrok.dev localhost:3001";

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

// ── JWT expiry check (edge-compatible, no secret needed) ─────────────────────
// Decodes the JWT payload to read the `exp` claim without signature verification.
// The backend performs full cryptographic verification on every API call —
// this is an additional lightweight guard to redirect expired sessions immediately
// at the edge, preventing unnecessary API round-trips and page flashes.
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    // Base64url → Base64 → decode
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    if (typeof payload.exp !== "number") return false; // no exp = permanent token
    // Add 10-second clock skew tolerance
    return Date.now() / 1000 > payload.exp - 10;
  } catch {
    return true; // malformed = treat as expired → redirect to login
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (SKIP_PATHS.some((p) => pathname.startsWith(p))) {
    return addSecurityHeaders(NextResponse.next(), request);
  }

  // ── KRYROS Admin Route Protection ────────────────────────────────────────
  // Pages outside /login and /api/* require a valid, non-expired admin token.
  // Runs server-side at the edge — no client-side flash possible.
  const ADMIN_PUBLIC = ["/login", "/api/", "/_next", "/favicon"];
  const needsAdminAuth = !ADMIN_PUBLIC.some((p) => pathname.startsWith(p));
  if (needsAdminAuth) {
    const adminToken =
      request.cookies.get("kryros_token")?.value      // httpOnly cookie (set by BFF)
      || request.cookies.get("kryros_admin_token")?.value; // legacy fallback
    if (!adminToken || isTokenExpired(adminToken)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", encodeURIComponent(pathname));
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
      // ── Inject Authorization header from httpOnly token cookie ─────────────
      // The browser sends the httpOnly 'kryros_token' cookie automatically.
      // proxy.ts reads it server-side and injects Authorization: Bearer for all
      // backend-proxied requests. JavaScript can NEVER read this cookie.
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
