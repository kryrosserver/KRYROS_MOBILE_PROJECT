import type { NextConfig } from "next";

// Require NEXT_PUBLIC_API_URL in production — never fall back to a hardcoded URL
const backendUrl = (() => {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'NEXT_PUBLIC_API_URL environment variable is required in production. ' +
        'Add it to your Render/Vercel environment variables.',
      );
    }
    // Development fallback — localhost only
    console.warn('[config] NEXT_PUBLIC_API_URL not set — defaulting to http://localhost:8080 (dev only)');
    return 'http://localhost:8080';
  }
  return raw.replace(/\/api$/, '');
})();

const nextConfig: NextConfig = {
  devIndicators: false,
  productionBrowserSourceMaps: false, // security: don't ship source maps to browsers

  // ── Security Headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Prevent MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Referrer privacy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Disable sensitive browser features
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          // Strict Content Security Policy for admin panel
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              process.env.NODE_ENV === 'production' ? "script-src 'self'" : "script-src 'self' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          // Prevent sensitive responses being cached
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' },
        ],
      },
    ];
  },

  // ── API Proxy — forward /api/* to the NestJS backend ─────────────────────
  async rewrites() {
    const proxy = (seg: string) => [
      { source: `/api/${seg}`, destination: `${backendUrl}/api/${seg}` },
      { source: `/api/${seg}/:rest*`, destination: `${backendUrl}/api/${seg}/:rest*` },
    ];

    return [
      ...proxy("auth"),
      ...proxy("orders"),
      ...proxy("products"),
      ...proxy("users"),
      ...proxy("categories"),
      ...proxy("brands"),
      ...proxy("reviews"),
      ...proxy("reports"),
      ...proxy("cms"),
      ...proxy("services"),
      ...proxy("settings"),
      ...proxy("shipping"),
      ...proxy("shipping-zones"),
      ...proxy("countries"),
      ...proxy("states"),
      ...proxy("cities"),
      ...proxy("credit"),
      ...proxy("wallet"),
      ...proxy("wholesale"),
      ...proxy("wishlist"),
      ...proxy("notifications"),
      ...proxy("newsletter"),
      ...proxy("payments"),
      ...proxy("payment-config"),
    ];
  },
};

export default nextConfig;
